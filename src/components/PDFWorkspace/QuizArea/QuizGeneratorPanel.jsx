import React from 'react'
import Button from '../../primitives/Button'


export default function QuizGeneratorPanel() {
    return (
        <div className="p-4 bg-white rounded-md shadow-sm">
            <div className="font-semibold mb-2">Generate Quiz</div>
            <div className="text-sm text-gray-600 mb-4">Choose source pages, types and difficulty.</div>
            <label className="block text-xs text-gray-500">Question Type</label>
            <div className="flex gap-2 my-2">
                <Button size="sm">MCQ</Button>
                <Button size="sm">SAQ</Button>
                <Button size="sm">LAQ</Button>
            </div>
            <label className="block text-xs text-gray-500 mt-3">Count</label>
            <input type="number" defaultValue={5} className="w-full mt-1 p-2 border rounded" />
            <div className="mt-4">
                <Button className="w-full">Generate Preview</Button>
            </div>
        </div>
    )
}