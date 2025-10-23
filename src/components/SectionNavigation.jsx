'use client';

import React from 'react';

const SectionNavigation = ({ sections, currentIndex, onNavigate, answers }) => {
  return (
    <div className="fixed left-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
      <nav className="space-y-2">
        {sections.map((section, index) => {
          const isComplete = section.questions?.every(q => !q.required || answers[q.id]);
          const isCurrent = index === currentIndex;

          return (
            <button
              key={section.id}
              onClick={() => onNavigate(index)}
              className={`flex items-center space-x-2 text-sm ${
                isCurrent ? 'text-blue-600 font-medium' : 
                isComplete ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                isCurrent ? 'bg-blue-600' :
                isComplete ? 'bg-gray-600' : 'bg-gray-300'
              }`} />
              <span>{section.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SectionNavigation; 