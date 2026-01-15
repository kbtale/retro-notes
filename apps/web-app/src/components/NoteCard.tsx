import { useState, type ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/8bit/card';
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

    const truncatedContent =
        note.content.length > 100 ? `${note.content.slice(0, 100)}...` : note.content;

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(note.id);
    };

    return (
        <>
            <Card className="flex flex-col transition-transform hover:-translate-y-0.5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm md:text-base">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                    <p className="text-xs text-muted-foreground md:text-sm">{truncatedContent}</p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(note)}
                        className="text-xs"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onArchive(note.id, !note.isArchived)}
                        className="text-xs"
                    >
                        {note.isArchived ? 'Restore' : 'Archive'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteClick}
                        className="text-xs text-destructive"
                    >
                        Delete
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
