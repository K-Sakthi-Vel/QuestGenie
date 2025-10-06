import React from 'react'
import { useUI } from '../contexts/UIContext'
import Button from './primitives/Button'


export default function Topbar() {
    const { setSidebarOpen } = useUI()
    return (
        <div className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between bg-white shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen((s) => !s)}
                    aria-label="Toggle sidebar"
                    className="p-2 rounded-md hover:bg-gray-100"
                >
                    ☰
                </button>
                <div className="text-lg font-semibold">Revise</div>
                <div className="hidden md:block text-sm text-gray-500">Make study time count</div>
            </div>


            <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm text-gray-600">Progress: <strong>72%</strong></div>
                <Button>Upload PDF</Button>
            </div>
        </div>
    )
}