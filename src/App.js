import React from 'react'
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
          </ProgressProvider>
        </PdfProvider>
      </QuizProvider>
    </UIProvider>
  )
}
