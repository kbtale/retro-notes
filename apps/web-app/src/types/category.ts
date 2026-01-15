import type { User } from './user';

/**
 * Category entity from the API
 * Categories can be global (user is null) or personal (user is set)
 */
export interface Category {
    id: number;
    name: string;
    user: User | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * DTO for creating a new category
 */
export interface CreateCategoryDto {
    name: string;
}

/**
 * DTO for updating an existing category
 */
export interface UpdateCategoryDto {
    name?: string;
}

/**
 * Helper to check if a category is global
 */
export function isGlobalCategory(category: Category): boolean {
    return category.user === null;
}

/**
 * Helper to check if a category belongs to a specific user
 */
export function isUserCategory(category: Category, userId: number): boolean {
    return category.user?.id === userId;
}
