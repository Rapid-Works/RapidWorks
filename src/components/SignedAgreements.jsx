'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle,
  FileCheck,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllSignedAgreements } from '../utils/frameworkAgreementService';
import StandardTabs, { TabContent, StandardTable } from './ui/StandardTabs';

const SignedAgreements = () => {
  useAuth();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to format dates in a readable format
  // readable date helper was unused; removed

  useEffect(() => {
    const loadAgreements = async () => {
      setLoading(true);
      setError('');

      try {
        console.log('Loading all signed agreements from Firebase...');
        const allAgreements = await getAllSignedAgreements();
        console.log('Loaded agreements:', allAgreements.length);
        
        // Transform the data to match our UI structure
        const transformedAgreements = allAgreements.map(agreement => ({
          id: agreement.id,
          type: 'Framework Agreement',
          status: 'signed',
          signedAt: agreement.signedAt,
          documentUrl: agreement.documentUrl,
          version: agreement.version || 'v1.0',
          userName: agreement.userEmail, // Use email as fallback if no display name
          userEmail: agreement.userEmail,
          userId: agreement.userId
        }));
        
        setAgreements(transformedAgreements);
      } catch (err) {
        console.error('Error loading agreements:', err);
        setError('Failed to load agreements');
      } finally {
        setLoading(false);
      }
    };

    loadAgreements();
  }, []);

  // Download removed per requirements

  const handleView = (documentUrl) => {
    if (documentUrl && documentUrl !== '#') {
      // Open in new tab for viewing
      window.open(documentUrl, '_blank');
    }
  };

  // Filter agreements based on search term
  const filteredAgreements = agreements.filter(agreement => 
    !searchTerm || 
    agreement.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agreement.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare table data
  const tableHeaders = ['Client', 'Signed Date', 'Actions'];
  const tableData = filteredAgreements.map((agreement) => [
    <div key="client">
      <div className="text-sm font-medium text-gray-900">{agreement.userName}</div>
      <div className="text-xs text-gray-500">{agreement.userEmail}</div>
    </div>,
    <div key="date" className="text-sm text-gray-500">
      {new Date(agreement.signedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })}
    </div>,
    <div key="actions" className="flex items-center gap-2 justify-end">
      <button
        onClick={() => handleView(agreement.documentUrl)}
        className="text-[#7C3BEC] hover:text-[#6B32D6] transition-colors font-medium"
      >
        View
      </button>
    </div>
  ]);

  // Empty state for the table
  const emptyState = (
    <div className="text-center py-12">
      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
      <h3 className="text-xl font-semibold text-gray-900 mb-3">No Signed Agreements</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        No clients have signed framework agreements yet. Signed agreements will appear here once clients complete the framework agreement process.
      </p>
      <div className="bg-blue-50 rounded-lg p-4 max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-blue-900 mb-1">About Framework Agreements</p>
            <p className="text-sm text-blue-700">
              Framework Agreements establish the terms for clients requesting fixed-price tasks from experts. 
              Once signed, clients can request multiple tasks without additional paperwork.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <TabContent className="p-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Agreements</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </TabContent>
    );
  }

  // Define tabs
  const tabs = [
    {
      label: 'Signed Agreements',
      icon: <FileCheck className="h-4 w-4" />,
      count: filteredAgreements.length,
      content: (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by client name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
              />
            </div>
          </div>

          <StandardTable
            headers={tableHeaders}
            data={tableData}
            loading={loading}
            emptyState={searchTerm ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matching agreements</h3>
                <p className="text-gray-600">No agreements match your search criteria.</p>
              </div>
            ) : emptyState}
          />

          {/* Summary */}
          {filteredAgreements.length > 0 && (
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              Showing {filteredAgreements.length} of {agreements.length} agreements
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Client Signed Agreements</h2>
        <p className="text-gray-600 mt-1">View and manage all client signed contracts and agreements</p>
      </div>

      {/* Tabs */}
      <StandardTabs tabs={tabs} />
    </div>
  );
};

export default SignedAgreements;