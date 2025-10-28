import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Shell from './components/Shell'
import { PdfProvider } from './contexts/PdfContext'
import { QuizProvider, useQuiz } from './contexts/QuizContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { UIProvider } from './contexts/UIContext'
import DisclaimerPopup from './components/primitives/DisclaimerPopup'


export default function App() {
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    const hasUnderstood = localStorage.getItem('disclaimerUnderstood');
    return hasUnderstood !== 'true';
  });
  const [useMockData, setUseMockData] = useState(() => {
    const hasUnderstood = localStorage.getItem('disclaimerUnderstood');
    return hasUnderstood === 'true';
  });

  useEffect(() => {
    if (!showDisclaimer) {
      localStorage.setItem('disclaimerUnderstood', 'true');
    }
  }, [showDisclaimer]);

  const handleUnderstand = () => {
    setShowDisclaimer(false);
    setUseMockData(true);
  };

  return (
    <UIProvider>
      <PdfProvider>
        <QuizProvider useMockData={useMockData}>
          <AppContent useMockData={useMockData} />
        </QuizProvider>
      </PdfProvider>
      {showDisclaimer && <DisclaimerPopup onUnderstand={handleUnderstand} />}
    </UIProvider>
  )
}

function AppContent({ useMockData }) {
  return (
    <ProgressProvider>
      <Shell useMockData={useMockData} />
      <Toaster position="bottom-right" />
    </ProgressProvider>
  );
}
