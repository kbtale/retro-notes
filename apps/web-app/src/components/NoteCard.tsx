import { useState, type ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/8bit/card';
import { Button } from '@/components/ui/8bit/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Note } from '@/types';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onArchive: (id: number, isArchived: boolean) => void;
    onDelete: (id: number) => void;
}

export function NoteCard({ note, onEdit, onArchive, onDelete }: NoteCardProps): ReactNode {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);



    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(note.id);
    };

    return (
        <>
            <Card className="flex flex-col transition-transform hover:-translate-y-0.5 h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm md:text-base line-clamp-2 break-words">
                        {note.title}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex justify-end gap-1 pt-2 mt-auto border-t border-border/50">
                    <Button
                        variant="default"
                        size="icon"
                        onClick={() => onEdit(note)}
                        aria-label="Edit note"
                        className="h-8 w-8"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                        </svg>
                    </Button>
                    <Button
                        variant="default"
                        size="icon"
                        onClick={() => onArchive(note.id, !note.isArchived)}
                        aria-label={note.isArchived ? 'Restore note' : 'Archive note'}
                        className="h-8 w-8"
                    >
                        {note.isArchived ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                <path d="M3 3v5h5"/>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="5" x="2" y="3" rx="1"/>
                                <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
                                <path d="M10 12h4"/>
                            </svg>
                        )}
                    </Button>
                    <Button
                        variant="default"
                        size="icon"
                        onClick={handleDeleteClick}
                        aria-label="Delete note"
                        className="h-8 w-8"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </Button>
                </CardFooter>
            </Card>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Note"
                description={`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
            />
        </>
    );
}
