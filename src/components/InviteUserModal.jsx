'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Mail, Copy, Check, Loader2 } from 'lucide-react';
import { createInvitation } from '../utils/organizationService';
import { useAuth } from '../contexts/AuthContext';

const InviteUserModal = ({ isOpen, onClose, organization, onInviteCreated }) => {
  const { currentUser } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteEmails, setInviteEmails] = useState([]); // For multi-invite
  const [invitePermissions, setInvitePermissions] = useState({
    canRequestExperts: false,
    canSeeAllRequests: false
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [failedEmails, setFailedEmails] = useState([]);
  const [allInviteLinks, setAllInviteLinks] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setError('');
    setSuccessCount(0);
    setFailedEmails([]);

    // Parse emails (comma-separated)
    const emails = inviteEmail.split(',').map(email => email.trim()).filter(email => email);
    
    if (emails.length === 0) {
      setError('Please enter at least one valid email address.');
      setInviting(false);
      return;
    }

    setInviteEmails(emails);

    try {
      const results = [];
      
      // Create invitations for each email
      for (const email of emails) {
        try {
          const invitation = await createInvitation(
            organization.id,
            currentUser.uid,
            email,
            invitePermissions,
            {
              name: currentUser.displayName || currentUser.email,
              email: currentUser.email
            },
            isAdmin ? 'admin' : 'member'
          );
          
          results.push({ email, success: true, invitation });
          setSuccessCount(prev => prev + 1);
        } catch (error) {
          console.error(`Error creating invitation for ${email}:`, error);
          results.push({ email, success: false, error: error.message });
          setFailedEmails(prev => [...prev, email]);
        }
      }

      // Show invite links for successful invites
      const successfulInvites = results.filter(result => result.success);
      if (successfulInvites.length > 0) {
        // Store all invite links
        const inviteLinks = successfulInvites.map(result => ({
          email: result.email,
          link: result.invitation.invitationLink
        }));
        setAllInviteLinks(inviteLinks);
        
        // For single invite, show the link directly
        if (successfulInvites.length === 1) {
          setInviteLink(successfulInvites[0].invitation.invitationLink);
        }
      }

      // Clear form
      setInviteEmail('');
      setInvitePermissions({
        canRequestExperts: false,
        canSeeAllRequests: false
      });
      setIsAdmin(false);

      // Call parent callback if provided
      if (onInviteCreated) {
        onInviteCreated(results);
      }

    } catch (error) {
      console.error('Error creating invitations:', error);
      setError('Failed to create invitations. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleClose = () => {
    setInviteLink('');
    setInviteEmail('');
    setInviteEmails([]);
    setInvitePermissions({
      canRequestExperts: false,
      canSeeAllRequests: false
    });
    setIsAdmin(false);
    setError('');
    setCopiedLink(false);
    setSuccessCount(0);
    setFailedEmails([]);
    setAllInviteLinks([]);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" style={{ backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7C3BEC] rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Invite Member</h2>
              <p className="text-sm text-gray-600">Add a new member to {organization.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={inviting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {(inviteLink || allInviteLinks.length > 0) ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-2">
                  {allInviteLinks.length > 1 ? 'Invitations Created!' : 'Invitation Created!'}
                </p>
                <p className="text-green-700 text-sm mb-3">
                  {allInviteLinks.length > 1 
                    ? 'Share these links with the people you want to invite:' 
                    : 'Share this link with the person you want to invite:'}
                </p>
                
                {/* Single invite link */}
                {inviteLink && (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1 transition-colors"
                    >
                      {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedLink ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
                
                {/* Multiple invite links */}
                {allInviteLinks.length > 1 && (
                  <div className="space-y-3">
                    {allInviteLinks.map((invite, index) => (
                      <div key={index} className="bg-white border border-green-300 rounded p-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">{invite.email}</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={invite.link}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                          />
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(invite.link);
                                // You could add individual copy feedback here if needed
                              } catch (error) {
                                console.error('Failed to copy link:', error);
                              }
                            }}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Addresses *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email addresses (comma-separated for multiple)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-[#7C3BEC] outline-none transition-colors"
                    required
                    disabled={inviting}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple emails with commas (e.g., john@example.com, jane@example.com)
                </p>
              </div>

              {/* Show results if we have them */}
              {(successCount > 0 || failedEmails.length > 0) && (
                <div className="space-y-3">
                  {successCount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      {/* <p className="text-green-800 text-sm font-medium">
                        ✅ Successfully invited {successCount} member{successCount > 1 ? 's' : ''}
                      </p> */}
                    </div>
                  )}
                  {failedEmails.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm font-medium mb-1">
                        ❌ Failed to invite {failedEmails.length} member{failedEmails.length > 1 ? 's' : ''}:
                      </p>
                      <p className="text-red-700 text-xs">
                        {failedEmails.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Role & Permissions
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={isAdmin}
                      onChange={(e) => setIsAdmin(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-[#7C3BEC] focus:ring-[#7C3BEC]"
                      disabled={inviting}
                    />
                    <div>
                      <span className="text-sm text-gray-700 font-medium">Make Admin</span>
                      <p className="text-xs text-gray-500 mt-1">Give this member full administrative access to the organization</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 ${isAdmin ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isAdmin || invitePermissions.canRequestExperts}
                      onChange={(e) => setInvitePermissions(prev => ({
                        ...prev,
                        canRequestExperts: e.target.checked
                      }))}
                      className="mt-1 rounded border-gray-300 text-[#7C3BEC] focus:ring-[#7C3BEC]"
                      disabled={inviting || isAdmin}
                    />
                    <div>
                      <span className="text-sm text-gray-700 font-medium">Can Request Experts</span>
                      <p className="text-xs text-gray-500 mt-1">Allow this member to create new expert requests</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 ${isAdmin ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isAdmin || invitePermissions.canSeeAllRequests}
                      onChange={(e) => setInvitePermissions(prev => ({
                        ...prev,
                        canSeeAllRequests: e.target.checked
                      }))}
                      className="mt-1 rounded border-gray-300 text-[#7C3BEC] focus:ring-[#7C3BEC]"
                      disabled={inviting || isAdmin}
                    />
                    <div>
                      <span className="text-sm text-gray-700 font-medium">Can See All Requests</span>
                      <p className="text-xs text-gray-500 mt-1">Allow this member to view all organization requests (like an admin)</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={inviting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="flex-1 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Generate Invitation Link'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default InviteUserModal;
