import React from 'react'

const TrashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-400 hover:text-red-500"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
        clipRule="evenodd"
      />
    </svg>
  );


export default function SourceItem({ file = {}, onOpen = () => { }, isSelected, score, onDelete = () => {} }) {
    const scoreExists = score !== null && score !== undefined;

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(file.id);
    }

    return (
        <div
            className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            onClick={onOpen}
        >
            <div>
                <div className="font-medium">{file.title.replace(/\.pdf$/i, "") || 'Untitled PDF'}</div>
            </div>
            <div className="flex items-center">
                {scoreExists && (
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center justify-center mr-2">
                        {score}
                    </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleDelete}>
                    <TrashIcon />
                </div>
            </div>
        </div>
    )
}
