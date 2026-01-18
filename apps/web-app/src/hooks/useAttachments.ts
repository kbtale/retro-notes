import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface Attachment {
    id: number;
    filename: string;
    storagePath: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

// Fetch all attachments for a note
export function useAttachments(noteId: number | null) {
    return useQuery<Attachment[]>({
        queryKey: ['attachments', noteId],
        queryFn: async () => {
            if (!noteId) return [];
            const response = await apiClient.get<Attachment[]>(`/attachments/note/${noteId}`);
            return response.data;
        },
        enabled: !!noteId,
    });
}

// Upload attachment
export function useUploadAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, file }: { noteId: number; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post<Attachment>(
                `/attachments/note/${noteId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        },
        onSuccess: (_, { noteId }) => {
            void queryClient.invalidateQueries({ queryKey: ['attachments', noteId] });
        },
    });
}

// Delete attachment
export function useDeleteAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, noteId }: { id: number; noteId: number }) => {
            await apiClient.delete(`/attachments/${id}`);
            return { id, noteId };
        },
        onSuccess: (_, { noteId }) => {
            void queryClient.invalidateQueries({ queryKey: ['attachments', noteId] });
        },
    });
}

// Upload multiple attachments (for batch upload after note creation)
export function useUploadMultipleAttachments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, files }: { noteId: number; files: File[] }) => {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const response = await apiClient.post<Attachment>(
                    `/attachments/note/${noteId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                return response.data;
            });

            return await Promise.all(uploadPromises);
        },
        onSuccess: (_, { noteId }) => {
            void queryClient.invalidateQueries({ queryKey: ['attachments', noteId] });
        },
    });
}

// Get download URL for attachment
export function getAttachmentDownloadUrl(id: number): string {
    return `/api/attachments/${id}/download`;
}
