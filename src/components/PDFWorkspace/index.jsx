import React, { useState, useEffect } from 'react'
import PDFToolbar from './PDFToolbar'
import PDFViewer from './PDFViewer'
import AnnotationsPanel from './AnnotationsPanel'
import QuizArea from './QuizArea'

export default function PDFWorkspace({ selectedQuestionnaire }) {
    const [pdfUrl, setPdfUrl] = useState(null)

    useEffect(() => {
        const file = selectedQuestionnaire?.pdfFile;
        if (file && file.preview) {
            setPdfUrl(file.preview);
        } else {
            setPdfUrl(null);
        }
    }, [selectedQuestionnaire])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Panel */}
            <div className="lg:col-span-8 h-[calc(100vh-65px)] flex flex-col">
                {/* Toolbar fixed at top */}
                <div className="shrink-0">
                    <PDFToolbar />
                </div>

                {/* PDF viewer fills remaining space */}
                <div className="flex-1 overflow-hidden">
                    <PDFViewer pdfUrl={pdfUrl} />
                </div>
            </div>

            {/* Right Panel */}
            <aside className="lg:col-span-4 h-[calc(100vh-65px)] overflow-y-auto">
                <AnnotationsPanel pdfUrl={pdfUrl} />
            </aside>
        </div>

    )
}
