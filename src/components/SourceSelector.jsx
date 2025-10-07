import React, { useMemo, useState, useEffect } from 'react'
import SourceItem from './SourceItem'
import { usePdf } from '../contexts/PdfContext'
import { putPdf } from '../utils/idbHelper' // Import IndexedDB putPdf

// SourceSelector
// - Displays a seeded list of NCERT Class XI Physics PDFs
// - Allows uploading PDFs (mocked locally) and selecting between "All Uploaded PDFs" or a specific PDF
// - Props: initialFiles (array), onSelect(fileOrMode)
export default function SourceSelector({ initialFiles = [], onSelect = () => {} }) {
    const { files: ctxFiles = [], activeFile, setActiveFile, addFile } = usePdf()

    // Seeded NCERT Class XI Physics PDFs (display-only sample data)
    const seeded = useMemo(
        () => [
            { id: 'seed-1', title: 'NCERT Class XI Physics — Mechanics (Chapters 1–4)', pages: 72, seeded: true },
            { id: 'seed-2', title: 'NCERT Class XI Physics — Waves & Oscillations', pages: 48, seeded: true },
            { id: 'seed-3', title: 'NCERT Class XI Physics — Heat & Thermodynamics', pages: 56, seeded: true },
            { id: 'seed-4', title: 'NCERT Class XI Physics — Optics (Selected Topics)', pages: 40, seeded: true },
            { id: 'seed-5', title: 'NCERT Class XI Physics — Electricity Basics', pages: 60, seeded: true },
        ],
        []
    )

    // Combine sources: props -> context -> seeded (props and context take precedence)
    const combinedFiles = useMemo(() => {
        // avoid duplicate ids
        const map = new Map()
        ;[...initialFiles, ...ctxFiles, ...seeded].forEach((f) => {
            if (!f) return
            map.set(f.id || f.title || JSON.stringify(f), f)
        })
        return Array.from(map.values())
    }, [initialFiles, ctxFiles, seeded])

    const [mode, setMode] = useState('all') // 'all' | 'single'
    const [selectedId, setSelectedId] = useState(activeFile ? activeFile.id : (combinedFiles.length ? combinedFiles[0].id : null))

    // Update selectedId when activeFile changes
    useEffect(() => {
        if (activeFile) {
            setSelectedId(activeFile.id)
            setMode('single')
        } else if (combinedFiles.length > 0) {
            setSelectedId(combinedFiles[0].id)
            setMode('single')
        } else {
            setSelectedId(null)
        }
    }, [activeFile, combinedFiles])


    async function handleFileInput(e) {
        const list = Array.from(e.target.files || [])
        if (list.length === 0) return

        for (const file of list) {
            try {
                const fileId = `uploaded-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
                console.log("Attempting to put PDF to IndexedDB:", { key: fileId, name: file.name, blob: file })
                await putPdf({ key: fileId, name: file.name, blob: file })
                console.log("PDF successfully put to IndexedDB:", fileId)

                const newFile = {
                    id: fileId,
                    title: file.name,
                    size: file.size,
                    preview: URL.createObjectURL(file), // Create object URL for immediate preview
                    blobKey: fileId, // Store key to retrieve blob later
                    // pages: will be populated by PDFViewer or similar component
                }
                console.log("New file object created for PdfContext:", newFile)
                addFile(newFile)
                setActiveFile(newFile)
                setSelectedId(newFile.id)
                setMode('single')
            } catch (error) {
                console.error("Error processing file:", file.name, error)
            }
        }
    }

    function handlePick(file) {
        setSelectedId(file.id)
        setMode('single')
        onSelect(file)
        if (setActiveFile) setActiveFile(file)
    }

    function handleModeChange(e) {
        const val = e.target.value
        setMode(val)
        if (val === 'all') onSelect({ mode: 'all' })
        else if (val === 'single') {
            const f = combinedFiles.find((c) => c.id === selectedId) || combinedFiles[0]
            if (f) onSelect(f)
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm max-w-md mx-auto">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-semibold">Choose source</h3>
                    <p className="text-xs text-gray-500">Seeded NCERT Class XI Physics PDFs plus your uploads</p>
                </div>
                <label className="flex items-center gap-2 text-xs">
                    <span className="sr-only">Upload PDF</span>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileInput}
                        className="hidden"
                        id="source-upload-input"
                    />
                    <button
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 focus:outline-none"
                        onClick={() => document.getElementById('source-upload-input').click()}
                    >
                        Upload PDF
                    </button>
                </label>
            </div>

            <div className="mt-4">
                <fieldset className="flex gap-3 items-center text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="source-mode"
                            value="all"
                            checked={mode === 'all'}
                            onChange={handleModeChange}
                            className="h-4 w-4 text-indigo-600"
                        />
                        <span>All Uploaded PDFs</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="source-mode"
                            value="single"
                            checked={mode === 'single'}
                            onChange={handleModeChange}
                            className="h-4 w-4 text-indigo-600"
                        />
                        <span>Pick a PDF</span>
                    </label>
                </fieldset>
            </div>

            <div className="mt-4 space-y-2">
                {mode === 'all' ? (
                    <div className="text-sm text-gray-600">All uploaded PDFs will be used as source material.</div>
                ) : (
                    <div className="space-y-2">
                        {combinedFiles.length === 0 ? (
                            <div className="text-sm text-gray-500">No sources available. Upload or use seeded PDFs below.</div>
                        ) : (
                            combinedFiles.map((f) => (
                                <div
                                    key={f.id}
                                    className={`p-2 rounded-lg border ${selectedId === f.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:bg-gray-50'} flex items-center justify-between`}
                                >
                                    <div className="flex-1" onClick={() => handlePick(f)}>
                                        <div className="font-medium text-sm truncate">{f.title}</div>
                                        <div className="text-xs text-gray-500">{f.pages ? `${f.pages} pages` : f.seeded ? 'Seeded' : '\u2014'}</div>
                                    </div>
                                    <div className="ml-3">
                                        <button
                                            onClick={() => handlePick(f)}
                                            className="text-xs px-2 py-1 bg-white border rounded text-indigo-600 shadow-sm hover:bg-indigo-50"
                                        >
                                            Select
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    )}
            </div>

            <div className="mt-4 pt-3 border-t text-right">
                <button
                    onClick={() => onSelect(mode === 'all' ? { mode: 'all' } : combinedFiles.find((c) => c.id === selectedId))}
                    className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
                    disabled={mode === 'single' && combinedFiles.length === 0}
                >
                    Apply
                </button>
            </div>
        </div>
    )
}
