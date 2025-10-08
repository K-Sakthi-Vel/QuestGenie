import React from 'react';

export default function ConfirmDeleteDialog({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
