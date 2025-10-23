'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Calendar, User, Building, AlertCircle, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getAllMIDFormSubmissions } from '../services/midFormService';
import StandardTabs, { TabContent, StandardTable } from './ui/StandardTabs';

const MIDSubmissions = ({ onViewSubmission }) => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, [currentUser]);

  const loadSubmissions = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const allSubmissions = await getAllMIDFormSubmissions();
      console.log('📋 Loaded submissions:', allSubmissions.length);
      console.log('📋 Submission IDs:', allSubmissions.map(s => s.id));
      setSubmissions(allSubmissions);
    } catch (err) {
      console.error('Error loading MID submissions:', err);
      setError('Failed to load MID submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'pending') return 'Under Review';
    if (status === 'submitted') return 'Submitted';
    return status || 'pending';
  };

  const handleViewSubmission = (submission) => {
    console.log('🔍 MIDSubmissions: View button clicked, calling onViewSubmission with:', submission);
    onViewSubmission(submission);
  };

  // Error state
  if (error) {
    return (
      <TabContent className="p-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Submissions</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSubmissions}
            className="px-4 py-2 bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors"
          >
            Try Again
          </button>
        </div>
      </TabContent>
    );
  }

  // Prepare table data for all submissions
  const allTableHeaders = ['Submitted', 'Company', 'Contact', 'Email', 'Status', 'Actions'];
  const allTableData = submissions.map((submission) => [
    <div key="date" className="flex items-center">
      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{formatDate(submission.submittedAt)}</span>
    </div>,
    <div key="company" className="flex items-center">
      <Building className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm font-medium text-gray-900">{submission.legalName || 'N/A'}</span>
    </div>,
    <div key="contact" className="flex items-center">
      <User className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{submission.firstName} {submission.lastName}</span>
    </div>,
    <span key="email" className="text-sm text-gray-900">{submission.email}</span>,
    <span key="status" className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status || 'pending')}`}>
      {getStatusLabel(submission.status)}
    </span>,
    <button
      key="actions"
      onClick={() => handleViewSubmission(submission)}
      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#7C3BEC] hover:text-[#6B32D6] hover:bg-purple-50 rounded-md transition-colors"
    >
      <Eye className="h-3 w-3" />
      View
    </button>
  ]);

  // Filter submissions by status
  const pendingSubmissions = submissions.filter(submission => submission.status === 'pending');
  const reviewedSubmissions = submissions.filter(submission => submission.status === 'reviewed');
  const rejectedSubmissions = submissions.filter(submission => submission.status === 'rejected');

  // Prepare table data for pending submissions
  const pendingTableData = pendingSubmissions.map((submission) => [
    <div key="date" className="flex items-center">
      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{formatDate(submission.submittedAt)}</span>
    </div>,
    <div key="company" className="flex items-center">
      <Building className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm font-medium text-gray-900">{submission.legalName || 'N/A'}</span>
    </div>,
    <div key="contact" className="flex items-center">
      <User className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{submission.firstName} {submission.lastName}</span>
    </div>,
    <span key="email" className="text-sm text-gray-900">{submission.email}</span>,
    <button
      key="actions"
      onClick={() => handleViewSubmission(submission)}
      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#7C3BEC] hover:text-[#6B32D6] hover:bg-purple-50 rounded-md transition-colors"
    >
      <Eye className="h-3 w-3" />
      View
    </button>
  ]);

  // Empty state
  const emptyState = (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No MID submissions found</h3>
      <p className="text-gray-600">No MID form submissions have been received yet.</p>
    </div>
  );

  // Define tabs
  const tabs = [
    {
      label: 'All Submissions',
      icon: <FileText className="h-4 w-4" />,
      count: submissions.length,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All MID Submissions</h3>
              <p className="text-sm text-gray-600">Complete list of all MID form submissions</p>
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
      label: 'Pending',
      icon: <Clock className="h-4 w-4" />,
      count: pendingSubmissions.length,
      content: (
        <StandardTable
          headers={['Submitted', 'Company', 'Contact', 'Email', 'Actions']}
          data={pendingTableData}
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Forms</h3>
              <p className="text-gray-600">No pending MID forms found.</p>
            </div>
          }
        />
      )
    },
    {
      label: 'Reviewed',
      icon: <CheckCircle className="h-4 w-4" />,
      count: reviewedSubmissions.length,
      content: (
        <StandardTable
          headers={['Submitted', 'Company', 'Contact', 'Email', 'Actions']}
          data={[]} // Add reviewed table data if needed
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviewed Forms</h3>
              <p className="text-gray-600">No reviewed MID forms found.</p>
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
        <h2 className="text-2xl font-bold text-gray-900">MID Submissions</h2>
        <p className="text-gray-600 mt-1">Manage and review all MID form submissions</p>
      </div>

      {/* Tabs */}
      <StandardTabs tabs={tabs} />

    </div>
  );
};

export default MIDSubmissions;
