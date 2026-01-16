import { useState, type ReactNode, type FormEvent } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/8bit/dialog';
import { Input } from '@/components/ui/8bit/input';
import { Textarea } from '@/components/ui/8bit/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/8bit/select';
import { Button } from '@/components/ui/8bit/button';
import type { Note, CreateNoteDto, UpdateNoteDto, Category } from '@/types';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateNoteDto | UpdateNoteDto) => void;
    note?: Note | null;
    categories: Category[];
    isSubmitting?: boolean;
}

export function NoteModal({
    isOpen,
    onClose,
    onSubmit,
    note,
    categories,
    isSubmitting = false,
}: NoteModalProps): ReactNode {
    const [title, setTitle] = useState(note?.title ?? '');
    const [content, setContent] = useState(note?.content ?? '');
    // Store selected category ID - for now single select, but send as array to match backend
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
        note?.categories?.[0]?.id ? String(note.categories[0].id) : ''
    );

    const isEditing = !!note;

    function handleSubmit(e: FormEvent): void {
        e.preventDefault();
        const data = {
            title,
            content,
            categoryIds: selectedCategoryId ? [Number(selectedCategoryId)] : undefined,
        };
        onSubmit(data);
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden" hideCloseButton>
                <form onSubmit={handleSubmit} className="flex h-full flex-col max-h-[85vh]">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>
                            {isEditing ? 'Edit Note' : 'Create Note'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-6 px-6 py-4 overflow-y-auto flex-1">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="title" className="retro text-sm">
                                Title
                            </label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter note title..."
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="content" className="retro text-sm">
                                Content
                            </label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your note..."
                                rows={8}
                                required
                                className="min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="category" className="retro text-sm">
                                Category
                            </label>
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col gap-2 p-6 pt-2 sm:flex-row bg-muted/20">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? 'Saving...'
                                : isEditing
                                  ? 'Save'
                                  : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
