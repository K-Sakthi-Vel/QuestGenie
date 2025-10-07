import React, { useState } from 'react'
import { useUI } from '../contexts/UIContext'
import { usePdf } from '../contexts/PdfContext'
import { useQuiz } from '../contexts/QuizContext'
import Button from './primitives/Button'
import { putPdf } from '../utils/idbHelper' // Import IndexedDB putPdf

export default function Topbar() {
    const { setSidebarOpen, setActiveView, activeView } = useUI() // Get setActiveView here
    const { addFile, setActiveFile } = usePdf()
    const { setCurrentQuiz } = useQuiz()
    const [isGenerating, setIsGenerating] = useState(false)

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

    const generateQuestions = async (file) => {
        // Mock question generation logic
        return [
            { id: 'q1', type: 'mcq', text: `What is the title of the file?`, options: [file.title, 'Option B', 'Option C'] },
            { id: 'q2', type: 'saq', text: `Summarize the content of ${file.title}.` },
        ];
    };

    return (
        <div className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between bg-white shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen((s) => !s)}
                    aria-label="Toggle sidebar"
                    className="p-2 rounded-md hover:bg-gray-100"
                >
                    ☰
                </button>
                <div className="text-lg font-semibold">Revise</div>
                <div className="hidden md:block text-sm text-gray-500">Make study time count</div>
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
                            {isGenerating ? 'Generating...' : 'Upload PDF'}
                        </Button>)
                }

            </div>
        </div>
    )
}
