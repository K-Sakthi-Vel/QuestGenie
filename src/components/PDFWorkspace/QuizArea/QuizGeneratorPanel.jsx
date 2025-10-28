import React, { useState } from 'react';
import Button from '../../primitives/Button';
import { useQuiz } from '../../../contexts/QuizContext';
import { usePdf } from '../../../contexts/PdfContext';
import toast from 'react-hot-toast';
import { getPdfBlob } from '../../../utils/idbHelper'; // Import getPdfBlob

export default function QuizGeneratorPanel() { // useMockData is now passed via QuizProvider
    const { fetchQuizForSource, setLoading } = useQuiz(); // Get fetchQuizForSource from context
    const { activeFile } = usePdf();
    const [questionCount, setQuestionCount] = useState(5); // Default count

    const handleGenerateQuiz = async () => {
        if (!activeFile || !activeFile.blobKey) {
            toast.error("Please upload a PDF first.");
            return;
        }

        setLoading(true);
        try {
            const pdfBlob = await getPdfBlob(activeFile.blobKey);
            if (!pdfBlob) {
                toast.error("Failed to retrieve PDF file.");
                return;
            }

            await fetchQuizForSource(activeFile.id, pdfBlob); // Call context function
            toast.success("Quiz generated successfully!");

        } catch (error) {
            console.error("Error generating quiz:", error);
            toast.error(`Failed to generate quiz: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-md shadow-sm">
            <div className="font-semibold mb-2">Generate Quiz</div>
            <div className="text-sm text-gray-600 mb-4">Choose source pages, types and difficulty.</div>
            <label className="block text-xs text-gray-500">Question Type</label>
            <div className="flex gap-2 my-2">
                <Button size="sm">MCQ</Button>
                <Button size="sm">SAQ</Button>
                <Button size="sm">LAQ</Button>
            </div>
            <label className="block text-xs text-gray-500 mt-3">Count</label>
            <input
                type="number"
                defaultValue={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
            />
            <div className="mt-4">
                <Button className="w-full" onClick={handleGenerateQuiz}>Generate Preview</Button>
            </div>
        </div>
    );
}
