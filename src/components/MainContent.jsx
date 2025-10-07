import React from 'react';
import { usePdf } from '../contexts/PdfContext';
import { useUI } from '../contexts/UIContext';
import PDFWorkspace from './PDFWorkspace';
import Dashboard from './Dashboard';
import ChatPanel from './ChatPanel';

export default function MainContent() {
    const { activeFile } = usePdf();
    const { activeView } = useUI();

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard />;
            case 'chats':
                return <ChatPanel />;
            case 'questionnaire':
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

    return <main className="flex-1">
        <div className='h-[65px] w-full h-screen border-b bg-gray-50 flex items-center px-6'>
            {
                activeView === 'dashboard' && <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            }
            {activeView === 'chats' && <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
            }
            {activeView === 'questionnaire' && <h1 className="text-2xl font-bold text-gray-800">Questionnaire</h1>
            }
            {activeView === 'pdf-workspace' && <h1 className="text-2xl font-bold text-gray-800">PDF Workspace</h1>
            }
        </div>
        {renderContent()}
        </main>;
}
