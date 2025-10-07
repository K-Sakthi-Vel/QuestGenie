import React, { useState, useEffect } from 'react'
import PDFToolbar from './PDFToolbar'
import PDFViewer from './PDFViewer'
import AnnotationsPanel from './AnnotationsPanel'


export default function PDFWorkspace({ selectedQuestionnaire }) {
    const [pdfUrl, setPdfUrl] = useState(null)

    useEffect(() => {
        console.log("selectedQuestionnaire:", selectedQuestionnaire);
        const file = selectedQuestionnaire?.pdfFile?._file;
        if (file instanceof File) {
            const url = URL.createObjectURL(file);
            console.log("Generated pdfUrl:", url);
            setPdfUrl(url);
        } else {
            console.error("Invalid pdfFile in selectedQuestionnaire:", selectedQuestionnaire?.pdfFile);
            setPdfUrl(null);
        }
    }, [selectedQuestionnaire])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
                <PDFToolbar />
                <div className="mt-4">
                    <PDFViewer />
                </div>
            </div>
            <aside className="lg:col-span-4">
                <AnnotationsPanel pdfUrl={pdfUrl} />
            </aside>
        </div>
    )
}