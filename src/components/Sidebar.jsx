import React from 'react';
import SourceList from './SourceList';
import { useUI } from '../contexts/UIContext';
import { LuLayoutDashboard, LuMessageSquare, LuFileQuestion, LuMenu } from 'react-icons/lu';
import { FaReact } from 'react-icons/fa'; // Placeholder for logo
import Logo from '../assets/logo.png'; // Assuming you have a logo image in assets
export default function Sidebar() {
    const { activeView, setActiveView, sidebarOpen, setSidebarOpen } = useUI();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LuLayoutDashboard size={20} /> },
        { id: 'chats', label: 'Chats', icon: <LuMessageSquare size={20} /> },
        { id: 'questionnaire', label: 'Questionnaire', icon: <LuFileQuestion size={20} /> },
    ];

    return (
        <aside className={`bg-gray-50 border-r h-screen sticky top-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="px-4 py-3 border-b flex items-center justify-between">
                {sidebarOpen && <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center w-full'}`}>
                    <img src={Logo} alt="Logo" className="h-10 w-10" />
                    <span className="font-bold text-2xl tracking-widest text-red-500 whitespace-nowrap">
                        Q GENIE
                    </span>
                </div>}
                <button className="text-gray-600 ml-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <LuMenu size={24} />
                </button>
            </div>
            <nav className="p-4 space-y-2 flex-1">
                {navItems.map((item) => {
                    const isActive = activeView === item.id || (item.id === 'questionnaire' && activeView === 'pdf-workspace');
                    return (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${isActive
                                    ? 'bg-red-200 text-gray-900 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-100'
                                } ${!sidebarOpen && 'justify-center'}`}
                            onClick={() => setActiveView(item.id)}
                        >
                            {item.icon}
                            {sidebarOpen && <span>{item.label}</span>}
                        </div>
                    )
                })}
                {(activeView === 'questionnaire' || activeView === 'pdf-workspace') && sidebarOpen && (
                    <div className="p-4 border-t">
                        <SourceList />
                    </div>
                )}
            </nav>
        </aside>
    );
}
