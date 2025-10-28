import React, { createContext, useState, useContext, useEffect } from 'react';
import { usePdf } from './PdfContext'; // Re-import usePdf

const QuizContext = createContext();
export const useQuiz = () => useContext(QuizContext);

export function QuizProvider({ children, useMockData }) {
    const { activeFile } = usePdf(); // Re-introduce activeFile dependency
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
    const [quizGenerated, setQuizGenerated] = useState(false); // New state variable

    useEffect(() => {
        setLoading(false); // Always reset loading state when activeFile changes

        if (activeFile && activeFile.id) {
            const localQuiz = localStorage.getItem(`quiz_${activeFile.id}`);
            if (localQuiz) {
                setCurrentQuiz(JSON.parse(localQuiz));
                setQuizGenerated(true); // Set to true if quiz exists for the active file
            } else {
                setCurrentQuiz(null);
                setQuizGenerated(false); // No quiz for this file, so reset
            }
        } else {
            setCurrentQuiz(null);
            setQuizGenerated(false); // No active file, so reset
        }
    }, [activeFile]); // Re-add activeFile dependency

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

    const fetchQuizForSource = async (sourceId, pdfFile) => {
        setLoading(true);
        try {
            // First, try to load from local storage
            const localQuiz = localStorage.getItem(`quiz_${sourceId}`);
            if (localQuiz) {
                setCurrentQuiz(JSON.parse(localQuiz));
                setQuizGenerated(true); // Set to true when loaded from local storage
                setLoading(false);
                return;
            }

            // If not in local storage, make API call
            const formData = new FormData();
            formData.append('file', pdfFile); // Assuming pdfFile is available here
            formData.append('sourceId', sourceId);
            formData.append('useMockData', useMockData); // Pass the mock data flag

            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setCurrentQuiz(data);
            localStorage.setItem(`quiz_${sourceId}`, JSON.stringify(data)); // Cache the fetched quiz
            setQuizGenerated(true); // Set to true after successful API call

        } catch (error) {
            console.error("Error fetching quiz for source:", sourceId, error);
            setCurrentQuiz(null);
            setQuizGenerated(false); // Reset if there's an error
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
        <QuizContext.Provider value={{ currentQuiz, setCurrentQuiz: customSetCurrentQuiz, answers, submitAnswer, loading, setLoading, fetchQuizForSource, clearQuiz, clearAnswersForSource, getScoreForSource, quizGenerated, setQuizGenerated }}>
            {children}
        </QuizContext.Provider>
    );
}
