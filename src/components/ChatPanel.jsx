import React from 'react'
import { useUI } from '../contexts/UIContext'


export default function ChatPanel() {
    const { chatOpen, setChatOpen } = useUI()
    return (
        <>
            {!chatOpen && (
                <button
                    onClick={() => setChatOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-indigo-600 text-white"
                    aria-label="Open chat"
                >
                    💬
                </button>
            )}


            {chatOpen && (
                <div className="fixed bottom-6 right-6 w-full sm:w-96 h-[520px] rounded-xl shadow-xl flex flex-col overflow-hidden bg-white">
                    <div className="px-4 py-2 border-b flex items-center justify-between">
                        <div className="font-medium">Study Assistant</div>
                        <button onClick={() => setChatOpen(false)} className="text-gray-500">✕</button>
                    </div>
                    <div className="flex-1 p-4 overflow-auto">Conversation placeholder</div>
                    <div className="p-3 border-t">
                        <div className="flex gap-2">
                            <input className="flex-1 p-2 border rounded" placeholder="Ask a question..." />
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Send</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}