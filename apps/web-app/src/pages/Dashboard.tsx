import { useCallback, type ReactNode } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { NoteGrid } from '@/components/NoteGrid';
import { CategoryList } from '@/components/CategoryList';
import { Button } from '@/components/ui/8bit/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/8bit/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/8bit/alert';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import {
    useNotes,
    useToggleArchive,
    useDeleteNote,
    usePinNote,
} from '@/hooks/useNotes';
import { useCategories } from '@/hooks/useCategories';
import type { Note, SortBy, SortOrder } from '@/types';

export function DashboardPage(): ReactNode {
    const { user } = useAuthState();
    const { logout } = useAuthActions();
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const categoryIdParam = searchParams.get('category');
    const isArchiveView = searchParams.get('view') === 'archived';
    const page = Number(searchParams.get('page') ?? '1');
    const sortBy = (searchParams.get('sortBy') as SortBy) ?? 'updatedAt';
    const sortOrder = (searchParams.get('sortOrder') as SortOrder) ?? 'DESC';

    const selectedCategoryId = categoryIdParam ? Number(categoryIdParam) : null;

    const {
        data: notesResponse,
        isLoading: notesLoading,
        error: notesError,
    } = useNotes({
        categoryId: selectedCategoryId,
        isArchived: isArchiveView,
        page,
        limit: 12,
        sortBy,
        sortOrder,
    });
    const { data: categories = [], error: categoriesError } = useCategories();

    const toggleArchiveMutation = useToggleArchive();
    const deleteNoteMutation = useDeleteNote();
    const pinNoteMutation = usePinNote();

    const handleSelectCategory = useCallback(
        (id: number | null) => {
            setSearchParams((prev) => {
                if (id === null) {
                    prev.delete('category');
                } else {
                    prev.set('category', String(id));
                }
                prev.delete('page'); // Reset to page 1
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
            prev.delete('page'); // Reset to page 1
            return prev;
        });
    }, [isArchiveView, setSearchParams]);

    const handlePageChange = useCallback((newPage: number) => {
        setSearchParams((prev) => {
            prev.set('page', String(newPage));
            return prev;
        });
    }, [setSearchParams]);

    const handleSortChange = useCallback((newSortBy: SortBy, newSortOrder: SortOrder) => {
        setSearchParams((prev) => {
            prev.set('sortBy', newSortBy);
            prev.set('sortOrder', newSortOrder);
            prev.delete('page'); // Reset to page 1
            return prev;
        });
    }, [setSearchParams]);

    const handleOpenCreate = useCallback(() => {
        navigate('/notes/new');
    }, [navigate]);

    const handleEdit = useCallback((note: Note) => {
        navigate(`/notes/${note.id}`);
    }, [navigate]);

    const handleArchive = useCallback(
        (id: number) => {
            toggleArchiveMutation.mutate(id);
        },
        [toggleArchiveMutation]
    );

    const handlePin = useCallback(
        (id: number) => {
            pinNoteMutation.mutate(id);
        },
        [pinNoteMutation]
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
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <h2 className="retro text-lg font-semibold">
                            {isArchiveView ? 'Archived Notes' : 'My Notes'}
                        </h2>
                        <div className="flex items-center gap-3">
                            {!isArchiveView && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="retro text-xs text-muted-foreground">Sort by:</span>
                                        <Select 
                                            value={`${sortBy}-${sortOrder}`} 
                                            onValueChange={(value) => {
                                                const [newSortBy, newSortOrder] = value.split('-') as [SortBy, SortOrder];
                                                handleSortChange(newSortBy, newSortOrder);
                                            }}
                                        >
                                            <SelectTrigger className="w-[220px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="updatedAt-DESC">Last Updated</SelectItem>
                                                <SelectItem value="updatedAt-ASC">Oldest Updated</SelectItem>
                                                <SelectItem value="createdAt-DESC">Newest Created</SelectItem>
                                                <SelectItem value="createdAt-ASC">Oldest Created</SelectItem>
                                                <SelectItem value="title-ASC">Title A-Z</SelectItem>
                                                <SelectItem value="title-DESC">Title Z-A</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleOpenCreate}>
                                        + New Note
                                    </Button>
                                </>
                            )}
                        </div>
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
                        notes={notesResponse?.data ?? []}
                        total={notesResponse?.total ?? 0}
                        page={notesResponse?.page ?? 1}
                        limit={notesResponse?.limit ?? 12}
                        isLoading={notesLoading}
                        onEdit={handleEdit}
                        onArchive={handleArchive}
                        onPin={handlePin}
                        onDelete={handleDelete}
                        onPageChange={handlePageChange}
                    />
                </Dashboard.Content>
            </Dashboard.Body>
        </Dashboard.Root>
    );
}

