import React, { createContext, useState, useContext } from 'react'


const QuizContext = createContext()
export const useQuiz = () => useContext(QuizContext)


export function QuizProvider({ children }) {
    const [currentQuiz, setCurrentQuiz] = useState(null) // {id,questions,meta}
    const [answers, setAnswers] = useState({})
    const [loading, setLoading] = useState(false)


    const submitAnswer = (qid, answer) => setAnswers((a) => ({ ...a, [qid]: answer }))


    return (
        <QuizContext.Provider value={{ currentQuiz, setCurrentQuiz, answers, submitAnswer, loading, setLoading }}>
            {children}
        </QuizContext.Provider>
    )
}