import React from 'react'
import QuizGeneratorPanel from './QuizGeneratorPanel'
import QuizRenderer from './QuizRenderer'


export default function QuizArea() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
                <QuizGeneratorPanel />
            </div>
            <div className="lg:col-span-2">
                <QuizRenderer />
            </div>
        </div>
    )
}