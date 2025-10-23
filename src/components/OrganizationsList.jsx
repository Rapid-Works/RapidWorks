'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Users, Eye, ArrowLeft, Search } from 'lucide-react';
import { getAllOrganizations } from '../utils/organizationService';
import OrganizationDetail from './OrganizationDetail';
import StandardTabs, { TabContent, StandardTable } from './ui/StandardTabs';

const OrganizationsList = ({ onNavigateToTask, initialSelectedOrgId }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrganizations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await getAllOrganizations({ limit: 50 });
      setOrganizations(result.organizations || result); // Handle both new and old API
    } catch (err) {
      console.error('Error loading organizations:', err);
      setError('Failed to load organizations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  // Handle initial organization selection from deep link
  useEffect(() => {
    if (initialSelectedOrgId && organizations.length > 0 && !selectedOrg) {
      console.log('🔗 Auto-selecting organization from deep link:', initialSelectedOrgId);
      const targetOrg = organizations.find(org => org.id === initialSelectedOrgId);
      if (targetOrg) {
        setSelectedOrg(targetOrg);
        setView('detail');
        console.log('✅ Organization found and selected:', targetOrg.name);
      } else {
        console.log('⚠️ Organization not found:', initialSelectedOrgId);
      }
    }
  }, [initialSelectedOrgId, organizations, selectedOrg]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleOrgClick = (org) => {
    setSelectedOrg(org);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedOrg(null);
    setView('list');
  };

  // Error state
  if (error) {
    return (
      <TabContent className="p-12">
        <div className="text-center">
          <div className="text-red-600 font-medium mb-2">Error Loading Organizations</div>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button
            onClick={loadOrganizations}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </TabContent>
    );
  }

  // Detail view
  if (view === 'detail' && selectedOrg) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Organizations
          </button>
        </div>
        
        <OrganizationDetail organization={selectedOrg} onNavigateToTask={onNavigateToTask} />
      </div>
    );
  }

  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(org => 
    !searchTerm || 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.adminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare table data
  const tableHeaders = ['Organization', 'Admin', 'Location', 'Members', 'Created', 'Actions'];
  const tableData = filteredOrganizations.map((org) => [
    <div key="org" className="flex items-center">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <span className="font-medium text-gray-700 text-sm">
          {org.name?.substring(0, 2).toUpperCase() || 'OR'}
        </span>
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{org.name || 'Unnamed Organization'}</div>
        <div className="text-sm text-gray-500">ID: {org.id.substring(0, 8)}...</div>
      </div>
    </div>,
    <div key="admin" className="text-sm text-gray-900">
      <div className="font-medium">{org.adminName || 'Unknown'}</div>
      <div className="text-gray-500">{org.adminEmail || 'Unknown'}</div>
    </div>,
    <div key="location" className="text-sm text-gray-900">
      <div>{org.city || 'N/A'}</div>
      <div className="text-gray-500 text-xs">
        {org.street && `${org.street}, `}{org.postalCode || ''}
      </div>
    </div>,
    <div key="members" className="flex items-center">
      <Users className="h-4 w-4 text-gray-400 mr-2" />
      <span className="text-sm font-medium text-gray-900">
        {org.memberCount || 0}
      </span>
    </div>,
    <div key="created" className="text-sm text-gray-900">
      {formatDate(org.createdAt)}
    </div>,
    <div key="actions" className="flex items-center gap-2 justify-end">
      <button
        onClick={() => handleOrgClick(org)}
        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 transition-colors font-medium"
      >
        <Eye className="h-4 w-4" />
        View
      </button>
    </div>
  ]);

  // Empty state
  const emptyState = searchTerm ? (
    <div className="text-center py-12">
      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No matching organizations</h3>
      <p className="text-gray-600">No organizations match your search criteria.</p>
    </div>
  ) : (
    <div className="text-center py-12">
      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Found</h3>
      <p className="text-gray-600">Organizations created by customers will appear here.</p>
    </div>
  );

  // Define tabs
  const tabs = [
    {
      label: 'All Organizations',
      icon: <Building2 className="h-4 w-4" />,
      count: filteredOrganizations.length,
      content: (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by organization name, admin, or location..."
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
            emptyState={emptyState}
            onRowClick={(row, index) => handleOrgClick(filteredOrganizations[index])}
          />

          {/* Summary */}
          {filteredOrganizations.length > 0 && (
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              Showing {filteredOrganizations.length} of {organizations.length} organizations
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
        <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
        <p className="text-gray-600 mt-1">Manage customer organizations and their data</p>
      </div>

      {/* Tabs */}
      <StandardTabs tabs={tabs} />
    </div>
  );
};

export default OrganizationsList;