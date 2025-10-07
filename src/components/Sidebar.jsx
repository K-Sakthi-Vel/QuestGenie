import React from 'react';
import SourceList from './SourceList';
import { useUI } from '../contexts/UIContext';

export default function Sidebar() {
    const { activeView, setActiveView } = useUI();

    return (
        <aside className="w-80 bg-white border-r h-screen sticky top-0">
            <div className="p-4 border-b">
                <div className="font-semibold text-lg">QuestGenie</div>
            </div>
            <nav className="p-4 space-y-4">
                <div
                    className="font-medium text-gray-700 hover:text-blue-500 cursor-pointer"
                    onClick={() => setActiveView('dashboard')}
                >
                    Dashboard
                </div>
                <div
                    className="font-medium text-gray-700 hover:text-blue-500 cursor-pointer"
                    onClick={() => setActiveView('chats')}
                >
                    Chats
                </div>
                <div
                    className="font-medium text-gray-700 hover:text-blue-500 cursor-pointer"
                    onClick={() => setActiveView('questionnaire')}
                >
                    Questionnaire
                </div>
                {(activeView === 'questionnaire' || activeView === 'pdf-workspace') && (
                    <div className="p-4 border-t">
                        <SourceList />
                    </div>
                )}
            </nav>
        </aside>
    );
}
