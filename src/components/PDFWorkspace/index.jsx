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
            <div className="lg:col-span-8">
                <PDFToolbar />
                <div className="mt-4">
                    <PDFViewer pdfUrl={pdfUrl} />
                </div>
            </div>
            <aside className="lg:col-span-4">
                <AnnotationsPanel pdfUrl={pdfUrl} />
            </aside>
        </div>
    )
}
