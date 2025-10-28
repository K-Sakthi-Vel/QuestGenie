import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../primitives/Button'
import { usePdf } from '../../contexts/PdfContext'
import { useQuiz } from '../../contexts/QuizContext'
import { getPdf } from '../../utils/idbHelper' // Import IndexedDB getPdf
import mockQuiz from '../../sample-payloads/mockQuiz.json';


export default function PDFToolbar({ useMockData }) { // Accept useMockData as a prop
    const { activeFile } = usePdf()
    const { setCurrentQuiz, setLoading, setQuizGenerated } = useQuiz() // Import setQuizGenerated
    const [isGenerating, setIsGenerating] = useState(false)

    // useMockData is now passed as a prop, no need to read from env here.

    const handleGenerateQuiz = async () => {
        if (!activeFile || !activeFile.blobKey) {
            alert('No active PDF selected or PDF content missing. Please upload and select a PDF first.')
            return
        }

        setIsGenerating(true)
        setLoading(true)

        try {
            if (useMockData) {
                // Simulate API call delay for mock data
                await new Promise(resolve => setTimeout(resolve, 7000)); // 2-second delay
                setCurrentQuiz({ ...mockQuiz, sourceId: activeFile.id, title: activeFile.title.replace(/\.pdf$/i, "") }, activeFile.id);
                setQuizGenerated(true); // Set quizGenerated to true
                toast.success('Mock Quiz generated successfully!');
            } else {
                const pdfRecord = await getPdf(activeFile.blobKey)
                if (!pdfRecord || !pdfRecord.blob) {
                    throw new Error("PDF file not found in IndexedDB.")
                }

                const form = new FormData()
                form.append('file', pdfRecord.blob, activeFile.title || 'document.pdf')

                const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'
                const resp = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: form })
                if (!resp.ok) {
                    const txt = await resp.text()
                    throw new Error(txt || `Upload failed: ${resp.status}`)
                }
                const json = await resp.json()

                const mapped = (json.questions || []).map((q, i) => ({
                    id: q.id || `gen-${i}`,
                    type: q.type || 'saq',
                    text: q.question || q.text || null,
                    question: q.question || q.text || null,
                    options: q.options || q.choices || null,
                    answer: q.answer || null,
                    expected_points: q.expected_points || null,
                    source_page: q.source_page || null,
                    rawModelOutput: q.rawModelOutput || q.raw || null
                }))

                setCurrentQuiz({ id: json.jobId || activeFile.id, questions: mapped, meta: { partial: json.partial }, title: activeFile.title.replace(/\.pdf$/i, "") }, activeFile.id)
                setQuizGenerated(true); // Set quizGenerated to true
                toast.success('Quiz generated successfully!')
            }
        } catch (err) {
            console.error('Generate quiz error', err)
            toast.error('Generating quiz failed: ' + (err.message || String(err)))
            setQuizGenerated(false); // Reset quizGenerated on error
        } finally {
            setIsGenerating(false)
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-between gap-3 p-3 bg-white shadow-sm h-[60px]">
            <div className="flex items-center gap-2">
            </div>
            <div className="flex items-center gap-2">
                <Button color="primary" onClick={handleGenerateQuiz} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate Quiz'}
                </Button>
            </div>
        </div>
    )
}
