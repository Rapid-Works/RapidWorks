'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Calendar, Filter } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import StandardTabs, { StandardTable } from './ui/StandardTabs';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, verified, unverified, organization, personal
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, displayName, email, lastLogin

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const filterAndSortUsers = React.useCallback(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.organizationInfo?.organization?.name?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'organization':
        filtered = filtered.filter(user => user.organizationInfo);
        break;
      case 'personal':
        filtered = filtered.filter(user => !user.organizationInfo);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'displayName':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'lastLogin':
          const aLogin = a.lastLoginAt ? new Date(a.lastLoginAt) : new Date(0);
          const bLogin = b.lastLoginAt ? new Date(b.lastLoginAt) : new Date(0);
          return bLogin - aLogin;
        case 'createdAt':
        default:
          const aCreated = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const bCreated = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return bCreated - aCreated;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterBy, sortBy]);

  useEffect(() => {
    filterAndSortUsers();
  }, [filterAndSortUsers]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching all users with Auth metadata...');

      // Call Cloud Function to get users with Firebase Auth metadata
      const getAllUsersWithMetadata = httpsCallable(functions, 'getAllUsersWithMetadata');
      const result = await getAllUsersWithMetadata();

      if (result.data.success) {
        console.log(`📊 Fetched ${result.data.users.length} users with Auth metadata`);
        setUsers(result.data.users);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Never';
    // Handle Firestore timestamps, ISO strings, or Date objects
    const date = dateValue?.toDate?.() || new Date(dateValue);
    if (isNaN(date.getTime())) return 'Never';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Prepare table data for all users
  const allTableHeaders = ['User', 'Status', 'Joined', 'Last Login'];
  const allTableData = filteredUsers.map((user) => [
    <div key="user" className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#7C3BEC] rounded-full flex items-center justify-center">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white text-sm font-medium">
            {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 
             user.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </span>
        )}
      </div>
      <div>
        <div className="font-medium text-gray-900">
          {user.displayName || 'No name'}
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {user.email}
        </div>
      </div>
    </div>,
    <span key="status" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Active
    </span>,
    <div key="joined" className="flex items-center gap-1 text-sm text-gray-600">
      <Calendar className="h-3 w-3" />
      {formatDate(user.createdAt)}
    </div>,
    <div key="lastLogin" className="text-sm text-gray-600">
      {formatDate(user.lastLoginAt)}
    </div>
  ]);


  // Empty state
  const emptyState = (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
      <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
    </div>
  );

  // Define tabs
  const tabs = [
    {
      label: 'All Users',
      icon: <Users className="h-4 w-4" />,
      count: filteredUsers.length,
      content: (
        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="organization">Organization Users</option>
                  <option value="personal">Personal Accounts</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
              >
                <option value="createdAt">Sort by Join Date</option>
                <option value="displayName">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="lastLogin">Sort by Last Login</option>
              </select>
            </div>
          </div>

          <StandardTable
            headers={allTableHeaders}
            data={allTableData}
            loading={loading}
            emptyState={emptyState}
          />

          {/* Summary */}
          {filteredUsers.length > 0 && (
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              Showing {filteredUsers.length} of {users.length} users
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
        <h1 className="text-2xl font-semibold text-gray-900">Platform Users</h1>
        <p className="text-gray-600 mt-1">
          Manage and view all users on the platform ({filteredUsers.length} of {users.length} users)
        </p>
      </div>

      {/* Tabs */}
      <StandardTabs tabs={tabs} />
    </div>
  );
};

export default AllUsers;