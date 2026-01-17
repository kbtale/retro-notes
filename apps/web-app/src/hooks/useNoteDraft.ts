import { useCallback, useEffect, useRef } from 'react';

interface NoteDraft {
    title: string;
    content: string;
    categoryId: string;
    savedAt: number;
}

const STORAGE_KEY_PREFIX = 'retronotes_draft_';
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hook to auto-save note drafts to localStorage.
 * Saves on debounced changes and clears on successful save.
 */
export function useNoteDraft(noteId: string | undefined) {
    const storageKey = `${STORAGE_KEY_PREFIX}${noteId ?? 'new'}`;
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Get saved draft from localStorage
    const getDraft = useCallback((): NoteDraft | null => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (!saved) return null;
            
            const draft = JSON.parse(saved) as NoteDraft;
            
            // Check if draft has expired
            if (Date.now() - draft.savedAt > DRAFT_EXPIRY_MS) {
                localStorage.removeItem(storageKey);
                return null;
            }
            
            return draft;
        } catch {
            return null;
        }
    }, [storageKey]);

    // Save draft to localStorage (debounced)
    const saveDraft = useCallback((title: string, content: string, categoryId: string) => {
        // Clear existing timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce save by 2 seconds
        debounceRef.current = setTimeout(() => {
            // Only save if there's actual content
            if (!title && !content) {
                localStorage.removeItem(storageKey);
                return;
            }

            const draft: NoteDraft = {
                title,
                content,
                categoryId,
                savedAt: Date.now(),
            };
            
            try {
                localStorage.setItem(storageKey, JSON.stringify(draft));
            } catch {
                // localStorage might be full or disabled
                console.warn('Failed to save draft to localStorage');
            }
        }, 2000);
    }, [storageKey]);

    // Clear draft (call after successful save)
    const clearDraft = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        localStorage.removeItem(storageKey);
    }, [storageKey]);

    // Check if a draft exists
    const hasDraft = useCallback((): boolean => {
        return getDraft() !== null;
    }, [getDraft]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return {
        getDraft,
        saveDraft,
        clearDraft,
        hasDraft,
    };
}
