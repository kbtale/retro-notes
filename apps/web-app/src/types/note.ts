/**
 * Note entity from the API
 */
export interface Note {
    id: number;
    title: string;
    content: string;
    isArchived: boolean;
    isPinned: boolean;
    categories: { id: number; name: string }[];
    userId: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Paginated response from the API
 */
export interface PaginatedNotes {
    data: Note[];
    total: number;
    page: number;
    limit: number;
}

/**
 * DTO for creating a new note
 */
export interface CreateNoteDto {
    title: string;
    content: string;
    categoryIds?: number[];
}

/**
 * DTO for updating an existing note
 */
export interface UpdateNoteDto {
    title?: string;
    content?: string;
    categoryIds?: number[];
    isArchived?: boolean;
    isPinned?: boolean;
}

export type SortBy = 'updatedAt' | 'title' | 'createdAt';
export type SortOrder = 'ASC' | 'DESC';

/**
 * Filter options for fetching notes
 */
export interface NoteFilters {
    categoryId?: number | null;
    isArchived?: boolean;
    page?: number;
    limit?: number;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
}

