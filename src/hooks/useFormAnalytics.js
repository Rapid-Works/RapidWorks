import { useEffect } from 'react';

// Add this helper function
const calculateProgress = (answers, totalQuestions = 100) => {
  if (!answers || Object.keys(answers).length === 0) return 0;
  
  const answeredCount = Object.keys(answers).filter(key => 
    answers[key] !== undefined && answers[key] !== ''
  ).length;
  
  return Math.min(Math.round((answeredCount / totalQuestions) * 100), 100);
};

export const useFormAnalytics = (currentSection, answers, totalQuestions) => {
  useEffect(() => {
    // Track section views
    if (window.analytics) {
      window.analytics.track('Form Section View', {
        sectionId: currentSection?.id,
        sectionTitle: currentSection?.title
      });
    }
  }, [currentSection]);

  useEffect(() => {
    // Track form completion progress
    const progress = calculateProgress(answers, totalQuestions);
    if (window.analytics && progress % 25 === 0) { // Track at 25%, 50%, 75%, 100%
      window.analytics.track('Form Progress', {
        percentage: progress
      });
    }
  }, [answers, totalQuestions]);
}; 