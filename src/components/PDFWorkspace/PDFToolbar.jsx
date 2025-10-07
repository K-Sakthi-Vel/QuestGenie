import React, { useState } from 'react'
import Button from '../primitives/Button'
import { usePdf } from '../../contexts/PdfContext'
import { useQuiz } from '../../contexts/QuizContext'


export default function PDFToolbar() {
    const { activeFile } = usePdf()
    const { setCurrentQuiz, setLoading } = useQuiz()
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateQuiz = async () => {
        if (!activeFile) {
            alert('No active PDF selected. Please upload and select a PDF first.')
            return
        }
        // The uploaded file object should be stored on activeFile._file by the upload UI
        const fileObj = activeFile._file
        if (!fileObj) {
            alert('No raw file available for the selected PDF. Please re-upload the file from the top bar.')
            return
        }

        setIsGenerating(true)
        setLoading(true)
        try {
            const form = new FormData()
            form.append('file', fileObj)

            const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000'
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

            setCurrentQuiz({ id: json.jobId || activeFile.id, questions: mapped, meta: { partial: json.partial } })
        } catch (err) {
            console.error('Generate quiz error', err)
            alert('Generating quiz failed: ' + (err.message || String(err)))
        } finally {
            setIsGenerating(false)
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-md shadow-sm">
            <div className="flex items-center gap-2">
                <Button size="sm" disabled={isGenerating}>Prev</Button>
                <Button size="sm" disabled={isGenerating}>Next</Button>
                <div className="px-2 text-sm text-gray-600">Page 1 / 10</div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" disabled={isGenerating}>Zoom -</Button>
                <Button variant="ghost" disabled={isGenerating}>Zoom +</Button>
                <Button color="primary" onClick={handleGenerateQuiz} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate Quiz'}
                </Button>
            </div>
        </div>
    )
}