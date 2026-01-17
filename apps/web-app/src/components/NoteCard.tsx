import { useState, type ReactNode } from 'react';
import { Edit, Archive, Reload, Trash } from '@nsmr/pixelart-react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/8bit/card';
import { Button } from '@/components/ui/8bit/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PixelPushpin } from '@/components/icons/PixelPushpin';
import type { Note } from '@/types';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onArchive: (id: number) => void;
    onPin: (id: number) => void;
    onDelete: (id: number) => void;
}

export function NoteCard({ note, onEdit, onArchive, onPin, onDelete }: NoteCardProps): ReactNode {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(note.id);
    };

    return (
        <>
            <Card className="relative flex flex-col transition-transform hover:-translate-y-0.5 h-full">
                {/* Pinned indicator in top-right corner */}
                {note.isPinned && (
                    <div className="absolute -top-2 -right-2 z-10">
                        <PixelPushpin size={28} className="drop-shadow-md" />
                    </div>
                )}
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm md:text-base line-clamp-2 break-words">
                            {note.title}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardFooter className="flex justify-end gap-1 pt-2 mt-auto border-t border-border/50">
                    <Button
                        variant="default"
                        size="icon"
                        onClick={() => onPin(note.id)}
                        aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
                        className="h-8 w-8"
                    >
                        <PixelPushpin size={18} gray={!note.isPinned} />
                    </Button>
                    <Button
                        variant="default"
                        size="icon"
                        onClick={() => onEdit(note)}
                        aria-label="Edit note"
                        className="h-8 w-8"
                    >
                        <Edit />
                    </Button>
                    <Button
                        variant="default"
                        size="icon"
                        onClick={() => onArchive(note.id)}
                        aria-label={note.isArchived ? 'Restore note' : 'Archive note'}
                        className="h-8 w-8"
                    >
                        {note.isArchived ? <Reload /> : <Archive />}
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleDeleteClick}
                        aria-label="Delete note permanently"
                        className="h-8 w-8"
                    >
                        <Trash />
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
