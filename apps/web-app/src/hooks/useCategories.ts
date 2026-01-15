import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as categoriesApi from '@/api/categories.api';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';

/**
 * Hook to fetch all categories (both global and user-specific)
 */
export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories.list(),
        queryFn: () => categoriesApi.getCategories(),
    });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryDto) => categoriesApi.createCategory(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
}

/**
 * Hook to update an existing category
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
            categoriesApi.updateCategory(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => categoriesApi.deleteCategory(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
}

// Re-export types for convenience
export type { Category, CreateCategoryDto, UpdateCategoryDto };
