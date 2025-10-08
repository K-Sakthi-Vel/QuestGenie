import React from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';

const RightDrawer = ({ chats, onSelectChat, onNewChat }) => {
  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onNewChat}
          className="mt-4 w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="mr-2" />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 truncate">{chat.title}</h3>
              <span className="text-xs text-gray-500">{chat.timestamp}</span>
            </div>
            <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightDrawer;
