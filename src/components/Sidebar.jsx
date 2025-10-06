import React from 'react'
import SourceList from './SourceList'


export default function Sidebar() {
    return (
        <aside className="w-80 bg-white border-r h-screen sticky top-0">
            <div className="p-4 border-b">
                <div className="font-semibold">Sources</div>
                <div className="text-xs text-gray-500">Upload PDFs or import from cloud</div>
            </div>
            <div className="p-4">
                <SourceList />
            </div>
        </aside>
    )
}