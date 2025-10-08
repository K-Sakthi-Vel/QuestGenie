import React, { useState } from 'react';
import { FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import ConfirmDeleteDialog from './primitives/ConfirmDeleteDialog';

const RightDrawer = ({ chats, onSelectChat, onNewChat, onDeleteChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDeleteDialog = (chatId) => {
    setChatToDelete(chatId);
    setIsDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setChatToDelete(null);
    setIsDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
    }
    closeDeleteDialog();
  };

  return (
    <>
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={onNewChat}
            className="mt-4 w-full flex items-center justify-center py-2 px-4 bg-red-400 text-white rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="mr-2" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="p-3 mb-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 truncate">{chat.title}</h3>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">{chat.timestamp}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No chats found.
            </div>
          )}
        </div>
      </div>
      <ConfirmDeleteDialog
        isOpen={isDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Chat"
      >
        Are you sure you want to delete this chat? This action cannot be undone.
      </ConfirmDeleteDialog>
    </>
  );
};

export default RightDrawer;
