import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Reload, Close } from '@nsmr/pixelart-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/8bit/button';
import { Card } from '@/components/ui/8bit/card';
import { Input } from '@/components/ui/8bit/input';
import { Textarea } from '@/components/ui/8bit/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/8bit/select';
import { useNote, useCreateNote, useUpdateNote } from '@/hooks/useNotes';
import { useCategories } from '@/hooks/useCategories';
import { useNoteDraft } from '@/hooks/useNoteDraft';
import { Dashboard } from '@/components/Dashboard';

export function Note(): ReactNode {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id && id !== 'new';

    const { data: note, isLoading: noteLoading } = useNote(isEditing ? Number(id) : 0);
    const { data: categories = [] } = useCategories();
    
    const createNoteMutation = useCreateNote();
    const updateNoteMutation = useUpdateNote();
    const { getDraft, saveDraft, clearDraft, hasDraft } = useNoteDraft(id);

    // Check for saved draft on mount
    const [showRestoreBanner, setShowRestoreBanner] = useState(() => hasDraft());
    const savedDraft = getDraft();

    // Initialize state - prefer note data over draft for editing existing notes
    const [title, setTitle] = useState(() => note?.title ?? '');
    const [content, setContent] = useState(() => note?.content ?? '');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
        () => note?.categories?.[0]?.id ? String(note.categories[0].id) : ''
    );

    const isSaving = createNoteMutation.isPending || updateNoteMutation.isPending;

    // Auto-save to localStorage on changes (debounced in hook)
    useEffect(() => {
        saveDraft(title, content, selectedCategoryId);
    }, [title, content, selectedCategoryId, saveDraft]);

    const handleRestoreDraft = useCallback(() => {
        if (savedDraft) {
            setTitle(savedDraft.title);
            setContent(savedDraft.content);
            setSelectedCategoryId(savedDraft.categoryId);
            setShowRestoreBanner(false);
            toast.success('Draft restored');
        }
    }, [savedDraft]);

    const handleDismissRestore = useCallback(() => {
        setShowRestoreBanner(false);
        clearDraft();
    }, [clearDraft]);

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault();
        const data = {
            title,
            content,
            categoryIds: selectedCategoryId ? [Number(selectedCategoryId)] : undefined,
        };

        try {
            if (isEditing) {
                await updateNoteMutation.mutateAsync({ id: Number(id), data });
                toast.success('Note updated successfully');
            } else {
                await createNoteMutation.mutateAsync(data);
                toast.success('Note created successfully');
            }
            // Clear draft on successful save
            clearDraft();
            navigate('/dashboard');
        } catch {
            toast.error('Failed to save note. Please try again.');
        }
    }

    if (isEditing && noteLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background" role="status" aria-live="polite">
                <p className="retro text-lg animate-pulse">Loading note...</p>
            </div>
        );
    }

    return (
        <Dashboard.Root>
            <Dashboard.Header>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/dashboard')} 
                    className="mr-4"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back
                </Button>
                <div className="flex-1">
                    <h1 className="retro text-lg font-bold md:text-xl">
                        {isEditing ? 'Editing Note' : 'New Note'}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        type="submit" 
                        form="note-form"
                        disabled={isSaving || !title || !content}
                        aria-busy={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Note'}
                    </Button>
                </div>
            </Dashboard.Header>

            <Dashboard.Body className="justify-center overflow-hidden bg-muted/5">
                {/* Aria-live region for screen reader announcements */}
                <div aria-live="polite" aria-atomic="true" className="sr-only">
                    {isSaving && 'Saving note...'}
                </div>

                <main className="w-full max-w-5xl h-full flex flex-col p-4 md:p-8 lg:p-12">
                    {/* Restore Draft Banner */}
                    {showRestoreBanner && savedDraft && (
                        <div className="mb-4 flex items-center justify-between gap-4 p-4 bg-muted/50 border-2 border-dashed border-foreground/30 retro text-sm">
                            <div className="flex items-center gap-2">
                                <Reload className="w-4 h-4" />
                                <span>You have an unsaved draft from {new Date(savedDraft.savedAt).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="default" onClick={handleRestoreDraft}>
                                    Restore
                                </Button>
                                <Button size="icon" variant="ghost" onClick={handleDismissRestore} aria-label="Dismiss">
                                    <Close className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <Card className="flex flex-col h-full p-6 md:p-10">
                        <form 
                            id="note-form" 
                            onSubmit={(e) => void handleSubmit(e)} 
                            className="flex flex-col gap-8 h-full"
                        >
                        <div className="flex flex-col gap-3">
                            <label htmlFor="title" className="retro text-xs uppercase tracking-wider text-muted-foreground">
                                Title of the entry
                            </label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="A title that captures your thoughts..."
                                required
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-6 py-4 border-y-2 border-dashed border-muted">
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <label htmlFor="category" className="retro text-[10px] uppercase text-muted-foreground">
                                    Assign Category
                                </label>
                                <Select value={selectedCategoryId || 'none'} onValueChange={(val) => setSelectedCategoryId(val === 'none' ? '' : val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="General" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">General</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {isEditing && note && (
                                <div className="flex flex-col gap-2">
                                    <label className="retro text-[10px] uppercase text-muted-foreground">
                                        Last Updated
                                    </label>
                                    <p className="retro text-xs opacity-70">
                                        {new Date(note.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col gap-3">
                            <label htmlFor="content" className="retro text-xs uppercase tracking-wider text-muted-foreground">
                                Your thoughts
                            </label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Start typing the retro future..."
                                required
                            />
                        </div>
                        </form>
                    </Card>
                </main>
            </Dashboard.Body>
        </Dashboard.Root>
    );
}


