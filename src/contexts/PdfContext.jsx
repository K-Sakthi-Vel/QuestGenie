import React, { createContext, useState, useContext } from 'react'


const PdfContext = createContext()
export const usePdf = () => useContext(PdfContext)


export function PdfProvider({ children }) {
    const [files, setFiles] = useState([]) // {id,title,pages,preview}
    const [activeFile, setActiveFile] = useState(null)
    const [selection, setSelection] = useState(null) // {page,rect,text}


    const addFile = (file) => setFiles((s) => [file, ...s])
    return (
        <PdfContext.Provider
            value={{ files, addFile, activeFile, setActiveFile, selection, setSelection }}
        >
            {children}
        </PdfContext.Provider>
    )
}