import type { NoteFilters } from '@/types';

/**
 * Centralized Query Keys for React Query
 *
 * Usage:
 *   queryKey: queryKeys.notes.list({ categoryId: 1, isArchived: false })
 *   queryKey: queryKeys.notes.detail(noteId)
 */
export const queryKeys = {
    /**
     * Auth-related query keys
     */
    auth: {
        all: ['auth'] as const,
        user: () => [...queryKeys.auth.all, 'user'] as const,
    },

    /**
     * Notes-related query keys
     */
    notes: {
        all: ['notes'] as const,
        lists: () => [...queryKeys.notes.all, 'list'] as const,
        list: (filters: NoteFilters) =>
            [...queryKeys.notes.lists(), filters] as const,
        details: () => [...queryKeys.notes.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.notes.details(), id] as const,
    },

    /**
     * Categories-related query keys
     */
    categories: {
        all: ['categories'] as const,
        list: () => [...queryKeys.categories.all, 'list'] as const,
    },
} as const;

/**
 * Type helper for extracting query key types
 */
export type QueryKeys = typeof queryKeys;
