/**
 * Note entity from the API
 */
export interface Note {
    id: number;
    title: string;
    content: string;
    isArchived: boolean;
    categoryId: number | null;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * DTO for creating a new note
 */
export interface CreateNoteDto {
    title: string;
    content: string;
    categoryId?: number;
}

/**
 * DTO for updating an existing note
 */
export interface UpdateNoteDto {
    title?: string;
    content?: string;
    categoryId?: number;
    isArchived?: boolean;
}

/**
 * Filter options for fetching notes
 */
export interface NoteFilters {
    categoryId?: number | null;
    isArchived?: boolean;
}
