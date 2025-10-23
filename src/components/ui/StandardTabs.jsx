'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StandardTabs = ({ 
  tabs, 
  defaultTab = 0, 
  onTabChange,
  className = "",
  tabClassName = "",
  contentClassName = ""
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onTabChange) {
      onTabChange(index, tabs[index]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === index
                  ? 'border-[#7C3BEC] text-[#7C3BEC]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${tabClassName}`}
            >
              <div className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === index
                      ? 'bg-[#7C3BEC]/10 text-[#7C3BEC]'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className={`${contentClassName}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {tabs[activeTab]?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Reusable TabContent component for consistent styling
export const TabContent = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Reusable Table component with consistent styling
export const StandardTable = ({ 
  headers, 
  data, 
  loading = false, 
  emptyState,
  className = "",
  onRowClick
}) => {
  if (loading) {
    return (
      <TabContent className="p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3BEC]"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </TabContent>
    );
  }

  if (!data || data.length === 0) {
    return (
      <TabContent className="p-12">
        <div className="text-center">
          {emptyState || (
            <>
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-500">There are no items to display at this time.</p>
            </>
          )}
        </div>
      </TabContent>
    );
  }

  return (
    <TabContent className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr 
                key={index}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                onClick={() => onRowClick && onRowClick(row, index)}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TabContent>
  );
};

export default StandardTabs;
