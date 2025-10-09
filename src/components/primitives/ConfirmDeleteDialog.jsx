import React from 'react';
import ReactDOM from 'react-dom';

export default function ConfirmDeleteDialog({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-xl w-full max-w-sm sm:max-w-md z-10">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="mb-6 text-sm sm:text-base">{children}</div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 gap-2 sm:gap-0">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('portal')
  );
}
