import React from 'react'
import QuestionCard from './QuestionCard'


const sample = {
    questions: [
        { id: 'q1', type: 'mcq', text: 'What is React?', options: ['Lib', 'Framework', 'Language'] },
        { id: 'q2', type: 'saq', text: 'Explain virtual DOM.' },
    ],
}


export default function QuizRenderer() {
    return (
        <div className="p-4 bg-white rounded-md shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">Quiz Preview</div>
                <div className="text-sm text-gray-500">2 questions</div>
            </div>
            <div className="space-y-4">
                {sample.questions.map((q) => (
                    <QuestionCard key={q.id} question={q} />
                ))}
            </div>
        </div>
    )
}