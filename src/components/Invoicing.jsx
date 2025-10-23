'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  FileText,
  Search,
  ExternalLink,
  Receipt,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllTaskRequests, updateInvoicePaymentStatus } from '../utils/taskRequestService';
import AdminTaskDetailsModal from './AdminTaskDetailsModal';
import StandardTabs, { TabContent, StandardTable } from './ui/StandardTabs';

const Invoicing = ({ onNavigateToTask }) => {
  useAuth(); // initialize auth context if needed (no direct usage here)
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter] = useState('all');
  
  // Modal state
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskName, setSelectedTaskName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to format dates
  // pretty date helper was unused

  // Load all accepted/completed tasks with invoice data
  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);
      setError('');

      try {
        const allTasks = await getAllTaskRequests();
        
        // Filter tasks that have been accepted/completed and have invoice data
        const invoiceableTasks = allTasks.filter(task => 
          (task.status === 'accepted' || task.status === 'completed') && 
          task.invoiceData
        );

        // Transform to invoice format
        const invoiceData = invoiceableTasks.map(task => ({
          id: task.id,
          taskName: task.taskName,
          customerName: task.invoiceData.customerName || task.userName,
          customerEmail: task.invoiceData.customerEmail || task.userEmail,
          expertName: task.expertName || 'Unassigned',
          expertEmail: task.expertEmail,
          hours: task.invoiceData.hours || 0,
          rate: task.invoiceData.rate || 0,
          price: task.invoiceData.price || 0,
          orderedAt: task.invoiceData.orderedAt,
          completedAt: task.completedAt,
          status: task.status,
          paymentStatus: task.invoiceData.paymentStatus || (task.status === 'completed' ? 'Due' : 'Pending'),
          deadline: task.invoiceData.deadline,
          taskId: task.id
        }));

        // Sort by ordered date (newest first)
        invoiceData.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
        
        setInvoices(invoiceData);
      } catch (err) {
        console.error('Error loading invoices:', err);
        setError('Failed to load invoice data');
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.expertName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      invoice.paymentStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.price, 0);
  const pendingAmount = filteredInvoices
    .filter(invoice => invoice.paymentStatus !== 'Paid')
    .reduce((sum, invoice) => sum + invoice.price, 0);

  // Payment status styling
  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Due':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle task click
  const handleTaskClick = (taskId, taskName) => {
    setSelectedTaskId(taskId);
    setSelectedTaskName(taskName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
    setSelectedTaskName('');
  };

  const handleViewChat = (taskId) => {
    if (onNavigateToTask) {
      onNavigateToTask(taskId);
    }
  };

  // Error state
  if (error) {
    return (
      <TabContent className="p-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Invoices</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </TabContent>
    );
  }

  // Prepare table data for all invoices
  const allTableHeaders = ['Task', 'Customer', 'Amount', 'Date', 'Payment', 'Actions'];
  const allTableData = filteredInvoices.map((invoice) => [
    <button
      key="task"
      onClick={() => handleTaskClick(invoice.taskId, invoice.taskName)}
      className="text-sm font-medium text-[#7C3BEC] hover:text-[#6B32D6] truncate max-w-xs text-left hover:underline transition-colors duration-200 flex items-center group"
    >
      <span className="truncate">{invoice.taskName}</span>
      <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
    </button>,
    <div key="customer">
      <div className="text-sm text-gray-900">{invoice.customerName}</div>
      <div className="text-xs text-gray-500">{invoice.customerEmail}</div>
    </div>,
    <div key="amount">
      <div className="text-sm font-semibold text-gray-900">
        €{invoice.price.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500">
        {invoice.hours}h @ €{invoice.rate}/hr
      </div>
    </div>,
    <div key="date" className="text-sm text-gray-500">
      {new Date(invoice.orderedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}
    </div>,
    <span key="payment" className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusStyle(invoice.paymentStatus)}`}>
      {invoice.paymentStatus}
    </span>,
    <div key="actions" className="flex items-center gap-2 justify-end">
      {invoice.paymentStatus !== 'Paid' && (
        <button
          onClick={async () => {
            await updateInvoicePaymentStatus(invoice.id, 'Paid');
            setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, paymentStatus: 'Paid' } : inv));
          }}
          className="px-3 py-1.5 rounded-md text-sm bg-green-600 hover:bg-green-700 text-white"
          title="Mark as paid"
        >
          Mark paid
        </button>
      )}
    </div>
  ]);

  // Filter invoices by payment status
  const paidInvoices = filteredInvoices.filter(inv => inv.paymentStatus === 'Paid');
  const pendingInvoices = filteredInvoices.filter(inv => inv.paymentStatus !== 'Paid');

  // Prepare table data for paid invoices
  const paidTableData = paidInvoices.map((invoice) => [
    <button
      key="task"
      onClick={() => handleTaskClick(invoice.taskId, invoice.taskName)}
      className="text-sm font-medium text-[#7C3BEC] hover:text-[#6B32D6] truncate max-w-xs text-left hover:underline transition-colors duration-200 flex items-center group"
    >
      <span className="truncate">{invoice.taskName}</span>
      <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
    </button>,
    <div key="customer">
      <div className="text-sm text-gray-900">{invoice.customerName}</div>
      <div className="text-xs text-gray-500">{invoice.customerEmail}</div>
    </div>,
    <div key="amount">
      <div className="text-sm font-semibold text-gray-900">
        €{invoice.price.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500">
        {invoice.hours}h @ €{invoice.rate}/hr
      </div>
    </div>,
    <div key="date" className="text-sm text-gray-500">
      {new Date(invoice.orderedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}
    </div>,
    <span key="payment" className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusStyle(invoice.paymentStatus)}`}>
      {invoice.paymentStatus}
    </span>
  ]);

  // Prepare table data for pending invoices
  const pendingTableData = pendingInvoices.map((invoice) => [
    <button
      key="task"
      onClick={() => handleTaskClick(invoice.taskId, invoice.taskName)}
      className="text-sm font-medium text-[#7C3BEC] hover:text-[#6B32D6] truncate max-w-xs text-left hover:underline transition-colors duration-200 flex items-center group"
    >
      <span className="truncate">{invoice.taskName}</span>
      <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
    </button>,
    <div key="customer">
      <div className="text-sm text-gray-900">{invoice.customerName}</div>
      <div className="text-xs text-gray-500">{invoice.customerEmail}</div>
    </div>,
    <div key="amount">
      <div className="text-sm font-semibold text-gray-900">
        €{invoice.price.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500">
        {invoice.hours}h @ €{invoice.rate}/hr
      </div>
    </div>,
    <div key="date" className="text-sm text-gray-500">
      {new Date(invoice.orderedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}
    </div>,
    <span key="payment" className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusStyle(invoice.paymentStatus)}`}>
      {invoice.paymentStatus}
    </span>,
    <div key="actions" className="flex items-center gap-2 justify-end">
      <button
        onClick={async () => {
          await updateInvoicePaymentStatus(invoice.id, 'Paid');
          setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, paymentStatus: 'Paid' } : inv));
        }}
        className="px-3 py-1.5 rounded-md text-sm bg-green-600 hover:bg-green-700 text-white"
        title="Mark as paid"
      >
        Mark paid
      </button>
    </div>
  ]);

  // Empty state
  const emptyState = (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
      <p className="text-gray-600">
        {searchTerm || statusFilter !== 'all' || monthFilter !== 'all'
          ? 'No invoices match your current filters'
          : 'No accepted orders with invoice data available yet'}
      </p>
    </div>
  );

  // Define tabs
  const tabs = [
    {
      label: 'All Invoices',
      icon: <Receipt className="h-4 w-4" />,
      count: filteredInvoices.length,
      content: (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by task, customer, or expert..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Due">Due</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <StandardTable
            headers={allTableHeaders}
            data={allTableData}
            loading={loading}
            emptyState={emptyState}
          />

          {/* Summary Footer */}
          {filteredInvoices.length > 0 && (
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              Showing {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} • 
              Total: €{totalAmount.toLocaleString()} • 
              Pending: €{pendingAmount.toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    {
      label: 'Pending',
      icon: <Clock className="h-4 w-4" />,
      count: pendingInvoices.length,
      content: (
        <StandardTable
          headers={allTableHeaders}
          data={pendingTableData}
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Invoices</h3>
              <p className="text-gray-600">All invoices have been paid!</p>
            </div>
          }
        />
      )
    },
    {
      label: 'Paid',
      icon: <CheckCircle className="h-4 w-4" />,
      count: paidInvoices.length,
      content: (
        <StandardTable
          headers={['Task', 'Customer', 'Amount', 'Date', 'Payment']}
          data={paidTableData}
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Paid Invoices</h3>
              <p className="text-gray-600">No invoices have been marked as paid yet.</p>
            </div>
          }
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
        <p className="text-gray-600 mt-1">Track and manage all client invoices and payments</p>
      </div>

      {/* Tabs */}
      <StandardTabs tabs={tabs} />

      {/* Admin Task Details Modal */}
      <AdminTaskDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        taskId={selectedTaskId}
        taskName={selectedTaskName}
        onViewChat={handleViewChat}
      />
    </div>
  );
};

export default Invoicing;