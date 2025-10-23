'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, FileText, AlertCircle, Plus, CheckCircle, XCircle } from 'lucide-react';
import { getCoachingSessions } from '../utils/coachingService';
import AddCoachingModal from './AddCoachingModal';
import StandardTabs, { TabContent, StandardTable } from './ui/StandardTabs';

const RapidCoachings = () => {
  const { currentUser } = useAuth();
  const [coachingSessions, setCoachingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCoachingSessions();
  }, [currentUser]);

  const loadCoachingSessions = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const sessions = await getCoachingSessions(currentUser.uid);
      setCoachingSessions(sessions);
    } catch (err) {
      console.error('Error loading coaching sessions:', err);
      setError('Failed to load coaching sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    loadCoachingSessions(); // Refresh the list after adding new session
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Error state
  if (error) {
    return (
      <TabContent className="p-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Sessions</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadCoachingSessions}
            className="px-4 py-2 bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors"
          >
            Try Again
          </button>
        </div>
      </TabContent>
    );
  }

  // Prepare table data for all sessions
  const allTableHeaders = ['Date', 'Duration', 'Type', 'Coach', 'Description', 'Status'];
  const allTableData = coachingSessions.map((session) => [
    <div key="date" className="flex items-center">
      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{formatDate(session.date)}</span>
    </div>,
    <div key="duration" className="flex items-center">
      <Clock className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{session.duration}</span>
    </div>,
    <span key="type" className="text-sm font-medium text-gray-900">{session.type}</span>,
    <span key="coach" className="text-sm text-gray-900">{session.coach}</span>,
    <div key="description" className="flex items-start">
      <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
      <span className="text-sm text-gray-900">{session.description}</span>
    </div>,
    <span key="status" className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
      {session.status}
    </span>
  ]);

  // Filter sessions by status
  const completedSessions = coachingSessions.filter(session => session.status === 'Completed');
  const scheduledSessions = coachingSessions.filter(session => session.status === 'Scheduled');
  const cancelledSessions = coachingSessions.filter(session => session.status === 'Cancelled');

  // Prepare table data for completed sessions
  const completedTableData = completedSessions.map((session) => [
    <div key="date" className="flex items-center">
      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{formatDate(session.date)}</span>
    </div>,
    <div key="duration" className="flex items-center">
      <Clock className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{session.duration}</span>
    </div>,
    <span key="type" className="text-sm font-medium text-gray-900">{session.type}</span>,
    <span key="coach" className="text-sm text-gray-900">{session.coach}</span>,
    <div key="description" className="flex items-start">
      <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
      <span className="text-sm text-gray-900">{session.description}</span>
    </div>
  ]);

  // Prepare table data for scheduled sessions
  const scheduledTableData = scheduledSessions.map((session) => [
    <div key="date" className="flex items-center">
      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{formatDate(session.date)}</span>
    </div>,
    <div key="duration" className="flex items-center">
      <Clock className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm text-gray-900">{session.duration}</span>
    </div>,
    <span key="type" className="text-sm font-medium text-gray-900">{session.type}</span>,
    <span key="coach" className="text-sm text-gray-900">{session.coach}</span>,
    <div key="description" className="flex items-start">
      <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
      <span className="text-sm text-gray-900">{session.description}</span>
    </div>
  ]);

  // Empty state
  const emptyState = (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No coaching sessions found</h3>
      <p className="text-gray-600 mb-4">You haven't scheduled any coaching sessions yet.</p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Session
      </button>
    </div>
  );

  // Define tabs
  const tabs = [
    {
      label: 'All Sessions',
      icon: <Calendar className="h-4 w-4" />,
      count: coachingSessions.length,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Coaching Sessions</h3>
              <p className="text-sm text-gray-600">Your complete coaching session history</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Session
            </button>
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
      label: 'Completed',
      icon: <CheckCircle className="h-4 w-4" />,
      count: completedSessions.length,
      content: (
        <StandardTable
          headers={['Date', 'Duration', 'Type', 'Coach', 'Description']}
          data={completedTableData}
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Sessions</h3>
              <p className="text-gray-600">You haven't completed any coaching sessions yet.</p>
            </div>
          }
        />
      )
    },
    {
      label: 'Scheduled',
      icon: <Clock className="h-4 w-4" />,
      count: scheduledSessions.length,
      content: (
        <StandardTable
          headers={['Date', 'Duration', 'Type', 'Coach', 'Description']}
          data={scheduledTableData}
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Sessions</h3>
              <p className="text-gray-600">You don't have any upcoming coaching sessions.</p>
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
        <h2 className="text-2xl font-bold text-gray-900">Rapid Coachings</h2>
        <p className="text-gray-600 mt-1">Your coaching session history and upcoming appointments</p>
      </div>

      {/* Tabs */}
      <StandardTabs tabs={tabs} />

      {/* Modal */}
      <AddCoachingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default RapidCoachings;