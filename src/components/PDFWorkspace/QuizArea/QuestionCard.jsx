import React from 'react'


export default function QuestionCard({ question }) {
    return (
        <div className="p-4 border rounded-md">
            <div className="font-medium mb-2">{question.text}</div>
            {question.type === 'mcq' && (
                <div className="grid gap-2">
                    {question.options.map((o, i) => (
                        <button key={i} className="text-left p-3 border rounded hover:shadow-sm">
                            {o}
                        </button>
                    ))}
                </div>
            )}
            {question.type === 'saq' && (
                <textarea className="w-full mt-2 p-2 border rounded" rows={3} />
            )}
        </div>
    )
}