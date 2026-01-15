/**
 * Centralized type exports
 * Import from '@/types' for all shared types
 */

// User types
export type { User } from './user';

// Auth types
export type { AuthState, AuthActions, LoginCredentials, LoginResponse } from './auth';

// Note types
export type { Note, CreateNoteDto, UpdateNoteDto, NoteFilters } from './note';

// Category types
export type { Category, CreateCategoryDto, UpdateCategoryDto } from './category';
export { isGlobalCategory, isUserCategory } from './category';
