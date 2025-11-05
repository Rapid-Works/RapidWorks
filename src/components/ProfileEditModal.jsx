'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, User, Save, Loader2, Camera, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMIDTranslation } from '../hooks/useMIDTranslation';

const ProfileEditModal = ({ isOpen, onClose, onProfileCompleted }) => {
  const { currentUser, updateUserProfile } = useAuth();
  const { t } = useMIDTranslation();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    photoFile: null,
    photoPreview: currentUser?.photoURL || null
  });
  const [originalFormData, setOriginalFormData] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState(null);

  // Initialize first and last name from display name
  useEffect(() => {
    if (currentUser?.displayName) {
      const nameParts = currentUser.displayName.split(' ');
      const initialData = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        photoFile: null,
        photoPreview: currentUser?.photoURL || null
      };
      setFormData(initialData);
      setOriginalFormData(initialData);
    }
  }, [currentUser]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!originalFormData) return false;
    
    const nameChanged = formData.firstName !== originalFormData.firstName || 
                       formData.lastName !== originalFormData.lastName;
    const photoChanged = formData.photoFile !== null;
    
    return nameChanged || photoChanged;
  }, [formData, originalFormData]);

  // Handle browser beforeunload
  useEffect(() => {
    if (!hasChanges || !isOpen) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, isOpen]);

  // Cloudinary configuration
  const cloudinaryConfig = {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);

    try {
      const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error during upload:", error);
      throw error;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        photoFile: file,
        photoPreview: URL.createObjectURL(file)
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate first and last name
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Both first name and last name are required');
      setLoading(false);
      return;
    }

    try {
      let photoURL = currentUser?.photoURL;

      // Upload new image if one was selected
      if (formData.photoFile) {
        setUploadingImage(true);
        photoURL = await uploadToCloudinary(formData.photoFile);
        setUploadingImage(false);
      }

      // Combine first and last name for displayName
      const displayName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

      // Update Firebase Auth profile
      await updateUserProfile(currentUser, {
        displayName: displayName,
        photoURL: photoURL
      });

      setSuccess('Profile updated successfully!');
      
      // Update original form data to reflect saved state
      setOriginalFormData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        photoFile: null,
        photoPreview: photoURL
      });
      
      // Notify parent that profile is completed
      if (onProfileCompleted) {
        onProfileCompleted();
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      setUploadingImage(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Check if user can leave
  const checkCanLeave = (action) => {
    if (!hasChanges) {
      if (action) action();
      return true;
    }

    setPendingCloseAction(() => action);
    setShowLeaveConfirm(true);
    return false;
  };

  // Handle confirmed leave
  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    setFormData(originalFormData || {
      firstName: currentUser?.displayName?.split(' ')[0] || '',
      lastName: currentUser?.displayName?.split(' ').slice(1).join(' ') || '',
      photoFile: null,
      photoPreview: currentUser?.photoURL || null
    });
    if (pendingCloseAction) {
      pendingCloseAction();
      setPendingCloseAction(null);
    }
  };

  // Handle cancel leave
  const handleCancelLeave = () => {
    setShowLeaveConfirm(false);
    setPendingCloseAction(null);
  };

  // Handle close button/backdrop click
  const handleClose = () => {
    checkCanLeave(() => {
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl w-full max-w-lg mx-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">{t('onboarding.profile.title')}</h2>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {formData.photoPreview ? (
                      <img
                        src={formData.photoPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#7C3BEC] flex items-center justify-center">
                        <User className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload button overlay */}
                  <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                    <Camera className="h-4 w-4" />
                  </label>
                  
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                <p className="text-sm text-gray-500 text-center">
                  {t('onboarding.profile.addProfilePicture')}
                  <br />
                  <span className="text-xs">{t('onboarding.profile.maxFileSize')}</span>
                </p>
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.profile.firstName')} *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
                  placeholder={t('onboarding.profile.firstNamePlaceholder')}
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.profile.lastName')} *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
                  placeholder={t('onboarding.profile.lastNamePlaceholder')}
                  required
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.profile.email')}
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('onboarding.profile.contactSupport')}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('onboarding.profile.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {uploadingImage ? 'Uploading...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {t('onboarding.profile.save')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[99999] p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h3 className="text-xl font-bold text-gray-900">
                  {t('unsavedChanges.title')}
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                {t('unsavedChanges.message')}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelLeave}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  {t('unsavedChanges.cancel')}
                </button>
                <button
                  onClick={handleConfirmLeave}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  {t('unsavedChanges.leave')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileEditModal; 