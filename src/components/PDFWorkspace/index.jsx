import React, { useState, useEffect } from 'react';
import PDFToolbar from './PDFToolbar';
import PDFViewer from './PDFViewer';
import AnnotationsPanel from './AnnotationsPanel';
import QuizArea from './QuizArea';

export default function PDFWorkspace({ selectedQuestionnaire }) {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [activeTab, setActiveTab] = useState('viewer'); // 'viewer' or 'annotations'

    useEffect(() => {
        const file = selectedQuestionnaire?.pdfFile;
        if (file && file.preview) {
            setPdfUrl(file.preview);
        } else {
            setPdfUrl(null);
        }
    }, [selectedQuestionnaire]);

    return (
        <div className="flex flex-col h-[calc(100vh-65px)]">
            {/* Tabs for mobile view */}
            <div className="lg:hidden border-b">
                <nav className="flex space-x-4 p-2">
                    <button
                        onClick={() => setActiveTab('viewer')}
                        className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'viewer' ? 'bg-red-400 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Quiz
                    </button>
                    <button
                        onClick={() => setActiveTab('annotations')}
                        className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'annotations' ? 'bg-red-400 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Study Material
                    </button>
                </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
                {/* Left Panel */}
                <div className={`lg:col-span-8 h-full flex-col ${activeTab === 'viewer' ? 'flex' : 'hidden'} lg:flex`}>
                    <div className="shrink-0">
                        <PDFToolbar />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <PDFViewer pdfUrl={pdfUrl} />
                    </div>
                </div>

                {/* Right Panel */}
                <aside className={`lg:col-span-4 h-full overflow-y-auto ${activeTab === 'annotations' ? 'block' : 'hidden'} lg:block`}>
                    <AnnotationsPanel pdfUrl={pdfUrl} />
                </aside>
            </div>
        </div>
    );
}
