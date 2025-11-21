'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Package, AlertTriangle, Building2 } from 'lucide-react';
import { createBrandingKit } from '../utils/brandingKitService';
import { useBrandingTranslation } from '../tolgee/hooks/useBrandingTranslation';
import { useCommonTranslation } from '../tolgee/hooks/useCommonTranslation';

const CreateKitModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useBrandingTranslation();
  const { tAction } = useCommonTranslation();
  const [formData, setFormData] = useState({
    kitName: '',
    organizationName: '',
    emails: '',
    paid: false,
    ready: false
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kitName.trim()) {
      setError(t('errorKitNameRequired'));
      return;
    }

    setCreating(true);
    setError('');

    try {
      const kitData = {
        organizationName: formData.organizationName || null,
        emails: formData.emails.split(',').map(email => email.trim()).filter(email => email),
        paid: formData.paid,
        ready: formData.ready
      };

      await createBrandingKit(formData.kitName, kitData);
      onSuccess();
    } catch (err) {
      console.error('Error creating branding kit:', err);
      setError(err.message || t('errorCreateKitFailed'));
    } finally{
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7C3BEC] rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('listNewKitTitle')}</h2>
              <p className="text-sm text-gray-600">{t('listNewKitSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={creating}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kit Name with Warning */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('kitNameLabel')}
              </label>
              <input
                type="text"
                name="kitName"
                value={formData.kitName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
                placeholder={t('kitNamePlaceholder')}
                required
              />
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  {t('kitNameWarning')}
                </div>
              </div>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="inline h-4 w-4 mr-1" />
                {t('organizationNameLabel')}
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
                placeholder={t('organizationNamePlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('organizationNameHelp')}
              </p>
            </div>

            {/* Emails */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('authorizedEmailsLabel')}
              </label>
              <textarea
                name="emails"
                value={formData.emails}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent"
                placeholder={t('authorizedEmailsPlaceholder')}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('authorizedEmailsHelp')}
              </p>
            </div>

            {/* Status Checkboxes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">{t('kitStatusTitle')}</h3>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="paid"
                  checked={formData.paid}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  {t('paidLabel')}
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ready"
                  checked={formData.ready}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  {t('readyLabel')}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={creating}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                {tAction('cancel')}
              </button>
              <button
                type="submit"
                disabled={creating}
                className="bg-[#7C3BEC] hover:bg-[#6B32D6] text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('creatingKit')}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {t('createKitButton')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateKitModal;
