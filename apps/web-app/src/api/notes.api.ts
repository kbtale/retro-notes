import { apiClient } from './client';
import type { Note, CreateNoteDto, UpdateNoteDto, NoteFilters, PaginatedNotes } from '@/types';

/**
 * Notes API functions
 * Separated from React hooks for testability and reusability
 */

/**
 * Fetch all notes with optional filters, pagination, and sorting
 * @param filters - Optional filters, pagination, and sorting options
 * @returns Paginated notes response
 */
export async function getNotes(filters: NoteFilters = {}): Promise<PaginatedNotes> {
    const { categoryId, isArchived = false, page = 1, limit = 10, sortBy, sortOrder } = filters;

    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', String(categoryId));
    params.set('isArchived', String(isArchived));
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);

    const response = await apiClient.get<PaginatedNotes>(`/notes?${params.toString()}`);
    return response.data;
}

/**
 * Fetch a single note by ID
 * @param id - Note ID
 * @returns The note
 */
export async function getNote(id: number): Promise<Note> {
    const response = await apiClient.get<Note>(`/notes/${id}`);
    return response.data;
}

/**
 * Create a new note
 * @param data - Note creation data
 * @returns The created note
 */
export async function createNote(data: CreateNoteDto): Promise<Note> {
    const response = await apiClient.post<Note>('/notes', data);
    return response.data;
}

/**
 * Update an existing note
 * @param id - Note ID
 * @param data - Fields to update
 * @returns The updated note
 */
export async function updateNote(id: number, data: UpdateNoteDto): Promise<Note> {
    const response = await apiClient.patch<Note>(`/notes/${id}`, data);
    return response.data;
}

/**
 * Toggle the archive status of a note
 * @param id - Note ID
 * @returns The updated note
 */
export async function toggleNoteArchive(id: number): Promise<Note> {
    const response = await apiClient.patch<Note>(`/notes/${id}/archive`);
    return response.data;
}

/**
 * Toggle the pin status of a note
 * @param id - Note ID
 * @returns The updated note
 */
export async function toggleNotePin(id: number): Promise<Note> {
    const response = await apiClient.patch<Note>(`/notes/${id}/pin`);
    return response.data;
}

/**
 * Delete a note permanently
 * @param id - Note ID
 */
export async function deleteNote(id: number): Promise<void> {
    await apiClient.delete(`/notes/${id}`);
}

