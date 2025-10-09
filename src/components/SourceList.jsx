import React, { useState } from 'react';
import { usePdf } from '../contexts/PdfContext';
import { useUI } from '../contexts/UIContext';
import { useQuiz } from '../contexts/QuizContext';
import SourceItem from './SourceItem';
import ConfirmDeleteDialog from './primitives/ConfirmDeleteDialog';

export default function SourceList() {
    const { files, activeFile, setActiveFile, deleteFile } = usePdf();
    const { setActiveView } = useUI();
    const { getScoreForSource } = useQuiz();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

    const handleOpenPdf = (file) => {
        setActiveFile(file);
        setActiveView('pdf-workspace');
    };

    const openDeleteDialog = (fileId) => {
        setFileToDelete(fileId);
        setIsDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setFileToDelete(null);
        setIsDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (fileToDelete) {
            await deleteFile(fileToDelete);
        }
        closeDeleteDialog();
    };

    // placeholder data when empty
    const demo = files.length === 0;

    return (
        <>
            <div className="space-y-2">
                {demo ? (
                    <div className="text-sm text-gray-500">No PDFs yet. Use "Upload PDF" to add course material.</div>
                ) : (
                    files.map((f) => (
                        <SourceItem
                            key={f.id}
                            file={f}
                            onOpen={() => handleOpenPdf(f)}
                            onDelete={() => openDeleteDialog(f.id)}
                            isSelected={activeFile && activeFile.id === f.id}
                            score={getScoreForSource(f.id)}
                        />
                    ))
                )}
            </div>
            <ConfirmDeleteDialog
                isOpen={isDialogOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteConfirm}
                title="Delete Source"
            >
                Are you sure you want to delete this source? This action cannot be undone.
            </ConfirmDeleteDialog>
        </>
    );
}
