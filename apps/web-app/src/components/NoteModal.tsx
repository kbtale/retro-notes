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
    const [categoryId, setCategoryId] = useState<string>(
        note?.categoryId ? String(note.categoryId) : ''
    );

    const isEditing = !!note;

    function handleSubmit(e: FormEvent): void {
        e.preventDefault();
        const data = {
            title,
            content,
            categoryId: categoryId ? Number(categoryId) : undefined,
        };
        onSubmit(data);
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Note' : 'Create Note'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-4">
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
                                rows={5}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="category" className="retro text-sm">
                                Category
                            </label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
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

                    <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? 'Saving...'
                                : isEditing
                                  ? 'Save Changes'
                                  : 'Create Note'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
