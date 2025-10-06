import React from 'react'


export default function SourceItem({ file = {}, onOpen = () => { } }) {
    return (
        <div
            className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
            onClick={onOpen}
        >
            <div>
                <div className="font-medium">{file.title || 'Untitled PDF'}</div>
                <div className="text-xs text-gray-500">{file.pages ? `${file.pages} pages` : '—'}</div>
            </div>
            <div className="text-xs text-gray-400">›</div>
        </div>
    )
}