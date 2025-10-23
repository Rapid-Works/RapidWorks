'use client';

import React from 'react';

const RankingField = ({ options, value, onChange, label, required }) => {
  const handleRankChange = (itemId, newRank) => {
    const newValue = { ...(value || {}) };
    
    // Remove duplicate rankings
    Object.entries(newValue).forEach(([key, rank]) => {
      if (rank === newRank && key !== itemId) {
        delete newValue[key];
      }
    });
    
    newValue[itemId] = newRank;
    onChange(newValue);
  };

  const getRankLabel = (rank) => {
    switch (rank) {
      case '1': return '1st';
      case '2': return '2nd';
      case '3': return '3rd';
      default: return `${rank}th`;
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-gray-700 text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <div 
            key={option.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <span className="text-gray-900">{option.label}</span>
            <select
              value={value?.[option.id] || ''}
              onChange={(e) => handleRankChange(option.id, e.target.value)}
              className="ml-4 block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">-</option>
              {Array.from({ length: options.length }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {getRankLabel(num.toString())}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingField; 