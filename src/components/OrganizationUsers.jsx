'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar, 
  Shield, 
  Settings,
  Trash2,
  Crown,
  User,
  LogOut,
  UserCheck,
  Clock
} from 'lucide-react';
import { 
  getOrganizationMembers, 
  updateMemberPermissions, 
  removeMember
} from '../utils/organizationService';
import InviteUserModal from './InviteUserModal';
import LeaveOrganizationModal from './LeaveOrganizationModal';
import { useAuth } from '../contexts/AuthContext';
import StandardTabs, { StandardTable } from './ui/StandardTabs';
import MIDForm from './MIDForm';
import { Building } from 'lucide-react';

const OrganizationUsers = ({ organization, currentUserPermissions, openInvite, onInviteModalClose, onOpenInviteModal, onInviteCompleted, currentContext, missingMIDFields, onFieldsUpdated, onOrganizationCreated, onNavigateToTab }) => {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [isLeaveOrgModalOpen, setIsLeaveOrgModalOpen] = useState(false);
  
  // Set active tab to "Organization Info" (index 0) if there are missing MID fields
  const [activeTabIndex, setActiveTabIndex] = useState(missingMIDFields && missingMIDFields.length > 0 ? 0 : 0);
  
  // Update active tab when missingMIDFields changes
  useEffect(() => {
    if (missingMIDFields && missingMIDFields.length > 0) {
      setActiveTabIndex(0); // Switch to Organization Info tab
    }
  }, [missingMIDFields]);

  const isAdmin = currentUserPermissions?.role === 'admin' || currentUserPermissions?.permissions?.canManageMembers;
  const isNonAdminUser = !currentUser?.email?.endsWith('@rapid-works.io');

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const orgMembers = await getOrganizationMembers(organization.id);
      setMembers(orgMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  }, [organization.id]);

  useEffect(() => {
    if (organization) {
      loadMembers();
    }
  }, [organization, loadMembers]);

  // Handle openInvite prop
  useEffect(() => {
    if (openInvite) {
      setActiveTabIndex(1); // Switch to "All Members" tab (second tab)
      setShowInviteModal(true);
    }
  }, [openInvite]);

  const handleInviteCreated = async (results) => {
    // Call parent callback to update onboarding status
    if (onInviteCompleted) {
      onInviteCompleted(results);
    }
  };

  const handleUpdatePermissions = async (permissions) => {
    try {
      await updateMemberPermissions(organization.id, selectedMember.id, permissions);
      setShowPermissionsModal(false);
      setSelectedMember(null);
      loadMembers();
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the organization?')) return;
    
    try {
      await removeMember(organization.id, memberId);
      loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare table data for all members
  const allMembersHeaders = isAdmin ? ['Member', 'Status', 'Access Level', 'Date', 'Actions'] : ['Member', 'Status', 'Access Level', 'Date'];
  const allMembersData = members.map((member) => {
    const row = [
      <div key="member" className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          member.type === 'invitation' 
            ? 'bg-orange-100' 
            : member.role === 'admin'
            ? 'bg-purple-100'
            : 'bg-gray-100'
        }`}>
          {member.type === 'invitation' ? (
            <Mail className="h-5 w-5 text-orange-600" />
          ) : member.role === 'admin' ? (
            <Crown className="h-5 w-5 text-purple-600" />
          ) : (
            <User className="h-5 w-5 text-gray-600" />
          )}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {member.userName}
          </div>
          <div className="text-sm text-gray-500">
            {member.userEmail}
            {member.type === 'invitation' && (
              <span className="text-xs text-gray-400 ml-2">
                • Invited by {member.inviterName}
              </span>
            )}
          </div>
        </div>
      </div>,
      <span key="status" className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        member.type === 'invitation' 
          ? 'bg-orange-100 text-orange-800'
          : member.role === 'admin' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        {member.type === 'invitation' 
          ? 'Pending'
          : member.role === 'admin' ? 'Admin' : 'Active'
        }
      </span>,
      <div key="access">
        {member.role === 'admin' ? (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-900">Full Access</span>
          </div>
        ) : (
          <div className="space-y-1">
            {member.permissions?.canRequestExperts && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Can request experts</span>
              </div>
            )}
            {member.permissions?.canSeeAllRequests && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Can see all requests</span>
              </div>
            )}
            {!member.permissions?.canRequestExperts && !member.permissions?.canSeeAllRequests && (
              <span className="text-sm text-gray-500">Basic access</span>
            )}
          </div>
        )}
      </div>,
      <div key="joined" className="flex items-center gap-1 text-sm text-gray-500">
        <Calendar className="h-3 w-3" />
        {formatDate(member.joinedAt)}
      </div>
    ];

    if (isAdmin) {
      row.push(
        <div key="actions">
          {member.type === 'invitation' ? (
            <span className="text-sm text-gray-400">Invitation sent</span>
          ) : member.role !== 'admin' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSelectedMember(member);
                  setShowPermissionsModal(true);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit permissions"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove member"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      );
    }

    return row;
  });

  // Filter members by type
  const activeMembers = members.filter(member => member.type !== 'invitation');
  const pendingInvitations = members.filter(member => member.type === 'invitation');

  // Prepare table data for active members
  const activeMembersData = activeMembers.map((member) => {
    const row = [
      <div key="member" className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          member.role === 'admin' ? 'bg-purple-100' : 'bg-gray-100'
        }`}>
          {member.role === 'admin' ? (
            <Crown className="h-5 w-5 text-purple-600" />
          ) : (
            <User className="h-5 w-5 text-gray-600" />
          )}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {member.userName}
          </div>
          <div className="text-sm text-gray-500">
            {member.userEmail}
          </div>
        </div>
      </div>,
      <span key="status" className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
      }`}>
        {member.role === 'admin' ? 'Admin' : 'Active'}
      </span>,
      <div key="access">
        {member.role === 'admin' ? (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-900">Full Access</span>
          </div>
        ) : (
          <div className="space-y-1">
            {member.permissions?.canRequestExperts && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Can request experts</span>
              </div>
            )}
            {member.permissions?.canSeeAllRequests && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Can see all requests</span>
              </div>
            )}
            {!member.permissions?.canRequestExperts && !member.permissions?.canSeeAllRequests && (
              <span className="text-sm text-gray-500">Basic access</span>
            )}
          </div>
        )}
      </div>,
      <div key="joined" className="flex items-center gap-1 text-sm text-gray-500">
        <Calendar className="h-3 w-3" />
        {formatDate(member.joinedAt)}
      </div>
    ];

    if (isAdmin && member.role !== 'admin') {
      row.push(
        <div key="actions" className="flex items-center gap-1">
          <button
            onClick={() => {
              setSelectedMember(member);
              setShowPermissionsModal(true);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit permissions"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleRemoveMember(member.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove member"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    } else if (isAdmin) {
      row.push(<div key="actions" className="text-sm text-gray-400">Admin</div>);
    }

    return row;
  });

  // Prepare table data for pending invitations
  const pendingInvitationsData = pendingInvitations.map((member) => [
    <div key="member" className="flex items-center">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
        <Mail className="h-5 w-5 text-orange-600" />
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">
          {member.userName}
        </div>
        <div className="text-sm text-gray-500">
          {member.userEmail}
          <span className="text-xs text-gray-400 ml-2">
            • Invited by {member.inviterName}
          </span>
        </div>
      </div>
    </div>,
    <span key="status" className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
      Pending
    </span>,
    <div key="joined" className="flex items-center gap-1 text-sm text-gray-500">
      <Calendar className="h-3 w-3" />
      {formatDate(member.invitedAt)}
    </div>
  ]);

  // Empty state
  const emptyState = (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
      <p className="text-gray-600 mb-4">Invite team members to collaborate on projects.</p>
      {isAdmin && (
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      )}
    </div>
  );


  // Define tabs
  const tabs = [
    {
      label: 'Organization Info',
      icon: <Building className="h-4 w-4" />,
      content: (
        <div>
          <MIDForm 
            currentContext={currentContext} 
            missingMIDFields={missingMIDFields || []}
            onFieldsUpdated={onFieldsUpdated || (() => {})}
            onOrganizationCreated={onOrganizationCreated || (() => {})}
            onNavigateToTab={onNavigateToTab || (() => {})}
          />
        </div>
      )
    },
    {
      label: 'All Members',
      icon: <Users className="h-4 w-4" />,
      count: members.length,
      content: (
        <div className="space-y-0">
          <StandardTable
            headers={allMembersHeaders}
            data={allMembersData}
            loading={loading}
            emptyState={emptyState}
          />
          
          {/* Invite Member Row - Outside the table for flexibility */}
          {isAdmin && allMembersData.length > 0 && (
            <div className="border-t-2 border-dashed border-gray-300 bg-white">
              <div className="flex items-center justify-center py-4 px-6">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium text-[#7C3BEC] hover:text-[#6B32D6] hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100">
                    <UserPlus className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Invite Member</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Show invite button in empty state if admin */}
          {isAdmin && allMembersData.length === 0 && !loading && (
            <div className="text-center py-8">
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Your organization
        </h2>
        {isNonAdminUser && (
          <button
            onClick={() => setIsLeaveOrgModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Leave Organization
          </button>
        )}
      </div>

      {/* Tabs */}
      <StandardTabs 
        tabs={tabs} 
        activeTabIndex={activeTabIndex}
        onTabChange={(index) => setActiveTabIndex(index)}
      />

      {/* Permissions Modal */}
      {showPermissionsModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Access Permissions
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Update permissions for {selectedMember.userName}
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Request Experts</div>
                    <div className="text-sm text-gray-500">Allow creating new expert requests</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={selectedMember.permissions?.canRequestExperts}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    onChange={(e) => {
                      setSelectedMember(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          canRequestExperts: e.target.checked
                        }
                      }));
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">View All Requests</div>
                    <div className="text-sm text-gray-500">See all organization requests, not just their own</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={selectedMember.permissions?.canSeeAllRequests}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    onChange={(e) => {
                      setSelectedMember(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          canSeeAllRequests: e.target.checked
                        }
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdatePermissions(selectedMember.permissions)}
                  className="flex-1 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          loadMembers(); // Refresh the members list when modal closes
          if (onInviteModalClose) {
            onInviteModalClose();
          }
        }}
        organization={organization}
        onInviteCreated={handleInviteCreated}
      />

      {/* Leave Organization Modal */}
      <LeaveOrganizationModal
        isOpen={isLeaveOrgModalOpen}
        onClose={() => setIsLeaveOrgModalOpen(false)}
        organization={organization}
        onLeaveSuccess={() => {
          // Refresh the page after leaving organization
          window.location.reload();
        }}
      />
    </div>
  );
};

export default OrganizationUsers;