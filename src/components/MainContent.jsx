import React, { useState, useEffect } from 'react';
import { usePdf } from '../contexts/PdfContext';
import { useUI } from '../contexts/UIContext';
import { useQuiz } from '../contexts/QuizContext';
import PDFWorkspace from './PDFWorkspace';
import Dashboard from './Dashboard';
import ChatPanel from './ChatPanel';
import Button from './primitives/Button'
import { putPdf } from '../utils/idbHelper' // Import IndexedDB putPdf
import { LuMenu } from 'react-icons/lu';


export default function MainContent() {
    const { setSidebarOpen, setActiveView, activeView } = useUI() // Get setActiveView here
    const { addFile, setActiveFile, activeFile, files } = usePdf()
    const { loading: isGenerating } = useQuiz()

    useEffect(() => {
        // If we're in the questionnaire view, have files, but no active file, set the first one as active.
        if (activeView === 'questionnaire' && files && files.length > 0 && !activeFile) {
            setActiveFile(files[0]);
        }
    }, [activeView, files, activeFile, setActiveFile]);


    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            const file = files[0];
            console.log('Uploaded file from Topbar:', file);

            try {
                const fileId = `uploaded-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
                console.log("Topbar: Attempting to put PDF to IndexedDB:", { key: fileId, name: file.name, blob: file })
                await putPdf({ key: fileId, name: file.name, blob: file })
                console.log("Topbar: PDF successfully put to IndexedDB:", fileId)

                // Add the file to PdfContext
                const newFile = {
                    id: fileId,
                    title: file.name,
                    pages: undefined, // This will be populated by PDFViewer or similar component
                    size: file.size,
                    preview: URL.createObjectURL(file), // Create object URL for immediate preview
                    blobKey: fileId, // Store key to retrieve blob later
                };
                console.log("Topbar: New file object created for PdfContext:", newFile)
                addFile(newFile);
                // make this file active so toolbar can use it
                setActiveFile(newFile);
                // Switch to PDF workspace view
                setActiveView('pdf-workspace'); // Use setActiveView from the top level
            } catch (error) {
                console.error("Topbar: Error processing file:", file.name, error)
                alert("Error uploading PDF: " + (error.message || String(error)))
            }
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard />;
            case 'chats':
                return <ChatPanel />;
            case 'questionnaire':
                // If there are files, show the workspace. The active file will be set by the effect
                // or will be the one already selected.
                if (files && files.length > 0) {
                    return <PDFWorkspace selectedQuestionnaire={{ pdfFile: activeFile || files[0] }} />;
                }
                // If there are no files, show the placeholder.
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold mb-4">Select a PDF to get started</h2>
                            <p className="text-gray-500">Once you select a PDF, it will be displayed here.</p>
                        </div>
                    </div>
                );
            case 'pdf-workspace':
                // Always render PDFWorkspace. It handles the case where pdfUrl is null internally.
                return <PDFWorkspace selectedQuestionnaire={{ pdfFile: activeFile }} />;
            default:
                return <Dashboard />;
        }
    };

    return <main className="flex-1 h-100VH">
        <div className='h-[65px] w-full border-b bg-gray-50 flex items-center justify-between px-6'>
            <div className="flex items-center gap-4">
                <button className="text-gray-600 md:hidden" onClick={() => setSidebarOpen(true)}>
                    <LuMenu size={24} />
                </button>
                {
                    activeView === 'dashboard' && <h1 className="text-2xl font-bold text-red-400">Dashboard</h1>
                }
                {
                    activeView === 'chats' && <h1 className="text-2xl font-bold text-red-400">Chats</h1>
                }
                {
                    activeView === 'questionnaire' && <h1 className="text-2xl font-bold text-red-400">AI Quiz Lab</h1>
                }
                {
                    activeView === 'pdf-workspace' && <h1 className="text-2xl font-bold text-red-400">PDF Workspace</h1>
                }
            </div>
            <div className="flex items-center gap-3">
                {/* Hidden file input for uploading PDFs */}
                <input
                    type="file"
                    accept="application/pdf"
                    id="topbar-upload-input"
                    className="hidden"
                    onChange={handleFileUpload}
                />

                {
                    (activeView === 'pdf-workspace' || activeView === 'questionnaire') && (
                        <Button
                            onClick={() => document.getElementById('topbar-upload-input').click()}
                            disabled={isGenerating}
                        >
                            Upload PDF
                        </Button>)
                }

            </div>
        </div>
        {renderContent()}
    </main>;
}
