import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as notesApi from '@/api/notes.api';
import type { Note, CreateNoteDto, UpdateNoteDto, NoteFilters } from '@/types';

/**
 * Hook to fetch notes with optional filters
 */
export function useNotes(filters: NoteFilters = {}) {
    const { categoryId, isArchived = false } = filters;

    return useQuery({
        queryKey: queryKeys.notes.list({ categoryId, isArchived }),
        queryFn: () => notesApi.getNotes({ categoryId, isArchived }),
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
 * Hook to toggle archive status with optimistic update
 */
export function useToggleArchive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isArchived }: { id: number; isArchived: boolean }) =>
            notesApi.toggleNoteArchive(id, isArchived),
        onMutate: async ({ id }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });

            // Snapshot previous data for rollback
            const previousNotes = queryClient.getQueriesData<Note[]>({
                queryKey: queryKeys.notes.all,
            });

            // Optimistically remove from current list
            queryClient.setQueriesData<Note[]>(
                { queryKey: queryKeys.notes.all },
                (old) => old?.filter((note) => note.id !== id) ?? []
            );

            return { previousNotes };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
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
export type { Note, CreateNoteDto, UpdateNoteDto, NoteFilters };
