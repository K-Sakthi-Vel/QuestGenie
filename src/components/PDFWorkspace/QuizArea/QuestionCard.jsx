import React from 'react'


export default function QuestionCard({ question }) {
    const qtext = question.question || question.text || 'Question text missing'
    return (
        <div className="p-4 border rounded-md">
            <div className="font-medium mb-2">{qtext}</div>
            {question.type === 'mcq' && question.options && (
                <div className="grid gap-2">
                    {question.options.map((o, i) => {
                        const label = String.fromCharCode(65 + i)
                        const isCorrect = question.answer && (question.answer === o || question.answer === label || question.answer === (label + ')'))
                        return (
                            <button key={i} className={`text-left p-3 border rounded hover:shadow-sm ${isCorrect ? 'bg-green-50' : ''}`}>
                                <strong className="mr-2">{label}.</strong> {o}
                            </button>
                        )
                    })}
                </div>
            )}
            {question.type === 'saq' && (
                <textarea className="w-full mt-2 p-2 border rounded" rows={3} defaultValue={question.answer || ''} />
            )}
            {question.type === 'laq' && question.expected_points && (
                <div className="mt-2">
                    <div className="font-semibold">Expected points</div>
                    <ul className="list-disc ml-5 mt-1">
                        {question.expected_points.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                </div>
            )}
        </div>
    )
}