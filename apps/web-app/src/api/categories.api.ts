import { apiClient } from './client';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';

/**
 * Categories API functions
 *
 * Note: Categories can be global (user is null) or personal (user is set).
 * The API returns both types, and the frontend displays them together.
 */

/**
 * Fetch all categories (both global and user-specific)
 * @returns Array of categories
 */
export async function getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
}

/**
 * Fetch a single category by ID
 * @param id - Category ID
 * @returns The category
 */
export async function getCategory(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
}

/**
 * Create a new personal category
 * @param data - Category creation data
 * @returns The created category
 */
export async function createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
}

/**
 * Update an existing category
 * @param id - Category ID
 * @param data - Fields to update
 * @returns The updated category
 */
export async function updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.patch<Category>(`/categories/${id}`, data);
    return response.data;
}

/**
 * Delete a category
 * @param id - Category ID
 */
export async function deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
}
