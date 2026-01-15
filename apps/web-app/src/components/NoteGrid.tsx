import type { ReactNode } from 'react';
import { NoteCard } from '@/components/NoteCard';
import { Skeleton } from '@/components/ui/8bit/skeleton';
import type { Note } from '@/types';

interface NoteGridProps {
    notes: Note[] | undefined;
    isLoading: boolean;
    onEdit: (note: Note) => void;
    onArchive: (id: number, isArchived: boolean) => void;
    onDelete: (id: number) => void;
}

export function NoteGrid({
    notes,
    isLoading,
    onEdit,
    onArchive,
    onDelete,
}: NoteGridProps): ReactNode {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                ))}
            </div>
        );
    }

    if (!notes || notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="retro text-lg text-muted-foreground">No notes found</p>
                <p className="text-sm text-muted-foreground">Create your first note to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {notes.map((note) => (
                <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEdit}
                    onArchive={onArchive}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
