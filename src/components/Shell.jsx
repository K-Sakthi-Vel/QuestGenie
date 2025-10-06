import React from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import ChatPanel from './ChatPanel'
import { useUI } from '../contexts/UIContext'


export default function Shell() {
    const { sidebarOpen } = useUI()
    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar />
            <div className="flex">
                {sidebarOpen && <Sidebar />}
                <MainContent />
            </div>
            <ChatPanel />
        </div>
    )
}