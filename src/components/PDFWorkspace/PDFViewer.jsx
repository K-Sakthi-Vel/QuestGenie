import React from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import ReactMarkdown from 'react-markdown';

export default function PDFViewer() {
  const { currentQuiz, loading } = useQuiz();

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

            return (
              <div
                key={q.id}
                className="p-4 border rounded-md shadow-sm hover:shadow-md transition-all bg-gray-50"
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
                        className="p-3 border rounded bg-white hover:bg-blue-50 transition cursor-pointer"
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
                    />
                    {q.answer && (
                      <div className="mt-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                        <div className="font-semibold text-gray-700 mb-1">Suggested Answer:</div>
                        <ReactMarkdown components={{ p: ({ node, ...props }) => <p {...props} /> }}>
                          {q.answer}
                        </ReactMarkdown>
                      </div>
                    )}
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
                    />
                    {Array.isArray(q.answer) && (
                      <div className="mt-4 p-3 border-l-4 border-green-500 bg-green-50 rounded">
                        <div className="font-semibold text-gray-700 mb-2">Expected Points:</div>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {q.answer.map((point, idx) => (
                            <li key={idx}>
                              <ReactMarkdown components={{ p: ({ node, ...props }) => <p {...props} /> }}>
                                {point}
                              </ReactMarkdown>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
