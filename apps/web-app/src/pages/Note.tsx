import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { ArrowLeft, Reload, Close } from '@nsmr/pixelart-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/8bit/button';
import { Input } from '@/components/ui/8bit/input';
import { Toggle } from '@/components/ui/8bit/toggle';
import { AttachmentSidebar } from '@/components/AttachmentSidebar';
import { CategoryMultiSelect } from '@/components/CategoryMultiSelect';
import { useNote, useCreateNote, useUpdateNote } from '@/hooks/useNotes';
import { useCategories } from '@/hooks/useCategories';
import { useNoteDraft } from '@/hooks/useNoteDraft';
import { useUploadMultipleAttachments } from '@/hooks/useAttachments';
import { Dashboard } from '@/components/Dashboard';

interface NoteFormData {
    title: string;
    content: string;
    categoryIds: string[];
}

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

    // React Hook Form
    const { register, reset, handleSubmit: rhfHandleSubmit, control, setValue } = useForm<NoteFormData>({
        defaultValues: {
            title: '',
            content: '',
            categoryIds: []
        }
    });

    // Watch form values for autosave
    const formValues = useWatch({ control });

    // Markdown preview toggle - true = preview, false = write
    const [showPreview, setShowPreview] = useState(false);
    // Mobile sidebar visibility
    const [showSidebar, setShowSidebar] = useState(false);
    // Staged files for new notes
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);

    const isSaving = createNoteMutation.isPending || updateNoteMutation.isPending;
    const uploadMultipleMutation = useUploadMultipleAttachments();

    // Sync server data to form when note loads
    useEffect(() => {
        if (note && isEditing) {
            reset({
                title: note.title,
                content: note.content,
                categoryIds: note.categories?.map(c => String(c.id)) ?? []
            });
        }
    }, [note?.id, isEditing, reset]);

    // Auto-save to localStorage
    useEffect(() => {
        saveDraft(
            formValues.title ?? '',
            formValues.content ?? '',
            formValues.categoryIds?.join(',') ?? ''
        );
    }, [formValues, saveDraft]);

    const handleRestoreDraft = useCallback(() => {
        if (savedDraft) {
            reset({
                title: savedDraft.title,
                content: savedDraft.content,
                categoryIds: savedDraft.categoryId ? savedDraft.categoryId.split(',').filter(Boolean) : []
            }, { keepDirty: true });
            setShowRestoreBanner(false);
            toast.success('Draft restored');
        }
    }, [savedDraft, reset]);

    const handleDismissRestore = useCallback(() => {
        setShowRestoreBanner(false);
        clearDraft();
    }, [clearDraft]);

    const onSubmit = rhfHandleSubmit(async (data) => {
        const payload = {
            title: data.title,
            content: data.content,
            categoryIds: data.categoryIds.length > 0 
                ? data.categoryIds.map(Number) 
                : undefined,
        };

        try {
            if (isEditing) {
                await updateNoteMutation.mutateAsync({ id: Number(id), data: payload });
                toast.success('Note updated successfully');
                clearDraft();
            } else {
                const newNote = await createNoteMutation.mutateAsync(payload);
                toast.success('Note created successfully');
                
                // Upload staged files if any
                if (stagedFiles.length > 0) {
                    try {
                        await uploadMultipleMutation.mutateAsync({ 
                            noteId: newNote.id, 
                            files: stagedFiles 
                        });
                        toast.success(`Uploaded ${stagedFiles.length} file(s)`);
                        setStagedFiles([]); // Clear staged files
                    } catch {
                        toast.error('Failed to upload some files');
                    }
                }
                
                clearDraft();
                // Navigate to the new note
                navigate(`/note/${newNote.id}`, { replace: true });
            }
        } catch {
            toast.error('Failed to save note. Please try again.');
        }
    });

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
            <Dashboard.Header showBurger={false}>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/dashboard')} 
                    className="mr-2 shrink-0"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back
                </Button>

                {/* Category dropdown */}
                <CategoryMultiSelect
                    categories={categories}
                    selectedIds={formValues.categoryIds ?? []}
                    onSelectionChange={(ids) => setValue('categoryIds', ids, { shouldDirty: true })}
                    placeholder="Categories"
                />

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
                        disabled={isSaving || !formValues.title || !formValues.content}
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
                    {/* Attachment Sidebar - shows for both new and existing notes */}
                    <>
                        {/* Mobile toggle button */}
                        <button
                            type="button"
                            className="fixed bottom-4 left-4 z-20 p-3 bg-foreground text-background retro text-xs block md:hidden"
                            onClick={() => setShowSidebar(prev => !prev)}
                        >
                            {showSidebar ? 'Close' : 'Files'}
                        </button>
                        
                        {/* Sidebar wrapper - on mobile: fixed below topbar, on desktop: inline */}
                        <div className={showSidebar ? 'block fixed top-16 left-0 right-0 bottom-0 z-10 bg-background' : 'hidden md:block'}>
                            <AttachmentSidebar 
                                noteId={isEditing ? Number(id) : null} 
                                onInsertReference={(markdown) => {
                                    setValue('content', (formValues.content ?? '') + '\n' + markdown);
                                    setShowSidebar(false);
                                }}
                                stagedFiles={stagedFiles}
                                onStageFile={(file) => setStagedFiles(prev => [...prev, file])}
                                onRemoveStagedFile={(index) => setStagedFiles(prev => prev.filter((_, i) => i !== index))}
                            />
                        </div>
                    </>

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
                            onSubmit={onSubmit} 
                            className="flex flex-col flex-1 overflow-hidden"
                        >
                            {/* Title - placeholder only, no label */}
                            <div className="p-4 border-b-6 border-foreground shrink-0">
                                <Input
                                    id="title"
                                    {...register('title')}
                                    placeholder="Title of the entry"
                                    required
                                    className="text-lg font-bold border-none shadow-none focus-visible:ring-0 p-0"
                                />
                            </div>

                            {/* Content - full height editor */}
                            <div className="flex-1 min-h-0">
                                {showPreview ? (
                                    <div className="h-full p-4 overflow-y-auto prose prose-sm max-w-none dark:prose-invert">
                                        {formValues.content ? (
                                            <ReactMarkdown>{formValues.content}</ReactMarkdown>
                                        ) : (
                                            <p className="text-muted-foreground italic">Nothing to preview yet...</p>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        id="content"
                                        {...register('content')}
                                        placeholder="Start typing... Supports **bold**, *italic*, # headings, - lists"
                                        required
                                        className="retro h-full w-full p-4 resize-none border-none bg-transparent focus:outline-none focus:ring-0"
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
