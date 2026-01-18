import type { ReactNode } from 'react';
import { NoteCard } from '@/components/NoteCard';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/8bit/pagination';
import type { Note } from '@/types';

interface NoteGridProps {
    notes: Note[];
    total: number;
    page: number;
    limit: number;
    isLoading: boolean;
    onEdit: (note: Note) => void;
    onArchive: (id: number) => void;
    onPin: (id: number) => void;
    onDelete: (id: number) => void;
    onPageChange: (page: number) => void;
}

export function NoteGrid({
    notes,
    total,
    page,
    limit,
    isLoading,
    onEdit,
    onArchive,
    onPin,
    onDelete,
    onPageChange,
}: NoteGridProps): ReactNode {
    const totalPages = Math.ceil(total / limit);


    if (isLoading) {
        return null; // No placeholder during loading
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
        <div className="flex flex-col gap-4">
            {/* Notes Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {notes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={onEdit}
                        onArchive={onArchive}
                        onPin={onPin}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        {page > 1 && (
                            <PaginationItem>
                                <PaginationPrevious onClick={() => onPageChange(page - 1)} />
                            </PaginationItem>
                        )}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    isActive={pageNum === page}
                                    onClick={() => onPageChange(pageNum)}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        {page < totalPages && (
                            <PaginationItem>
                                <PaginationNext onClick={() => onPageChange(page + 1)} />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            )}

            {/* Total count */}
            <p className="retro text-xs text-muted-foreground text-center">
                Showing {notes.length} of {total} notes
            </p>
        </div>
    );
}

