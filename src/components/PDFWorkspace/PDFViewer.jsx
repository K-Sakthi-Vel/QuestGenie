import React from 'react';
import { useQuiz } from '../../contexts/QuizContext';

export default function PDFViewer() {
    const { currentQuiz } = useQuiz();

    if (currentQuiz) {
        return (
            <div className="w-full h-[70vh] bg-white border rounded-md overflow-auto p-4">
                <div className="font-semibold mb-4">Generated Quiz</div>
                <div className="space-y-4">
                    {currentQuiz.questions.map((q) => (
                        <div key={q.id} className="p-4 border rounded-md">
                            <div className="font-medium mb-2">{q.text}</div>
                            {q.type === 'mcq' && (
                                <div className="grid gap-2">
                                    {q.options.map((o, i) => (
                                        <button key={i} className="text-left p-3 border rounded hover:shadow-sm">
                                            {o}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {q.type === 'saq' && (
                                <textarea className="w-full mt-2 p-2 border rounded" rows={3} placeholder="Write your answer here..." />
                            )}
                        </div>
                    ))}
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