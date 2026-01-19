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
            <Card className="relative flex flex-col transition-transform hover:-translate-y-0.5 h-full overflow-visible">
                {/* Pinned indicator - clickable to unpin */}
                {note.isPinned && (
                    <button
                        onClick={() => onPin(note.id)}
                        className="absolute -top-5 right-[5%] z-10 cursor-pointer"
                        aria-label="Unpin note"
                    >
                        <PixelPushpin size={40} className="drop-shadow-md hover:scale-110 transition-transform" />
                    </button>
                )}
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm md:text-base line-clamp-2 break-words">
                            {note.title}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardFooter className="flex justify-end gap-1 pt-2 mt-auto border-t border-border/50">
                    {/* Only show pin button when NOT pinned */}
                    {!note.isPinned && (
                        <button
                            onClick={() => onPin(note.id)}
                            aria-label="Pin note"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors hover:bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <PixelPushpin size={18} gray className="hover:scale-110 transition-transform" />
                        </button>
                    )}
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
