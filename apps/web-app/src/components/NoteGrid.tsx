import type { ReactNode } from 'react';
import { NoteCard } from '@/components/NoteCard';
import { Skeleton } from '@/components/ui/8bit/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/8bit/select';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/8bit/pagination';
import type { Note, SortBy, SortOrder } from '@/types';

interface NoteGridProps {
    notes: Note[];
    total: number;
    page: number;
    limit: number;
    sortBy: SortBy;
    sortOrder: SortOrder;
    isLoading: boolean;
    onEdit: (note: Note) => void;
    onArchive: (id: number) => void;
    onPin: (id: number) => void;
    onDelete: (id: number) => void;
    onPageChange: (page: number) => void;
    onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
}

export function NoteGrid({
    notes,
    total,
    page,
    limit,
    sortBy,
    sortOrder,
    isLoading,
    onEdit,
    onArchive,
    onPin,
    onDelete,
    onPageChange,
    onSortChange,
}: NoteGridProps): ReactNode {
    const totalPages = Math.ceil(total / limit);

    const handleSortChange = (value: string) => {
        const [newSortBy, newSortOrder] = value.split('-') as [SortBy, SortOrder];
        onSortChange(newSortBy, newSortOrder);
    };

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
        <div className="flex flex-col gap-4">
            {/* Sort Controls */}
            <div className="flex items-center justify-end gap-2">
                <span className="retro text-xs text-muted-foreground">Sort by:</span>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="updatedAt-DESC">Last Updated</SelectItem>
                        <SelectItem value="updatedAt-ASC">Oldest Updated</SelectItem>
                        <SelectItem value="createdAt-DESC">Newest Created</SelectItem>
                        <SelectItem value="createdAt-ASC">Oldest Created</SelectItem>
                        <SelectItem value="title-ASC">Title A-Z</SelectItem>
                        <SelectItem value="title-DESC">Title Z-A</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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

