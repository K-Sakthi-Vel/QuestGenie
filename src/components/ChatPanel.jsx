import React from 'react';

export default function ChatPanel() {
    return (
        <div className="flex-1 flex flex-col h-screen bg-white">
            <div className="px-4 py-2 border-b flex items-center justify-between">
                <div className="font-medium">Study Assistant</div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
                {/* Conversation messages will go here */}
                <div className="text-center text-gray-500">
                    This is the beginning of your conversation.
                </div>
            </div>
            <div className="p-3 border-t">
                <div className="flex gap-2">
                    <input
                        className="flex-1 p-2 border rounded"
                        placeholder="Ask a question..."
                    />
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}