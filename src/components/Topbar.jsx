import React, { useState } from 'react'
import { useUI } from '../contexts/UIContext'
import { usePdf } from '../contexts/PdfContext'
import { useQuiz } from '../contexts/QuizContext'
import Button from './primitives/Button'

export default function Topbar() {
    const { setSidebarOpen, setActiveView } = useUI() // Get setActiveView here
    const { addFile, setActiveFile } = usePdf()
    const { setCurrentQuiz } = useQuiz()
    const [isGenerating, setIsGenerating] = useState(false)

    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            const file = files[0];
            console.log('Uploaded file:', file);

            // Add the file to PdfContext
            const newFile = {
                id: `uploaded-${Date.now()}`,
                title: file.name,
                pages: undefined,
                size: file.size,
                _file: file,
                preview: URL.createObjectURL(file), // Add preview URL
            };
            addFile(newFile);
            // make this file active so toolbar can use it
            setActiveFile(newFile);
            // Switch to PDF workspace view
            setActiveView('pdf-workspace'); // Use setActiveView from the top level
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
                <div className="hidden sm:block text-sm text-gray-600">Progress: <strong>72%</strong></div>

                {/* Hidden file input for uploading PDFs */}
                <input
                    type="file"
                    accept="application/pdf"
                    id="topbar-upload-input"
                    className="hidden"
                    onChange={handleFileUpload}
                />

                <Button
                    onClick={() => document.getElementById('topbar-upload-input').click()}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Generating...' : 'Upload PDF'}
                </Button>
            </div>
        </div>
    )
}
