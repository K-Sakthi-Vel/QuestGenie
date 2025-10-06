import React from 'react'
import { usePdf } from '../contexts/PdfContext'
import PDFWorkspace from './PDFWorkspace'
import QuizArea from './PDFWorkspace/QuizArea'
import Dashboard from './Dashboard'


export default function MainContent() {
    const { activeFile } = usePdf()


    return (
        <main className="flex-1 p-6">
            {/* Simple routing switch by activeFile for now */}
            {!activeFile && <Dashboard />}
            {activeFile && <PDFWorkspace />}
            {/* The QuizArea is displayed via a button in PDFToolbar or as a route */}
        </main>
    )
}