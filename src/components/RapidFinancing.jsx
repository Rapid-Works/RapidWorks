'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Calendar, ExternalLink, AlertCircle, FileCheck, CheckCircle, Clock, XCircle, Eye, EyeOff, Edit, MoreVertical, Trash2, Key, Check, Copy, X, ArrowRight } from 'lucide-react';
import { getFinancingApplications } from '../utils/financingService';
import { getUserMIDFormSubmissions, deleteMIDFormSubmission } from '../services/midFormService';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AddFinancingModal from './AddFinancingModal';
import ApplyToMIDModal from './ApplyToMIDModal';
import MIDReviewModal from './MIDReviewModal';
import StandardTabs, { TabContent, StandardTable } from './ui/StandardTabs';

// Actions dropdown component
const ActionsMenu = ({ application, onView, onEdit, onDelete, onViewCredentials }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 192 // 192px is the width of the dropdown (w-48)
      });
    }
    setIsOpen(!isOpen);
  };

  // Check if this is a submitted MID application
  const isSubmittedMID = application.isMID && application.status === 'Submitted';

  const dropdown = isOpen && createPortal(
    <>
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={() => setIsOpen(false)}
      />
      <div 
        className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        {application.isMID ? (
          <>
            <button
              onClick={() => {
                onView();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
            {isSubmittedMID && (
              <button
                onClick={() => {
                  onViewCredentials();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                View Credentials
              </button>
            )}
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Application
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </>
        ) : (
          <>
            {application.applicationLink && (
              <a
                href={application.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <ExternalLink className="h-4 w-4" />
                View Application
              </a>
            )}
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </>
        )}
      </div>
    </>,
    document.body
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {dropdown}
    </>
  );
};

const RapidFinancing = ({ onNavigateToCompanyInfo, onNavigateToTab }) => {
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const [financingApplications, setFinancingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMIDModalOpen, setIsMIDModalOpen] = useState(false);
  const [isMIDReviewModalOpen, setIsMIDReviewModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [selectedMIDData, setSelectedMIDData] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [hasMIDSubmission, setHasMIDSubmission] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, application: null });
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    loadFinancingApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Handle deep link to view credentials
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const viewCredentials = searchParams.get('viewCredentials');
    const submissionId = searchParams.get('submissionId');
    
    if (viewCredentials === 'true' && submissionId && financingApplications.length > 0) {
      // Find the MID application with this submission ID
      const midApp = financingApplications.find(
        app => app.isMID && app.midData?.id === submissionId
      );
      
      if (midApp && midApp.status === 'Submitted') {
        // Open credentials modal automatically
        handleViewCredentials(midApp.midData);
        
        // Clean up URL parameters
        const newUrl = window.location.pathname + '?tab=financing';
        window.history.replaceState(null, '', newUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, financingApplications]);

  // Handle auto-opening MID modal from navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const openMID = searchParams.get('openMID');
    
    if (openMID === 'true' && !loading) {
      // Open MID modal automatically
      setIsMIDModalOpen(true);
      
      // Clean up URL parameter
      const newUrl = window.location.pathname + '?tab=financing';
      window.history.replaceState(null, '', newUrl);
    }
  }, [location.search, loading]);

  const loadFinancingApplications = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Fetch both financing applications and MID submissions
      const [applications, midSubmissions] = await Promise.all([
        getFinancingApplications(currentUser.uid),
        getUserMIDFormSubmissions(currentUser.uid)
      ]);
      
      // Transform MID submissions to match financing application format
      const midAsFinancing = midSubmissions.map(mid => ({
        id: mid.id,
        subsidy: 'MID (Mittelstand Innovativ Digital)',
        amount: 'Up to €15,000',
        status: mid.status === 'submitted' ? 'Submitted' : 'Pending',
        applicationDate: mid.submittedAt?.toDate?.() || mid.submittedAt || new Date(),
        description: mid.companyDescription || `MID Application - ${mid.legalName || 'Company'}`,
        applicationLink: '', // MID doesn't have external links
        isMID: true, // Flag to identify MID applications
        midData: mid // Keep original MID data for reference
      }));
      
      // Merge and sort by date (newest first)
      const allApplications = [...applications, ...midAsFinancing].sort((a, b) => 
        new Date(b.applicationDate) - new Date(a.applicationDate)
      );
      
      setFinancingApplications(allApplications);
      // Check if there's ANY MID submission (regardless of status)
      setHasMIDSubmission(midSubmissions.length > 0);
    } catch (err) {
      console.error('Error loading financing applications:', err);
      setError('Failed to load financing applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    loadFinancingApplications(); // Refresh the list after adding new application
  };

  const handleMIDModalSuccess = () => {
    // Refresh the list to show the submitted MID application
    loadFinancingApplications();
    
    // Navigate to Home tab to show next onboarding task
    if (onNavigateToTab) {
      onNavigateToTab('home');
    }
  };

  const handleViewMID = (midData) => {
    setSelectedMIDData(midData);
    setIsMIDReviewModalOpen(true);
  };

  const handleEditMID = () => {
    // Navigate to Company Information page
    if (onNavigateToCompanyInfo) {
      onNavigateToCompanyInfo();
    }
  };

  const handleDeleteApplication = (application) => {
    // Show confirmation modal
    setDeleteConfirmation({ isOpen: true, application });
  };

  const confirmDelete = async () => {
    const application = deleteConfirmation.application;
    
    try {
      if (application.isMID) {
        await deleteMIDFormSubmission(application.midData.id);
        console.log('✅ MID application deleted successfully');
      } else {
        // For regular financing applications, we'd need a delete function in financingService
        console.log('Regular application deletion not yet implemented');
        alert('Deleting regular financing applications is not yet implemented.');
        setDeleteConfirmation({ isOpen: false, application: null });
        return;
      }
      
      // Close confirmation modal
      setDeleteConfirmation({ isOpen: false, application: null });
      
      // Show success feedback
      setShowDeleteSuccess(true);
      
      // Reload data
      loadFinancingApplications();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowDeleteSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('❌ Error deleting application:', error);
      alert('Failed to delete application. Please try again.');
      setDeleteConfirmation({ isOpen: false, application: null });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatAmount = (amount) => {
    // Extract number from amount string (e.g., "Up to €15,000" -> "15000")
    const numberMatch = amount.match(/(\d+(?:,\d+)?)/);
    if (!numberMatch) return amount;
    
    const number = parseInt(numberMatch[1].replace(',', ''));
    
    // Format with German number format (dots as thousand separators)
    const formattedNumber = number.toLocaleString('de-DE');
    
    // Replace the original number in the string with formatted version
    return amount.replace(/\d+(?:,\d+)?/, formattedNumber).replace('€', '€');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Submitted':
        return 'bg-purple-100 text-purple-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewCredentials = async (midData) => {
    try {
      setCredentialsLoading(true);
      setIsCredentialsModalOpen(true);
      setShowPassword(false);
      setCopiedField(null);
      
      const functions = getFunctions();
      const decryptPassword = httpsCallable(functions, 'decryptMIDPassword');
      
      console.log('🔐 Decrypting credentials for submission:', midData.id);
      const result = await decryptPassword({ submissionId: midData.id });
      
      console.log('✅ Credentials decrypted successfully');
      setCredentials(result.data);
    } catch (error) {
      console.error('❌ Error fetching credentials:', error);
      alert('Failed to load credentials. Please try again.');
      setIsCredentialsModalOpen(false);
    } finally {
      setCredentialsLoading(false);
    }
  };

  const handleCopyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Error state
  if (error) {
    return (
      <TabContent className="p-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Applications</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadFinancingApplications}
            className="px-4 py-2 bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors"
          >
            Try Again
          </button>
      </div>
      </TabContent>
    );
  }

  // Prepare table data for all applications
  const allTableHeaders = ['Subsidy', 'Amount', 'Status', 'Application Date', 'Application Link', 'Actions'];
  const allTableData = financingApplications.map((application) => [
    <div key="subsidy" className="flex items-center">
      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm font-medium text-gray-900">{application.subsidy}</span>
    </div>,
    <span key="amount" className="text-sm font-semibold text-gray-900">{formatAmount(application.amount)}</span>,
    <span key="status" className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
      {application.status}
    </span>,
    <div key="date" className="flex items-center">
      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{formatDate(application.applicationDate)}</span>
    </div>,
    application.isMID ? (
      <a
        key="link"
        href="https://antrag.mittelstand-innovativ-digital.nrw/mid-gutscheine/login"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[#7C3BEC] hover:text-[#6B2DBD] font-medium"
      >
        MID Portal
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    ) : application.applicationLink ? (
      <a
        key="link"
        href={application.applicationLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[#7C3BEC] hover:text-[#6B2DBD] font-medium"
      >
        View Application
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    ) : (
      <span key="link" className="text-sm text-gray-400">No link</span>
    ),
    <ActionsMenu
      key="actions"
      application={application}
      onView={() => handleViewMID(application.midData)}
      onEdit={handleEditMID}
      onDelete={() => handleDeleteApplication(application)}
      onViewCredentials={() => handleViewCredentials(application.midData)}
    />
  ]);

  // Filter applications by status
  const approvedApplications = financingApplications.filter(app => app.status === 'Approved');
  const pendingApplications = financingApplications.filter(app => app.status === 'Pending' || app.status === 'Under Review');
  const rejectedApplications = financingApplications.filter(app => app.status === 'Rejected');

  // Prepare table data for approved applications
  const approvedTableHeaders = ['Subsidy', 'Amount', 'Application Date', 'Application Link', 'Actions'];
  const approvedTableData = approvedApplications.map((application) => [
    <div key="subsidy" className="flex items-center">
      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm font-medium text-gray-900">{application.subsidy}</span>
    </div>,
    <span key="amount" className="text-sm font-semibold text-gray-900">{formatAmount(application.amount)}</span>,
    <div key="date" className="flex items-center">
      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{formatDate(application.applicationDate)}</span>
    </div>,
    application.isMID ? (
      <a
        key="link"
        href="https://antrag.mittelstand-innovativ-digital.nrw/mid-gutscheine/login"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[#7C3BEC] hover:text-[#6B2DBD] font-medium"
      >
        MID Portal
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    ) : application.applicationLink ? (
      <a
        key="link"
        href={application.applicationLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[#7C3BEC] hover:text-[#6B2DBD] font-medium"
      >
        View Application
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    ) : (
      <span key="link" className="text-sm text-gray-400">No link</span>
    ),
    <ActionsMenu
      key="actions"
      application={application}
      onView={() => handleViewMID(application.midData)}
      onEdit={handleEditMID}
      onDelete={() => handleDeleteApplication(application)}
      onViewCredentials={() => handleViewCredentials(application.midData)}
    />
  ]);

  // Prepare table data for pending applications
  const pendingTableHeaders = ['Subsidy', 'Amount', 'Status', 'Application Date', 'Application Link', 'Actions'];
  const pendingTableData = pendingApplications.map((application) => [
    <div key="subsidy" className="flex items-center">
      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm font-medium text-gray-900">{application.subsidy}</span>
    </div>,
    <span key="amount" className="text-sm font-semibold text-gray-900">{formatAmount(application.amount)}</span>,
    <span key="status" className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
      {application.status}
    </span>,
    <div key="date" className="flex items-center">
      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{formatDate(application.applicationDate)}</span>
    </div>,
    application.isMID ? (
      <a
        key="link"
        href="https://antrag.mittelstand-innovativ-digital.nrw/mid-gutscheine/login"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[#7C3BEC] hover:text-[#6B2DBD] font-medium"
      >
        MID Portal
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    ) : application.applicationLink ? (
      <a
        key="link"
        href={application.applicationLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[#7C3BEC] hover:text-[#6B2DBD] font-medium"
      >
        View Application
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    ) : (
      <span key="link" className="text-sm text-gray-400">No link</span>
    ),
    <ActionsMenu
      key="actions"
      application={application}
      onView={() => handleViewMID(application.midData)}
      onEdit={handleEditMID}
      onDelete={() => handleDeleteApplication(application)}
      onViewCredentials={() => handleViewCredentials(application.midData)}
    />
  ]);

  // Prepare table data for rejected applications
  const rejectedTableHeaders = ['Subsidy', 'Amount', 'Application Date', 'Application Link', 'Actions'];
  const rejectedTableData = rejectedApplications.map((application) => [
    <div key="subsidy" className="flex items-center">
      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm font-medium text-gray-900">{application.subsidy}</span>
    </div>,
    <span key="amount" className="text-sm font-semibold text-gray-900">{formatAmount(application.amount)}</span>,
    <div key="date" className="flex items-center">
      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{formatDate(application.applicationDate)}</span>
    </div>,
    application.isMID ? (
      <a
        key="link"
        href="https://antrag.mittelstand-innovativ-digital.nrw/mid-gutscheine/login"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[#7C3BEC] hover:text-[#6B2DBD] font-medium"
      >
        MID Portal
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    ) : application.applicationLink ? (
      <a
        key="link"
        href={application.applicationLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[#7C3BEC] hover:text-[#6B2DBD] font-medium"
      >
        View Application
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    ) : (
      <span key="link" className="text-sm text-gray-400">No link</span>
    ),
    <ActionsMenu
      key="actions"
      application={application}
      onView={() => handleViewMID(application.midData)}
      onEdit={handleEditMID}
      onDelete={() => handleDeleteApplication(application)}
      onViewCredentials={() => handleViewCredentials(application.midData)}
    />
  ]);

  // Empty state
  const emptyState = (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No financing applications found</h3>
      <p className="text-gray-600 mb-4">You haven't submitted any financing or subsidy applications yet.</p>
      <button
        onClick={() => setIsMIDModalOpen(true)}
        disabled={hasMIDSubmission}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm ${
          hasMIDSubmission 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
        }`}
      >
        <FileCheck className="h-4 w-4" />
        {hasMIDSubmission ? 'Already Applied to MID' : 'Apply to MID'}
      </button>
    </div>
  );

  // Define tabs
  const tabs = [
    {
      label: 'All Applications',
      icon: <DollarSign className="h-4 w-4" />,
      count: financingApplications.length,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
        <div>
              <h3 className="text-lg font-semibold text-gray-900">All Financing Applications</h3>
              <p className="text-sm text-gray-600">Your complete subsidy and financing application history</p>
        </div>
            <div className="flex items-center gap-3">
        <button
                onClick={() => setIsMIDModalOpen(true)}
                disabled={hasMIDSubmission}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm ${
                  hasMIDSubmission 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                }`}
              >
                <FileCheck className="h-4 w-4" />
                {hasMIDSubmission ? 'Already Applied to MID' : 'Apply to MID'}
              </button>
              {/* Commented out Add Application button - users should use Apply to MID */}
              {/* <button
          onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors"
        >
              <Plus className="h-4 w-4" />
          Add Application
              </button> */}
            </div>
      </div>

          <StandardTable
            headers={allTableHeaders}
            data={allTableData}
            loading={loading}
            emptyState={emptyState}
          />
        </div>
      )
    },
    {
      label: 'Approved',
      icon: <CheckCircle className="h-4 w-4" />,
      count: approvedApplications.length,
      content: (
        <StandardTable
          headers={approvedTableHeaders}
          data={approvedTableData}
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Applications</h3>
              <p className="text-gray-600">You don't have any approved financing applications yet.</p>
            </div>
          }
        />
      )
    },
    {
      label: 'Pending',
      icon: <Clock className="h-4 w-4" />,
      count: pendingApplications.length,
      content: (
        <StandardTable
          headers={pendingTableHeaders}
          data={pendingTableData}
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Applications</h3>
              <p className="text-gray-600">You don't have any pending financing applications.</p>
            </div>
          }
        />
      )
    },
    {
      label: 'Rejected',
      icon: <XCircle className="h-4 w-4" />,
      count: rejectedApplications.length,
      content: (
        <StandardTable
          headers={rejectedTableHeaders}
          data={rejectedTableData}
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Applications</h3>
              <p className="text-gray-600">You don't have any rejected financing applications.</p>
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
        <h2 className="text-2xl font-bold text-gray-900">Rapid Financing</h2>
        <p className="text-gray-600 mt-1">Your subsidy and financing application history</p>
      </div>

      {/* Tabs */}
      <StandardTabs tabs={tabs} />

      {/* Success Toast */}
      {showDeleteSuccess && createPortal(
        <div className="fixed bottom-6 right-6 z-[99999] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 border border-green-500">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Application Deleted Successfully!</p>
              <p className="text-sm text-green-100">The application has been removed from your list.</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && createPortal(
        <div className="fixed inset-0 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Application?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {deleteConfirmation.application?.isMID 
                ? 'Are you sure you want to delete this MID application? This action cannot be undone.'
                : 'Are you sure you want to delete this financing application? This action cannot be undone.'}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmation({ isOpen: false, application: null })}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modals */}
      <AddFinancingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
      
      <ApplyToMIDModal
        isOpen={isMIDModalOpen}
        onClose={() => setIsMIDModalOpen(false)}
        onSuccess={handleMIDModalSuccess}
        onNavigateToCompanyInfo={onNavigateToCompanyInfo}
        hasMIDSubmission={hasMIDSubmission}
      />

      <MIDReviewModal
        isOpen={isMIDReviewModalOpen}
        onClose={() => setIsMIDReviewModalOpen(false)}
        midData={selectedMIDData}
      />

      {/* Credentials Modal */}
      {isCredentialsModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#7C3BEC] to-[#9F7AEA] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">MID Login</h3>
                    <p className="text-xs text-white/80">Your portal credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsCredentialsModalOpen(false);
                    setCredentials(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {credentialsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 text-sm">Decrypting credentials...</p>
                </div>
              ) : credentials ? (
                <div className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={credentials.email}
                        className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                      <button
                        onClick={() => handleCopyToClipboard(credentials.email, 'email')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Copy email"
                      >
                        {copiedField === 'email' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Username Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={credentials.username}
                        className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                      <button
                        onClick={() => handleCopyToClipboard(credentials.username, 'username')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Copy username"
                      >
                        {copiedField === 'username' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        readOnly
                        value={credentials.password}
                        className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-purple-600 transition-colors p-1"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyToClipboard(credentials.password, 'password')}
                          className="text-gray-400 hover:text-purple-600 transition-colors p-1"
                          title="Copy password"
                        >
                          {copiedField === 'password' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      setIsCredentialsModalOpen(false);
                      onNavigateToTab('home');
                    }}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#7C3BEC] to-[#9F7AEA] text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium"
                  >
                    Go to Home
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">Failed to load credentials</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RapidFinancing;