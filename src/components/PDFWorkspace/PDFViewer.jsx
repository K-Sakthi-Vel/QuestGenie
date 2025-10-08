import React, { useState, useEffect, useRef, useCallback  } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { usePdf } from '../../contexts/PdfContext'; // Import usePdf
import ReactMarkdown from 'react-markdown';
import * as pdfjs from 'pdfjs-dist';
import QuizRenderer from './QuizArea/QuizRenderer'; // Import QuizRenderer

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

export default function PDFViewer() {
  const { currentQuiz, loading, fetchQuizForSource, clearQuiz } = useQuiz();
  const { activeFile } = usePdf(); // Get activeFile from PdfContext
  const [userAnswers, setUserAnswers] = useState({}); // will store index for MCQ, string for SAQ/LAQ
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(null);

  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageRendering, setPageRendering] = useState(false);
  const [pageNumPending, setPageNumPending] = useState(null);
    console.log('Active file in PDFViewer:', activeFile);
  const renderPage = useCallback(async (num) => {
    setPageRendering(true);
    const pdfPage = await pdfDoc.getPage(num);
    const viewport = pdfPage.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext,
      viewport,
    };

    const renderTask = pdfPage.render(renderContext);
    renderTask.promise.then(() => {
      setPageRendering(false);
      if (pageNumPending !== null) {
        setPageNum(pageNumPending);
        setPageNumPending(null);
      }
    });
  }, [pdfDoc, pageNumPending]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum);
    }
  }, [pdfDoc, pageNum, renderPage]);

  useEffect(() => {
    const loadPdf = async () => {
      if (activeFile && activeFile.blob) {
        try {
          const arrayBuffer = await activeFile.blob.arrayBuffer();
          const loadingTask = pdfjs.getDocument({
            data: arrayBuffer,
            wasmUrl: `${process.env.PUBLIC_URL}/`,
          });
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setPageNum(1); // Reset to first page when a new PDF is loaded
        } catch (error) {
          console.error('Error loading PDF:', error);
          setPdfDoc(null);
        }
      } else {
        setPdfDoc(null);
      }
    };
    loadPdf();
  }, [activeFile]);

  // Effect to fetch quiz when activeFile changes
  useEffect(() => {
    const fetchQuiz = async () => {
      // Assuming activeFile has an 'id' property that uniquely identifies the source.
      // If not, 'name' or another property might be used.
      if (activeFile && activeFile.id) {
        // Call the function from QuizContext to fetch the quiz for this source ID
        await fetchQuizForSource(activeFile.id);
      } else {
        // If no active file or no identifier, clear the current quiz.
        clearQuiz();
      }
    };

    fetchQuiz();
  }, [activeFile]); // Re-run this effect whenever activeFile changes

  const onPrevPage = () => {
    if (pageNum <= 1) {
      return;
    }
    if (pageRendering) {
      setPageNumPending(pageNum - 1);
    } else {
      setPageNum(pageNum - 1);
    }
  };

  const onNextPage = () => {
    if (pdfDoc && pageNum >= pdfDoc.numPages) {
      return;
    }
    if (pageRendering) {
      setPageNumPending(pageNum + 1);
    } else {
      setPageNum(pageNum + 1);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    // For MCQ we'll pass the option index (number).
    // For SAQ/LAQ we'll pass the string value.
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!currentQuiz) return;

    const calculatedResults = currentQuiz.questions.map((q) => {
      const userAnswer = userAnswers[q.id];

      let isCorrect = false;
      let correctAnswerDisplay = q.answer ?? q.correctOption;

      if (q.type === 'mcq') {
        // Normalize correct answer: can be number (index), string (index or option text)
        let correctIndex = null;
        let correctText = null;

        if (typeof q.answer === 'number') {
          correctIndex = q.answer;
          correctText = q.options?.[correctIndex];
        } else if (typeof q.answer === 'string') {
          // Try parsing as index
          const parsed = parseInt(q.answer, 10);
          if (!isNaN(parsed) && q.options && parsed >= 0 && parsed < q.options.length) {
            correctIndex = parsed;
            correctText = q.options[parsed];
          } else {
            // treat q.answer as text
            correctText = q.answer;
            correctIndex = q.options ? q.options.findIndex((opt) => opt === q.answer) : -1;
            if (correctIndex === -1) correctIndex = null;
          }
        } else if (Array.isArray(q.answer)) {
          // If multiple possible correct answers are provided, try to match any as text or index
          const possible = q.answer;
          // prefer index if any member is index-like
          const parsedIndex = possible.map((a) => {
            const p = parseInt(a, 10);
            return !isNaN(p) ? p : null;
          }).find((p) => p !== null && q.options && p >= 0 && p < q.options.length);
          if (parsedIndex !== undefined) {
            correctIndex = parsedIndex;
            correctText = q.options[parsedIndex];
          } else {
            // fallback to text
            correctText = possible.find((a) => typeof a === 'string');
            correctIndex = q.options ? q.options.findIndex((opt) => opt === correctText) : null;
            if (correctIndex === -1) correctIndex = null;
          }
        }

        // userAnswer should be an index (number). If it's string, try to parse number.
        let selectedIndex = null;
        if (typeof userAnswer === 'number') {
          selectedIndex = userAnswer;
        } else if (typeof userAnswer === 'string') {
          const p = parseInt(userAnswer, 10);
          selectedIndex = !isNaN(p) ? p : null;
        }

        const selectedText = (selectedIndex !== null && q.options && q.options[selectedIndex] !== undefined)
          ? q.options[selectedIndex]
          : // if userAnswer stored text (edge-case), accept that too
            (typeof userAnswer === 'string' ? userAnswer : null);

        // Compare either by index (if available) or by text
        if (selectedIndex !== null && correctIndex !== null) {
          isCorrect = selectedIndex === correctIndex;
        } else if (selectedText !== null && correctText !== null) {
          isCorrect = selectedText.trim() === correctText.trim();
        } else {
          isCorrect = false;
        }

        // For display store the human-readable correct text if available
        correctAnswerDisplay = correctText ?? correctAnswerDisplay;
      } else if (q.type === 'saq' || q.type === 'laq') {
        const userText = typeof userAnswer === 'string' ? userAnswer.trim() : '';
        if (typeof q.answer === 'string') {
          isCorrect = userText && userText === q.answer.trim();
        } else if (Array.isArray(q.answer)) {
          isCorrect = q.answer.some((ans) => userText && userText === ans.trim());
        }
      }

      return {
        questionId: q.id,
        isCorrect,
        userAnswer,
        correctAnswer: correctAnswerDisplay,
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
      <div className="w-full h-[calc(100vh-65px)] bg-white border overflow-auto flex flex-col items-center justify-center p-6">
        <div
          className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"
          style={{ borderTopColor: '#007bff' }}
        />
        <p className="mt-4 text-gray-600 font-medium">Generating questions — this may take a few minutes.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[100%] bg-white border overflow-hidden flex flex-col">
      {loading ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <div
            className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"
            style={{ borderTopColor: '#007bff' }}
          />
          <p className="mt-4 text-gray-600 font-medium">Generating questions — this may take a few minutes.</p>
        </div>
      ) : currentQuiz && currentQuiz.questions && currentQuiz.questions.length > 0 ? (
        <QuizRenderer
          quiz={currentQuiz}
          userAnswers={userAnswers}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmit}
          results={results}
          score={score}
        />
      ) : activeFile && pdfDoc ? (
        <>
          <div className="flex items-center justify-between p-2 border-b">
            <button
              onClick={onPrevPage}
              disabled={pageNum <= 1 || pageRendering}
              className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {pageNum} of {pdfDoc ? pdfDoc.numPages : '...'}
            </span>
            <button
              onClick={onNextPage}
              disabled={pdfDoc && pageNum >= pdfDoc.numPages || pageRendering}
              className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="flex-1 overflow-auto flex justify-center items-center">
            <canvas ref={canvasRef} className="max-w-full h-auto shadow-md" />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600">Curious about what's in your PDF?</h3>
          <p className="text-gray-400 mt-1">Let our AI generate some questions for you. Get started from the panel on the right.</p>
        </div>
      )}
    </div>
  );
}
