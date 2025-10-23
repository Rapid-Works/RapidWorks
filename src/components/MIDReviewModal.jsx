'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Building, User, MapPin, CreditCard, FileText, Briefcase } from 'lucide-react';

const MIDReviewModal = ({ isOpen, onClose, midData }) => {
  if (!isOpen || !midData) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 px-8 py-6 flex items-center justify-between border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">MID Application Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-150px)] space-y-6">
          {/* Company Information */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Company Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Legal Name" value={midData.legalName} />
              <InfoItem label="Company Type" value={midData.companyType} />
              <InfoItem label="Industry" value={midData.industry} />
              <InfoItem label="Company Category" value={midData.companyCategory} />
              <InfoItem label="Employees" value={midData.employees} />
              <InfoItem label="Founding Year" value={midData.foundingYear} />
              <InfoItem label="Homepage" value={midData.homepage} />
              <InfoItem label="Tax ID" value={midData.taxId} />
            </div>
            <div className="mt-4">
              <InfoItem label="Company Description" value={midData.companyDescription} fullWidth />
            </div>
          </div>

          {/* Contact Information */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="First Name" value={midData.firstName} />
              <InfoItem label="Last Name" value={midData.lastName} />
              <InfoItem label="Email" value={midData.email} />
            </div>
          </div>

          {/* Address */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Address</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Street" value={midData.street} />
              <InfoItem label="City" value={midData.city} />
              <InfoItem label="Postal Code" value={midData.postalCode} />
              <InfoItem label="Country" value={midData.country} />
            </div>
          </div>

          {/* Banking Information */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Banking Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="IBAN" value={midData.iban} />
              <InfoItem label="BIC" value={midData.bic} />
              <InfoItem label="Bank Name" value={midData.bankName} />
              <InfoItem label="Account Holder" value={midData.accountHolderName} />
            </div>
          </div>

          {/* Status Badge */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Application Status</h3>
              </div>
              <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${
                midData.status === 'submitted' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {midData.status === 'submitted' ? 'Submitted' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Helper component for displaying information
const InfoItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? 'col-span-full' : ''}>
    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-sm text-gray-900">{value || 'N/A'}</p>
  </div>
);

export default MIDReviewModal;


