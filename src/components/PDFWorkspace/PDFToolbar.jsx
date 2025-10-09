import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../primitives/Button'
import { usePdf } from '../../contexts/PdfContext'
import { useQuiz } from '../../contexts/QuizContext'
import { getPdf } from '../../utils/idbHelper' // Import IndexedDB getPdf


export default function PDFToolbar() {
    const { activeFile } = usePdf()
    const { setCurrentQuiz, setLoading } = useQuiz()
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateQuiz = async () => {
        if (!activeFile || !activeFile.blobKey) {
            alert('No active PDF selected or PDF content missing. Please upload and select a PDF first.')
            return
        }

        setIsGenerating(true)
        setLoading(true)
        try {
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
            toast.success('Quiz generated successfully!')
        } catch (err) {
            console.error('Generate quiz error', err)
            toast.error('Generating quiz failed: ' + (err.message || String(err)))
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
