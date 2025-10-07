import React, { createContext, useState, useContext, useEffect } from 'react';

const QuizContext = createContext();
export const useQuiz = () => useContext(QuizContext);

export function QuizProvider({ children }) {
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [answers, setAnswers] = useState(() => {
        try {
            const localAnswers = localStorage.getItem('quizAnswers');
            return localAnswers ? JSON.parse(localAnswers) : {};
        } catch (error) {
            console.error("Failed to parse quizAnswers from localStorage", error);
            return {};
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try {
            if (currentQuiz && currentQuiz.sourceId) {
                localStorage.setItem(`quiz_${currentQuiz.sourceId}`, JSON.stringify(currentQuiz));
            }
        } catch (error) {
            console.error("Failed to set currentQuiz in localStorage", error);
        }
    }, [currentQuiz]);

    useEffect(() => {
        try {
            localStorage.setItem('quizAnswers', JSON.stringify(answers));
        } catch (error) {
            console.error("Failed to set quizAnswers in localStorage", error);
        }
    }, [answers]);

    const submitAnswer = (sourceId, qid, answer) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [sourceId]: {
                ...(prevAnswers[sourceId] || {}),
                [qid]: answer,
            },
        }));
    };

    const fetchQuizForSource = async (sourceId) => {
        setLoading(true);
        try {
            const localQuiz = localStorage.getItem(`quiz_${sourceId}`);
            if (localQuiz) {
                setCurrentQuiz(JSON.parse(localQuiz));
            } else {
                setCurrentQuiz(null);
            }
        } catch (error) {
            console.error("Error fetching quiz for source:", sourceId, error);
            setCurrentQuiz(null);
        } finally {
            setLoading(false);
        }
    };

    const clearQuiz = (sourceId) => {
        if (sourceId) {
            localStorage.removeItem(`quiz_${sourceId}`);
            if (currentQuiz && currentQuiz.sourceId === sourceId) {
                setCurrentQuiz(null);
            }
            setAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[sourceId];
                return newAnswers;
            });
        } else {
            setCurrentQuiz(null);
            setAnswers({});
        }
    };

    const clearAnswersForSource = (sourceId) => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            if (newAnswers[sourceId]) {
                delete newAnswers[sourceId];
            }
            return newAnswers;
        });
    };

    const customSetCurrentQuiz = (quiz, sourceId) => {
        if (quiz && sourceId) {
            quiz.sourceId = sourceId;
        }
        setCurrentQuiz(quiz);
    };

    const getScoreForSource = (sourceId) => {
        const localQuiz = localStorage.getItem(`quiz_${sourceId}`);
        if (!localQuiz) return null;

        const quiz = JSON.parse(localQuiz);
        const sourceAnswers = answers[sourceId];
        if (!sourceAnswers) return null;

        let score = 0;
        quiz.questions.forEach(q => {
            if (sourceAnswers[q.id] === q.answer) {
                score++;
            }
        });
        return score;
    };

    return (
        <QuizContext.Provider value={{ currentQuiz, setCurrentQuiz: customSetCurrentQuiz, answers, submitAnswer, loading, setLoading, fetchQuizForSource, clearQuiz, clearAnswersForSource, getScoreForSource }}>
            {children}
        </QuizContext.Provider>
    );
}
