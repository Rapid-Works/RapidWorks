'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Link, FileText, ExternalLink } from 'lucide-react';

const CreateTrackingLinkModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    destinationUrl: '',
    description: '',
    useBitly: true // Default to Bit.ly for production
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.destinationUrl.trim()) {
      newErrors.destinationUrl = 'Destination URL is required';
    } else {
      // Auto-add https:// if no protocol is specified for validation
      let url = formData.destinationUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Basic URL validation
      try {
        new URL(url);
        // Validation passed - URL is valid
      } catch {
        newErrors.destinationUrl = 'Please enter a valid URL (e.g., example.com or https://example.com)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Ensure URL has proper protocol before submitting
      const finalFormData = { ...formData };
      if (!finalFormData.destinationUrl.startsWith('http://') && !finalFormData.destinationUrl.startsWith('https://')) {
        finalFormData.destinationUrl = 'https://' + finalFormData.destinationUrl;
      }
      
      await onSubmit(finalFormData);
      
      // Reset form
      setFormData({
        name: '',
        destinationUrl: '',
        description: '',
        useBitly: true
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating tracking link:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div 
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
              <Link className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create Tracking Link
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Generate a trackable link with QR code for your marketing campaigns.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g. 30 Flyers for event XYZ"
                  disabled={isSubmitting}
                />
                <FileText className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="destinationUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Destination URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="destinationUrl"
                  value={formData.destinationUrl}
                  onChange={(e) => handleInputChange('destinationUrl', e.target.value)}
                  onBlur={(e) => {
                    // Auto-add https:// when user leaves the field
                    const url = e.target.value.trim();
                    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                      handleInputChange('destinationUrl', 'https://' + url);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.destinationUrl ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="example.com or https://example.com"
                  disabled={isSubmitting}
                />
                <ExternalLink className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.destinationUrl && <p className="mt-1 text-xs text-red-600">{errors.destinationUrl}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. We will hand those to people at the event."
                disabled={isSubmitting}
              />
            </div>

            {/* URL Shortening Toggle */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  !formData.useBitly ? 'bg-gray-100 text-gray-700' : 'text-gray-500'
                }`}>
                  Direct
                </span>
                <button
                  type="button"
                  onClick={() => handleInputChange('useBitly', !formData.useBitly)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    formData.useBitly ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                  disabled={isSubmitting}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      formData.useBitly ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  formData.useBitly ? 'bg-purple-100 text-purple-700' : 'text-gray-500'
                }`}>
                  Bit.ly
                </span>
              </div>
              
              <div className="text-xs text-gray-600">
                {formData.useBitly ? (
                  <div className="bg-white border border-purple-200 rounded px-2 py-1 font-mono text-sm">
                    bit.ly/abcd123
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded px-2 py-1 font-mono text-sm">
                    rapidworks.io/abcd123
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Pressing this button will create a new record with the entered name, 
                destination link and description, along with a generated tracking link, QR Code, 
                and its own Google Analytics tracking link, so you can individually track the traffic of this campaign. Later on you can still change the name and even the Destination URL of this campaign here, thus rerouting users precisely to where you want.
              </p>
              {/* <p className="text-xs text-gray-500 mt-1 italic">- System</p> */}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Generate new Tracking Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateTrackingLinkModal;
