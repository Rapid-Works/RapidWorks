'use client';

import React, { useState } from 'react';
import RadarChart from './RadarChart';

const AutomationAnalysis = () => {
  const [chartData, setChartData] = useState([
    { label: 'Auftragsabwicklung', value: 2, max: 3 },
    { label: 'Vertrieb (Sales)', value: 3, max: 3 },
    { label: 'Marketing & Lead-Generierung', value: 2, max: 3 },
    { label: 'IT & Sicherheit', value: 3, max: 3 },
    { label: 'Management', value: 1, max: 3 },
    { label: 'Personal', value: 2, max: 3 },
    { label: 'Finanzen', value: 3, max: 3 },
    { label: 'Kundenservice/Support', value: 1, max: 3 },
  ]);

  const handleValueChange = (index, newValue) => {
    const value = Math.max(0, Math.min(3, Number(newValue) || 0));
    const newData = [...chartData];
    newData[index] = { ...newData[index], value };
    setChartData(newData);
  };

  const resetValues = () => {
    setChartData(
      chartData.map((item) => ({ ...item, value: 0 }))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Automation Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Evaluate your organization's automation maturity across different departments.
            Enter values from 0 to 3 for each category.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Chart Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Automation Maturity Radar
            </h2>
            <div className="flex justify-center">
              <RadarChart data={chartData} size={500} />
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Legend</h3>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Current Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span>Max: 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Department Scores
              </h2>
              <button
                onClick={resetValues}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <label className="block mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="0"
                      max="3"
                      step="1"
                      value={item.value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={item.value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="w-12 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics */}
            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(
                      chartData.reduce((sum, item) => sum + item.value, 0) /
                      chartData.length
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Score</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {chartData.reduce((sum, item) => sum + item.value, 0)} / {chartData.length * 3}
                  </p>
                </div>
              </div>
            </div>

            {/* Future Backend Note */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> These values are currently entered manually.
                In the future, they will be automatically calculated from backend data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationAnalysis;
