import React from 'react';
import SourceList from './SourceList';
import { useUI } from '../contexts/UIContext';
import { LuLayoutDashboard, LuMessageSquare, LuFileQuestion, LuMenu } from 'react-icons/lu';
import { FaReact } from 'react-icons/fa'; // Placeholder for logo
import Logo from '../assets/logo.png'; // Assuming you have a logo image in assets
export default function Sidebar() {
    const { activeView, setActiveView } = useUI();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LuLayoutDashboard size={20} /> },
        { id: 'chats', label: 'Chats', icon: <LuMessageSquare size={20} /> },
        { id: 'questionnaire', label: 'Questionnaire', icon: <LuFileQuestion size={20} /> },
    ];

    return (
        <aside className="w-64 bg-gray-50 border-r h-screen sticky top-0 flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={Logo} alt="Logo" className="h-10 w-10" />
                    <span className="font-bold text-2xl tracking-widest text-violet-500">Q GENIE</span>
                </div>
                <button className="text-gray-600">
                    <LuMenu size={24} />
                </button>
            </div>
            <nav className="p-4 space-y-2 flex-1">
                {navItems.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
                            activeView === item.id
                                ? 'bg-pink-100 text-gray-900 font-semibold'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveView(item.id)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </div>
                ))}
                 {(activeView === 'questionnaire' || activeView === 'pdf-workspace') && (
                    <div className="p-4 border-t">
                        <SourceList />
                    </div>
                )}
            </nav>
        </aside>
    );
}
