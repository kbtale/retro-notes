/**
 * API module barrel exports
 */

// API Client
export { apiClient, ApiError } from './client';

// Auth API
export * as authApi from './auth.api';

// Notes API
export * as notesApi from './notes.api';

// Categories API
export * as categoriesApi from './categories.api';
