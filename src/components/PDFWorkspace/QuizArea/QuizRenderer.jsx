import React, { useState } from 'react';
import { useQuiz } from '../../../contexts/QuizContext';
import ReactMarkdown from 'react-markdown';

export default function QuizRenderer() {
  const { currentQuiz, loading } = useQuiz();
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(null);

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!currentQuiz) return;

    const calculatedResults = currentQuiz.questions.map((q) => {
      const userAnswer = userAnswers[q.id];
      let isCorrect = false;

      if (q.type === 'mcq') {
        isCorrect = userAnswer === q.answer; // Compare user answer directly with the correct answer
      } else if (q.type === 'saq' || q.type === 'laq') {
        if (typeof q.answer === 'string') {
          isCorrect = userAnswer && userAnswer.trim() === q.answer.trim();
        } else if (Array.isArray(q.answer)) {
          isCorrect = q.answer.some((ans) => userAnswer && userAnswer.trim() === ans.trim());
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

    // Store results and score in localStorage
    const storedResults = JSON.parse(localStorage.getItem('quizResults')) || [];
    localStorage.setItem('quizResults', JSON.stringify([...storedResults, ...calculatedResults]));
    localStorage.setItem('quizScore', JSON.stringify(totalScore));

    alert('Your answers have been submitted!');
  };

  if (loading) {
    return (
      <div className="w-full h-[70vh] bg-white border rounded-md overflow-auto flex flex-col items-center justify-center p-6">
        <div
          className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"
          style={{ borderTopColor: '#007bff' }}
        />
        <p className="mt-4 text-gray-600 font-medium">Generating questions — this may take a few minutes.</p>
      </div>
    );
  }

  if (currentQuiz) {
    return (
      <div className="w-full h-[70vh] bg-white border rounded-md overflow-auto p-4">
        <div className="font-semibold mb-4 text-lg">Generated Quiz</div>

        <div className="space-y-6">
          {currentQuiz.questions.map((q) => {
            const questionText = q.question || q.text || 'Question not provided';
            const result = results?.find((r) => r.questionId === q.id);

            return (
              <div
                key={q.id}
                className={`p-4 border rounded-md shadow-sm hover:shadow-md transition-all bg-gray-50 ${
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
                    {q.options.map((o, i) => (
                      <div
                        key={i}
                        className={`p-3 border rounded bg-white hover:bg-blue-50 transition cursor-pointer ${
                          userAnswers[q.id] === o ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => handleAnswerChange(q.id, o)}
                      >
                        <ReactMarkdown components={{ p: ({ node, ...props }) => <p {...props} /> }}>
                          {o}
                        </ReactMarkdown>
                      </div>
                    ))}
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
              </div>
            );
          })}
        </div>

        {score !== null && (
          <div className="mt-6 p-4 border rounded bg-blue-50">
            <div className="font-semibold text-lg">
              Your Score: {score} / {currentQuiz.questions.length}
            </div>
          </div>
        )}

        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Submit Answers
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] bg-white border rounded-md overflow-auto flex items-center justify-center">
      <div className="text-gray-400">PDF Viewer placeholder (use PDF.js or viewer library)</div>
    </div>
  );
}
