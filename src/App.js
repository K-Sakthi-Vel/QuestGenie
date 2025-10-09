import React from 'react'
import { Toaster } from 'react-hot-toast'
import Shell from './components/Shell'
import { PdfProvider } from './contexts/PdfContext'
import { QuizProvider } from './contexts/QuizContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { UIProvider } from './contexts/UIContext'


export default function App() {
  return (
    <UIProvider>
      <QuizProvider>
        <PdfProvider>
          <ProgressProvider>
            <Shell />
            <Toaster position="bottom-right" />
          </ProgressProvider>
        </PdfProvider>
      </QuizProvider>
    </UIProvider>
  )
}
