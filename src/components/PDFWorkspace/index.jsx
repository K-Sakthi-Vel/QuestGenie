import React from 'react'
import PDFToolbar from './PDFToolbar'
import PDFViewer from './PDFViewer'
import AnnotationsPanel from './AnnotationsPanel'


export default function PDFWorkspace() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
                <PDFToolbar />
                <div className="mt-4">
                    <PDFViewer />
                </div>
            </div>
            <aside className="lg:col-span-4">
                <AnnotationsPanel />
            </aside>
        </div>
    )
}