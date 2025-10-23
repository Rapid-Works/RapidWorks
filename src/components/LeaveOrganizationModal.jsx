'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { leaveOrganization } from '../utils/organizationService';
import { useAuth } from '../contexts/AuthContext';

const LeaveOrganizationModal = ({ isOpen, onClose, organization, onLeaveSuccess }) => {
  const { currentUser } = useAuth();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState('');

  const handleLeave = async () => {
    if (!currentUser || !organization) return;

    setIsLeaving(true);
    setError('');

    try {
      await leaveOrganization(currentUser.uid, organization.id);
      // Only call success callback and close if leave was successful
      onLeaveSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error leaving organization:', error);
      setError(error.message || 'Failed to leave organization. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="bg-white rounded-lg shadow-lg max-w-sm w-full"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Organization</h3>
            <p className="text-sm text-gray-600 mb-4">
              You'll lose access to all organization resources.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLeaving}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                disabled={isLeaving}
                className="flex-1 px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLeaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  'Leave'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeaveOrganizationModal;
