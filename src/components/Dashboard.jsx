import React from 'react'
import PdfQuestioner from './PdfQuestioner'


export default function Dashboard() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded shadow-sm">Quizzes Taken<br /><div className="text-2xl font-semibold">12</div></div>
                <div className="p-4 bg-white rounded shadow-sm">Accuracy<br /><div className="text-2xl font-semibold">78%</div></div>
                <div className="p-4 bg-white rounded shadow-sm">Study Time<br /><div className="text-2xl font-semibold">6h 24m</div></div>
            </div>

            <div className="mt-6">
                <PdfQuestioner />
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-4 bg-white rounded shadow-sm">Study Timeline (chart placeholder)</div>
                <div className="p-4 bg-white rounded shadow-sm">Weak Topics (list placeholder)</div>
            </div>
        </div>
    )
}