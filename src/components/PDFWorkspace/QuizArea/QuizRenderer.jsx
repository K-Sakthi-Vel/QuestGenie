import React, { useEffect } from 'react'
import { useQuiz } from '../../../contexts/QuizContext'
import QuestionCard from './QuestionCard'


export default function QuizRenderer() {
    const { currentQuiz } = useQuiz()

    useEffect(() => {
        if (currentQuiz) {
            console.log('Displaying quiz:', currentQuiz)
        }
    }, [currentQuiz])

    if (!currentQuiz) {
        return <div className="text-gray-500">No quiz available. Upload a PDF to generate questions.</div>
    }

    return (
        <div className="p-4 bg-white rounded-md shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">Quiz Preview</div>
                <div className="text-sm text-gray-500">{currentQuiz.questions.length} questions</div>
            </div>
            <div className="space-y-4">
                {currentQuiz.questions.map((q) => (
                    <QuestionCard key={q.id} question={q} />
                ))}
            </div>
        </div>
    )
}