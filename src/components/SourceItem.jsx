import React from 'react'


export default function SourceItem({ file = {}, onOpen = () => { }, isSelected, score }) {
    const scoreExists = score !== null && score !== undefined;

    return (
        <div
            className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
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
            </div>
        </div>
    )
}
