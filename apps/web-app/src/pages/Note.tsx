import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Reload, Close } from '@nsmr/pixelart-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/8bit/button';
import { Input } from '@/components/ui/8bit/input';
import { Textarea } from '@/components/ui/8bit/textarea';
import { Toggle } from '@/components/ui/8bit/toggle';
import { AttachmentSidebar } from '@/components/AttachmentSidebar';
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

    // Initialize state
    const [title, setTitle] = useState(() => note?.title ?? '');
    const [content, setContent] = useState(() => note?.content ?? '');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        () => note?.categories?.map(c => String(c.id)) ?? []
    );
    // Markdown preview toggle - true = preview, false = write
    const [showPreview, setShowPreview] = useState(false);
    // Mobile sidebar visibility
    const [showSidebar, setShowSidebar] = useState(false);

    const isSaving = createNoteMutation.isPending || updateNoteMutation.isPending;

    // Auto-save to localStorage
    useEffect(() => {
        saveDraft(title, content, selectedCategoryIds.join(','));
    }, [title, content, selectedCategoryIds, saveDraft]);

    const handleRestoreDraft = useCallback(() => {
        if (savedDraft) {
            setTitle(savedDraft.title);
            setContent(savedDraft.content);
            setSelectedCategoryIds(savedDraft.categoryId ? savedDraft.categoryId.split(',').filter(Boolean) : []);
            setShowRestoreBanner(false);
            toast.success('Draft restored');
        }
    }, [savedDraft]);

    const handleDismissRestore = useCallback(() => {
        setShowRestoreBanner(false);
        clearDraft();
    }, [clearDraft]);

    // Toggle category selection
    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategoryIds(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault();
        const data = {
            title,
            content,
            categoryIds: selectedCategoryIds.length > 0 
                ? selectedCategoryIds.map(Number) 
                : undefined,
        };

        try {
            if (isEditing) {
                await updateNoteMutation.mutateAsync({ id: Number(id), data });
                toast.success('Note updated successfully');
            } else {
                await createNoteMutation.mutateAsync(data);
                toast.success('Note created successfully');
            }
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
            {/* Top Bar */}
            <Dashboard.Header>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/dashboard')} 
                    className="mr-2 shrink-0"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back
                </Button>

                {/* Category buttons - hide overflow */}
                <div className="flex-1 flex items-center gap-2 overflow-hidden min-w-0">
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            type="button"
                            variant={selectedCategoryIds.includes(String(cat.id)) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleCategoryToggle(String(cat.id))}
                            className="shrink-0"
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Write/Preview Toggle */}
                <Toggle
                    variant="outline"
                    pressed={showPreview}
                    onPressedChange={setShowPreview}
                    className="mx-2 shrink-0"
                    aria-label="Toggle preview"
                >
                    {showPreview ? 'Preview' : 'Write'}
                </Toggle>

                {/* Last Updated + Save */}
                <div className="flex items-center gap-3 shrink-0">
                    {isEditing && note && (
                        <span className="retro text-xs text-muted-foreground hidden lg:block">
                            Updated {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                    )}
                    <Button 
                        type="submit" 
                        form="note-form"
                        disabled={isSaving || !title || !content}
                        aria-busy={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </Dashboard.Header>

            <Dashboard.Body className="overflow-hidden bg-muted/5">
                {/* Screen reader announcements */}
                <div aria-live="polite" aria-atomic="true" className="sr-only">
                    {isSaving && 'Saving note...'}
                </div>

                {/* Layout: Attachment sidebar + Editor */}
                <div className="flex h-full w-full overflow-hidden">
                    {/* Attachment Sidebar - hidden on mobile by default */}
                    {isEditing && (
                        <>
                            {/* Mobile toggle button */}
                            <button
                                className="md:hidden fixed bottom-4 left-4 z-20 p-2 bg-foreground text-background retro text-xs border-4 border-foreground"
                                onClick={() => setShowSidebar(!showSidebar)}
                            >
                                {showSidebar ? 'Hide' : 'Files'}
                            </button>
                            {/* Sidebar - always visible on desktop, toggleable on mobile */}
                            <div className={`
                                ${showSidebar ? 'flex' : 'hidden'} md:flex
                                fixed md:relative inset-0 md:inset-auto z-10 md:z-auto
                                bg-background/95 md:bg-transparent
                                h-full shrink-0
                            `}>
                                <AttachmentSidebar 
                                    noteId={Number(id)} 
                                    onInsertReference={(markdown) => {
                                        setContent(prev => prev + '\n' + markdown);
                                        setShowSidebar(false);
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {/* Main Editor */}
                    <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                        {/* Restore Draft Banner */}
                        {showRestoreBanner && savedDraft && (
                            <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 border-b-6 border-foreground retro text-sm shrink-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Reload className="w-4 h-4 shrink-0" />
                                    <span className="truncate">Unsaved draft from {new Date(savedDraft.savedAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button size="sm" variant="default" onClick={handleRestoreDraft}>
                                        Restore
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={handleDismissRestore} aria-label="Dismiss">
                                        <Close className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <form 
                            id="note-form" 
                            onSubmit={(e) => void handleSubmit(e)} 
                            className="flex flex-col flex-1 overflow-hidden"
                        >
                            {/* Title - placeholder only, no label */}
                            <div className="p-4 border-b-6 border-foreground shrink-0">
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Title of the entry"
                                    required
                                    className="text-lg font-bold border-none shadow-none focus-visible:ring-0 p-0"
                                />
                            </div>

                            {/* Content - full height editor */}
                            <div className="flex-1 overflow-auto min-h-0">
                                {showPreview ? (
                                    <div className="h-full p-4 overflow-auto prose prose-sm max-w-none dark:prose-invert">
                                        {content ? (
                                            <ReactMarkdown>{content}</ReactMarkdown>
                                        ) : (
                                            <p className="text-muted-foreground italic">Nothing to preview yet...</p>
                                        )}
                                    </div>
                                ) : (
                                    <Textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Start typing... Supports **bold**, *italic*, # headings, - lists"
                                        required
                                        className="h-full w-full resize-none border-none shadow-none focus-visible:ring-0 rounded-none"
                                    />
                                )}
                            </div>
                        </form>
                    </main>
                </div>
            </Dashboard.Body>
        </Dashboard.Root>
    );
}
