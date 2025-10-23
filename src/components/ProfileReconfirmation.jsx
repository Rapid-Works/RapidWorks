'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Edit, User, Building, MapPin, Mail, Phone } from 'lucide-react';
import { useMIDTranslation } from '../hooks/useMIDTranslation';

const ProfileReconfirmation = ({ userProfile, onConfirm, onEdit, onCancel }) => {
  const { t } = useMIDTranslation();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(userProfile);
    } catch (error) {
      console.error('Error confirming profile:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm">⚠</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              {t('reconfirmationTitle')}
            </h2>
            <p className="text-sm text-yellow-700">
              {t('reconfirmationDescription')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('currentProfile')}</h3>
          <p className="text-sm text-gray-500">{t('profileLastUpdated')}: {new Date(userProfile.lastUpdated || Date.now()).toLocaleDateString()}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('personalInformation')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('firstName')}</label>
                <p className="text-gray-900">{userProfile.firstName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('lastName')}</label>
                <p className="text-gray-900">{userProfile.lastName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('email')}</label>
                <p className="text-gray-900">{userProfile.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('phone')}</label>
                <p className="text-gray-900">{userProfile.contactPhone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Building className="h-4 w-4" />
              {t('companyInformation')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('legalName')}</label>
                <p className="text-gray-900">{userProfile.legalName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('companyType')}</label>
                <p className="text-gray-900">{t(`companyTypeOptions.${userProfile.companyType}`) || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('industry')}</label>
                <p className="text-gray-900">{t(`industryOptions.${userProfile.industry}`) || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('employees')}</label>
                <p className="text-gray-900">{userProfile.employees || '-'}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('addressInformation')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('street')}</label>
                <p className="text-gray-900">{userProfile.street || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('city')}</label>
                <p className="text-gray-900">{userProfile.city || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('postalCode')}</label>
                <p className="text-gray-900">{userProfile.postalCode || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('country')}</label>
                <p className="text-gray-900">{t(`countryOptions.${userProfile.country}`) || '-'}</p>
              </div>
            </div>
          </div>

          {/* Digital Signature Confirmation */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">{t('digitalSignatureTitle')}</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-4">
                {t('reconfirmationSignatureText')}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('signatureTimestamp')}: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('editProfile')}
          </button>
          <motion.button
            onClick={handleConfirm}
            disabled={isConfirming}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors flex items-center gap-2 ${
              isConfirming ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isConfirming ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isConfirming ? t('confirming') : t('confirmAndSign')}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProfileReconfirmation;
