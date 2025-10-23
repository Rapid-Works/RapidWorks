import { useState, useEffect } from 'react';

export const useFormProgress = (initialState = {}) => {
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('formProgress');
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    localStorage.setItem('formProgress', JSON.stringify(answers));
  }, [answers]);

  return [answers, setAnswers];
}; 