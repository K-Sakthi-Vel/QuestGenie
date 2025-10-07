import React from 'react';
import { usePdf } from '../contexts/PdfContext';
import { useUI } from '../contexts/UIContext';
import SourceItem from './SourceItem';

export default function SourceList() {
    const { files, setActiveFile } = usePdf();
    const { setActiveView } = useUI();

    const handleOpenPdf = (file) => {
        setActiveFile(file);
        setActiveView('pdf-workspace');
    };

    // placeholder data when empty
    const demo = files.length === 0;

    return (
        <div className="space-y-2">
            {demo ? (
                <div className="text-sm text-gray-500">No PDFs yet. Use "Upload PDF" to add course material.</div>
            ) : (
                files.map((f) => <SourceItem key={f.id} file={f} onOpen={() => handleOpenPdf(f)} />)
            )}
        </div>
    );
}
