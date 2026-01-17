import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as notesApi from '@/api/notes.api';
import type { Note, CreateNoteDto, UpdateNoteDto, NoteFilters, PaginatedNotes } from '@/types';

/**
 * Fetch notes with optional filters, pagination, and sorting
 */
export function useNotes(filters: NoteFilters = {}) {
    const { categoryId, isArchived = false, page = 1, limit = 10, sortBy, sortOrder } = filters;

    return useQuery({
        queryKey: queryKeys.notes.list({ categoryId, isArchived, page, limit, sortBy, sortOrder }),
        queryFn: () => notesApi.getNotes({ categoryId, isArchived, page, limit, sortBy, sortOrder }),
    });
}

/**
 * Hook to fetch a single note by ID
 */
export function useNote(id: number) {
    return useQuery({
        queryKey: queryKeys.notes.detail(id),
        queryFn: () => notesApi.getNote(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new note
 */
export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateNoteDto) => notesApi.createNote(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
        },
    });
}

/**
 * Hook to update an existing note
 */
export function useUpdateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateNoteDto }) =>
            notesApi.updateNote(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
        },
    });
}

/**
 * Hook to toggle archive status
 */
export function useToggleArchive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => notesApi.toggleNoteArchive(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });

            const previousNotes = queryClient.getQueriesData<PaginatedNotes>({
                queryKey: queryKeys.notes.all,
            });

            // Optimistically remove from current list
            queryClient.setQueriesData<PaginatedNotes>(
                { queryKey: queryKeys.notes.all },
                (old) => old ? { ...old, data: old.data.filter((note) => note.id !== id) } : undefined
            );

            return { previousNotes };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousNotes) {
                context.previousNotes.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
        },
    });
}

/**
 * Hook to toggle pin status
 */
export function usePinNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => notesApi.toggleNotePin(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
        },
    });
}

/**
 * Hook to delete a note
 */
export function useDeleteNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => notesApi.deleteNote(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
        },
    });
}

// Re-export types for convenience
export type { Note, CreateNoteDto, UpdateNoteDto, NoteFilters, PaginatedNotes };

