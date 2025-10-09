import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../../contexts/QuizContext';
import ReactMarkdown from 'react-markdown';

export default function QuizRenderer() {
  const { currentQuiz, loading, submitAnswer, clearAnswersForSource } = useQuiz();
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  const sourceId = currentQuiz?.sourceId;

  useEffect(() => {
    setUserAnswers({}); // Reset answers when quiz changes
    if (sourceId) {
      const storedScore = localStorage.getItem(`quizScore_${sourceId}`);
      if (storedScore) {
        setScore(JSON.parse(storedScore));
      } else {
        setScore(null);
      }
      const storedResults = localStorage.getItem(`quizResults_${sourceId}`);
      if (storedResults) {
        setResults(JSON.parse(storedResults));
      } else {
        setResults(null);
      }
    }
  }, [sourceId]);

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!currentQuiz || !sourceId) return;

    // Submit all answers to the context so the score gets updated globally
    Object.entries(userAnswers).forEach(([questionId, answer]) => {
      submitAnswer(sourceId, questionId, answer);
    });

    const calculatedResults = currentQuiz.questions.map((q) => {
      const userAnswer = userAnswers[q.id];
      let isCorrect = false;

      if (q.type === 'mcq') {
        isCorrect = userAnswer === q.answer;
      } else if (q.type === 'saq' || q.type === 'laq') {
        if (typeof q.answer === 'string') {
          isCorrect = userAnswer && userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
        } else if (Array.isArray(q.answer)) {
          isCorrect = q.answer.some((ans) => userAnswer && userAnswer.trim().toLowerCase() === ans.trim().toLowerCase());
        }
      }

      return {
        questionId: q.id,
        isCorrect,
        userAnswer,
        correctAnswer: q.answer || q.correctOption,
      };
    });

    const totalScore = calculatedResults.filter((r) => r.isCorrect).length;
    setResults(calculatedResults);
    setScore(totalScore);

    localStorage.setItem(`quizScore_${sourceId}`, JSON.stringify(totalScore));
    localStorage.setItem(`quizResults_${sourceId}`, JSON.stringify(calculatedResults));
    alert('Your answers have been submitted!');
  };

  const handleReattempt = () => {
    if (!sourceId) return;

    // Clear results and score from state
    setResults(null);
    setScore(null);
    setShowAnswers(false);
    setUserAnswers({});

    // Clear results and score from localStorage
    localStorage.removeItem(`quizScore_${sourceId}`);
    localStorage.removeItem(`quizResults_${sourceId}`);

    // Clear the answers for the current source from the context
    clearAnswersForSource(sourceId);
  };

  if (loading) {
    return (
      <div className="w-full h-[100vh] bg-white border rounded-md overflow-auto flex flex-col items-center justify-center p-6">
        <div
          className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"
          style={{ borderTopColor: '#f87171' }}
        />
        <p className="mt-4 text-gray-600 font-medium">Generating questions — this may take a few minutes.</p>
      </div>
    );
  }

  if (currentQuiz) {
    return (
      <div className="w-full h-[calc(100vh-125px)] bg-white border rounded-md p-4 flex flex-col">
        <div className="font-semibold mb-4 text-lg">Generated Quiz</div>

        <div className="flex-grow overflow-y-auto pr-4">
          <div className="space-y-6">
            {currentQuiz.questions.map((q) => {
              const questionText = q.question || q.text || 'Question not provided';
              const result = results?.find((r) => r.questionId === q.id);

              return (
                <div
                  key={q.id}
                  className={`p-4 border-2 rounded-md shadow-sm hover:shadow-md transition-all bg-gray-50 ${
                    result ? (result.isCorrect ? 'border-green-500' : 'border-red-500') : ''
                  }`}
                >
                  {/* Question */}
                  <div className="font-medium mb-2 text-gray-800">
                    <ReactMarkdown components={{ p: ({ node, ...props }) => <p className="mb-1" {...props} /> }}>
                      {questionText}
                    </ReactMarkdown>
                  </div>

                  {/* MCQ */}
                  {q.type === 'mcq' && Array.isArray(q.options) && (
                    <div className="grid gap-2 mt-3">
                      {q.options.map((o, i) => {
                        const resultForQuestion = results?.find((r) => r.questionId === q.id);
                        const isSelected = userAnswers[q.id] === o;

                        // This function determines the background color of the option based on the quiz state.
                        const getOptionClassName = () => {
                          // After the quiz is submitted, show correctness.
                          if (resultForQuestion) {
                            if (resultForQuestion.userAnswer === o) {
                              // If this was the user's answer, color it green for correct, red for incorrect.
                              return resultForQuestion.isCorrect ? 'bg-green-100' : 'bg-red-100';
                            }
                            // Unselected options remain white.
                            return 'bg-white';
                          }
                          // Before submission, highlight the selected option in blue.
                          if (isSelected) {
                            return 'bg-blue-100';
                          }
                          // Default state for unselected options before submission.
                          return 'bg-white hover:bg-blue-50';
                        };

                        return (
                          <div
                            key={i}
                            className={`p-3 border rounded transition cursor-pointer ${getOptionClassName()}`}
                            onClick={() => !resultForQuestion && handleAnswerChange(q.id, o)}
                          >
                            <ReactMarkdown components={{ p: ({ node, ...props }) => <p {...props} /> }}>
                              {o}
                            </ReactMarkdown>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SAQ */}
                  {q.type === 'saq' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Your Answer:</label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded bg-white"
                        rows={3}
                        placeholder="Write your answer here..."
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* LAQ */}
                  {q.type === 'laq' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Your Answer:</label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded bg-white"
                        rows={6}
                        placeholder="Write your detailed answer here..."
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {showAnswers && (
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                      <p className="font-semibold text-sm text-gray-700">Correct Answer:</p>
                      <div className="text-gray-900">
                        <ReactMarkdown
                          components={{ p: ({ node, ...props }) => <p className="prose" {...props} /> }}
                        >
                          {Array.isArray(q.answer) ? q.answer.join('; ') : q.answer}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500 disabled:bg-gray-400"
              onClick={handleSubmit}
              disabled={!!results}
            >
              Submit Answers
            </button>
            {results && (
              <>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => setShowAnswers(!showAnswers)}
                >
                  {showAnswers ? 'Hide Answers' : 'View Answers'}
                </button>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={handleReattempt}
                >
                  Re-attempt
                </button>
              </>
            )}
          </div>
          {score !== null && (
            <div className="font-semibold text-lg text-center sm:text-right">
              Your Score: {score} / {currentQuiz.questions.length}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] bg-white border rounded-md overflow-auto flex items-center justify-center">
      <div className="text-gray-400">PDF Viewer placeholder (use PDF.js or viewer library)</div>
    </div>
  );
}
