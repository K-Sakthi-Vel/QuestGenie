import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { listPdfs, getPdf, deletePdf } from '../utils/idbHelper' // Import IndexedDB helpers


const PdfContext = createContext()
export const usePdf = () => useContext(PdfContext)


export function PdfProvider({ children }) {
    const [files, setFiles] = useState([]) // {id,title,pages,previewUrl, blobKey}
    const [activeFile, setActiveFile] = useState(null) // {id,title,pages,previewUrl, blobKey}
    const [selection, setSelection] = useState(null) // {page,rect,text}

    // Function to load files from IndexedDB
    const loadFilesFromIndexedDB = useCallback(async () => {
        console.log("Attempting to load files from IndexedDB...")
        try {
            const storedPdfs = await listPdfs()
            console.log("Pdfs retrieved from IndexedDB:", storedPdfs)
            const loadedFiles = storedPdfs.map(pdf => ({
                id: pdf.key,
                title: pdf.name,
                size: pdf.blob.size,
                preview: URL.createObjectURL(pdf.blob), // Create object URL for preview
                blobKey: pdf.key, // Store key to retrieve blob later
                // pages: will be populated by PDFViewer or similar component
            }))
            setFiles(loadedFiles)
            console.log("Files set in PdfContext state:", loadedFiles)

            const storedActiveFileId = localStorage.getItem('activeFileId')
            if (storedActiveFileId) {
                const foundFile = loadedFiles.find(f => f.id === storedActiveFileId)
                if (foundFile) {
                    setActiveFile(foundFile)
                    console.log("Active file restored from IndexedDB:", foundFile)
                } else {
                    setActiveFile(null)
                    localStorage.removeItem('activeFileId')
                    console.log("Stored active file not found, cleared activeFileId.")
                }
            } else if (loadedFiles.length > 0) {
                setActiveFile(loadedFiles[0])
                localStorage.setItem('activeFileId', loadedFiles[0].id)
                console.log("No active file stored, set first loaded file as active:", loadedFiles[0])
            }
        } catch (error) {
            console.error("Failed to load PDFs from IndexedDB", error)
        }
    }, [])

    // Load files from IndexedDB on component mount
    useEffect(() => {
        loadFilesFromIndexedDB()
        // Cleanup object URLs when component unmounts or files change
        return () => {
            files.forEach(file => {
                if (file.preview) URL.revokeObjectURL(file.preview)
            })
        }
    }, [loadFilesFromIndexedDB]) // Re-run if loadFilesFromIndexedDB changes (unlikely with useCallback)

    // Effect to save activeFile.id to localStorage whenever activeFile changes
    useEffect(() => {
        try {
            if (activeFile) {
                localStorage.setItem('activeFileId', activeFile.id)
            } else {
                localStorage.removeItem('activeFileId')
            }
        } catch (error) {
            console.error("Failed to set activeFileId in localStorage", error)
        }
    }, [activeFile])

    const addFile = (file) => { // file here is {id, title, size, preview, blobKey}
        console.log("Adding file to PdfContext state:", file)
        setFiles((s) => [file, ...s])
        // No need to save to localStorage here, as files are managed by IndexedDB
    }

    const removeFile = async (fileId) => {
        try {
            await deletePdf(fileId)
            setFiles((s) => s.filter(f => f.id !== fileId))
            if (activeFile && activeFile.id === fileId) {
                setActiveFile(null)
                localStorage.removeItem('activeFileId')
            }
            // Revoke object URL for the deleted file
            const fileToRemove = files.find(f => f.id === fileId)
            if (fileToRemove && fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview)
        } catch (error) {
            console.error("Failed to delete PDF from IndexedDB", error)
        }
    }

    return (
        <PdfContext.Provider
            value={{ files, addFile, removeFile, activeFile, setActiveFile, selection, setSelection }}
        >
            {children}
        </PdfContext.Provider>
    )
}
