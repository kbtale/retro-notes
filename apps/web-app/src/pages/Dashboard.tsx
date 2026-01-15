import { useState, useCallback, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { NoteGrid } from '@/components/NoteGrid';
import { NoteModal } from '@/components/NoteModal';
import { CategoryList } from '@/components/CategoryList';
import { Button } from '@/components/ui/8bit/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/8bit/alert';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import {
    useNotes,
    useCreateNote,
    useUpdateNote,
    useToggleArchive,
    useDeleteNote,
} from '@/hooks/useNotes';
import { useCategories } from '@/hooks/useCategories';
import type { Note, CreateNoteDto, UpdateNoteDto } from '@/types';

export function DashboardPage(): ReactNode {
    const { user } = useAuthState();
    const { logout } = useAuthActions();

    const [searchParams, setSearchParams] = useSearchParams();
    const categoryIdParam = searchParams.get('category');
    const isArchiveView = searchParams.get('view') === 'archived';

    const selectedCategoryId = categoryIdParam ? Number(categoryIdParam) : null;

    const {
        data: notes,
        isLoading: notesLoading,
        error: notesError,
    } = useNotes({
        categoryId: selectedCategoryId,
        isArchived: isArchiveView,
    });
    const { data: categories = [], error: categoriesError } = useCategories();

    const createNoteMutation = useCreateNote();
    const updateNoteMutation = useUpdateNote();
    const toggleArchiveMutation = useToggleArchive();
    const deleteNoteMutation = useDeleteNote();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const handleSelectCategory = useCallback(
        (id: number | null) => {
            setSearchParams((prev) => {
                if (id === null) {
                    prev.delete('category');
                } else {
                    prev.set('category', String(id));
                }
                return prev;
            });
        },
        [setSearchParams]
    );

    const handleToggleArchiveView = useCallback(() => {
        setSearchParams((prev) => {
            if (isArchiveView) {
                prev.delete('view');
            } else {
                prev.set('view', 'archived');
            }
            return prev;
        });
    }, [isArchiveView, setSearchParams]);

    const handleOpenCreate = useCallback(() => {
        setEditingNote(null);
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((note: Note) => {
        setEditingNote(note);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingNote(null);
    }, []);

    const handleSubmitNote = useCallback(
        async (data: CreateNoteDto | UpdateNoteDto) => {
            if (editingNote) {
                await updateNoteMutation.mutateAsync({ id: editingNote.id, data });
            } else {
                await createNoteMutation.mutateAsync(data as CreateNoteDto);
            }
            handleCloseModal();
        },
        [editingNote, createNoteMutation, updateNoteMutation, handleCloseModal]
    );

    const handleArchive = useCallback(
        (id: number, isArchived: boolean) => {
            toggleArchiveMutation.mutate({ id, isArchived });
        },
        [toggleArchiveMutation]
    );

    const handleDelete = useCallback(
        (id: number) => {
            deleteNoteMutation.mutate(id);
        },
        [deleteNoteMutation]
    );

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout]);

    // Check for errors
    const hasError = notesError ?? categoriesError;

    return (
        <Dashboard.Root>
            <Dashboard.Header>
                <h1 className="retro flex-1 text-lg font-bold md:text-xl">
                    RetroNotes
                </h1>
                <span className="retro hidden text-sm text-muted-foreground md:block">
                    {user?.username}
                </span>
                <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
                    Logout
                </Button>
            </Dashboard.Header>

            <Dashboard.Body>
                <Dashboard.Sidebar>
                    <CategoryList
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onSelectCategory={handleSelectCategory}
                        isArchiveView={isArchiveView}
                        onToggleArchiveView={handleToggleArchiveView}
                    />
                </Dashboard.Sidebar>

                <Dashboard.Content>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="retro text-lg font-semibold">
                            {isArchiveView ? 'Archived Notes' : 'My Notes'}
                        </h2>
                        {!isArchiveView && (
                            <Button onClick={handleOpenCreate}>
                                + New Note
                            </Button>
                        )}
                    </div>

                    {/* Error Alert */}
                    {hasError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {notesError
                                    ? 'Failed to load notes. Please try again.'
                                    : 'Failed to load categories. Please try again.'}
                            </AlertDescription>
                        </Alert>
                    )}

                    <NoteGrid
                        notes={notes}
                        isLoading={notesLoading}
                        onEdit={handleEdit}
                        onArchive={handleArchive}
                        onDelete={handleDelete}
                    />
                </Dashboard.Content>
            </Dashboard.Body>

            {/* Key prop forces remount when note changes, ensuring fresh state */}
            <NoteModal
                key={editingNote?.id ?? 'new'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={(data) => void handleSubmitNote(data)}
                note={editingNote}
                categories={categories}
                isSubmitting={createNoteMutation.isPending || updateNoteMutation.isPending}
            />
        </Dashboard.Root>
    );
}
