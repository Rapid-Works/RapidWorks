'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Upload, User, Save, Loader2, Camera, AlertTriangle, Eye, EyeOff, Lock, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCommonTranslation } from '../tolgee/hooks/useCommonTranslation';
import { useProfileTranslation } from '../tolgee/hooks/useProfileTranslation';
import StandardTabs from './ui/StandardTabs';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser } from 'firebase/auth';
import { deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProfileTab = () => {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const { tField, tAction } = useCommonTranslation();
  const { t } = useProfileTranslation();
  
  // Profile Data State
  const [profileLoading, setProfileLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    photoFile: null,
    photoPreview: currentUser?.photoURL || null
  });
  const [originalFormData, setOriginalFormData] = useState(null);

  // Security State
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

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

  // Cloudinary configuration
  const cloudinaryConfig = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
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
      if (!file.type.startsWith('image/')) {
        setProfileError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('Image must be smaller than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        photoFile: file,
        photoPreview: URL.createObjectURL(file)
      }));
      setProfileError('');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setProfileError('Both first name and last name are required');
      setProfileLoading(false);
      return;
    }

    try {
      let photoURL = currentUser?.photoURL;

      if (formData.photoFile) {
        setUploadingImage(true);
        photoURL = await uploadToCloudinary(formData.photoFile);
        setUploadingImage(false);
      }

      const displayName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

      await updateUserProfile(currentUser, {
        displayName: displayName,
        photoURL: photoURL
      });

      setProfileSuccess('Profile updated successfully!');
      
      setOriginalFormData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        photoFile: null,
        photoPreview: photoURL
      });

      setTimeout(() => {
        setProfileSuccess('');
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError('Failed to update profile. Please try again.');
      setUploadingImage(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSecurityLoading(true);
    setSecurityError('');
    setSecuritySuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setSecurityError('All password fields are required');
      setSecurityLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSecurityError('New passwords do not match');
      setSecurityLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters');
      setSecurityLoading(false);
      return;
    }

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      setSecuritySuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setSecuritySuccess('');
      }, 3000);

    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        setSecurityError('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setSecurityError('New password is too weak');
      } else {
        setSecurityError('Failed to change password. Please try again.');
      }
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setSecurityError('Please enter your password to confirm account deletion');
      return;
    }

    setSecurityLoading(true);
    setSecurityError('');

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        deletePassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Delete user data from Firestore
      const userId = currentUser.uid;
      
      // Delete user document
      const userDocRef = collection(db, 'users');
      const userQuery = query(userDocRef, where('uid', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      userSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete user's organizations (if they are the owner)
      const orgsRef = collection(db, 'organizations');
      const orgsQuery = query(orgsRef, where('ownerId', '==', userId));
      const orgsSnapshot = await getDocs(orgsQuery);
      orgsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete Firebase Auth user
      await deleteUser(currentUser);

      // Logout and redirect
      await logout();
      window.location.href = '/';

    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        setSecurityError('Password is incorrect');
      } else {
        setSecurityError('Failed to delete account. Please try again.');
      }
      setSecurityLoading(false);
    }
  };

  // Profile Data Tab Content
  const profileDataContent = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <form onSubmit={handleProfileSubmit} className="space-y-6">
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
            {t('addProfilePicture')}
            <br />
            <span className="text-xs">{t('maxFileSize')}</span>
          </p>
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            {tField('firstName')} *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black"
            placeholder={t('firstNamePlaceholder')}
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            {tField('lastName')} *
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black"
            placeholder={t('lastNamePlaceholder')}
            required
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tField('email')}
          </label>
          <input
            type="email"
            value={currentUser?.email || ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('contactSupport')}
          </p>
        </div>

        {/* Error Message */}
        {profileError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {profileError}
          </div>
        )}

        {/* Success Message */}
        {profileSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {profileSuccess}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={profileLoading}
            className="flex-1 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {profileLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadingImage ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {tAction('save')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Security Tab Content
  const securityContent = (
    <div className="space-y-8">
      {/* Change Password Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-[#7C3BEC]" />
          {t('changePassword')}
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {t('currentPassword')}
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {t('newPassword')}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {tField('confirmPassword')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {securityError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {securityError}
            </div>
          )}

          {/* Success Message */}
          {securitySuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {securitySuccess}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={securityLoading}
            className="w-full bg-[#7C3BEC] hover:bg-[#6B32D6] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {securityLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('changePassword')}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Delete Account Section */}
      <div className="bg-white rounded-lg border-2 border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          {t('deleteAccount')}
        </h3>

        <p className="text-sm text-gray-700 mb-6">
          {t('deleteAccountWarning')}
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t('deleteAccountButton')}
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('currentPassword')}
              </label>
              <input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder={t('currentPassword')}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setSecurityError('');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {tAction('cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={securityLoading || !deletePassword}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {securityLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {t('deleteAccountButton')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    {
      label: t('profileData'),
      icon: <User className="h-4 w-4" />,
      content: profileDataContent
    },
    {
      label: t('security'),
      icon: <Lock className="h-4 w-4" />,
      content: securityContent
    }
  ];

  return (
    <div className="w-full">
      <StandardTabs tabs={tabs} defaultTab={0} />
    </div>
  );
};

export default ProfileTab;





