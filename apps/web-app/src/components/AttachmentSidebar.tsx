import { useCallback, useRef, type ReactNode, type ChangeEvent, type DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Trash, Image, Edit } from '@nsmr/pixelart-react';
import { Button } from '@/components/ui/8bit/button';
import { 
    useAttachments, 
    useUploadAttachment, 
    useDeleteAttachment,
    getAttachmentDownloadUrl,
    type Attachment 
} from '@/hooks/useAttachments';

interface AttachmentSidebarProps {
    noteId: number | null;
    onInsertReference?: (markdown: string) => void;
    className?: string;
    // Staging support for new notes
    stagedFiles?: File[];
    onStageFile?: (file: File) => void;
    onRemoveStagedFile?: (index: number) => void;
}

export function AttachmentSidebar({ 
    noteId, 
    onInsertReference, 
    className,
    stagedFiles = [],
    onStageFile,
    onRemoveStagedFile 
}: AttachmentSidebarProps): ReactNode {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: attachments = [], isLoading } = useAttachments(noteId);
    const uploadMutation = useUploadAttachment();
    const deleteMutation = useDeleteAttachment();
    const isNewNote = noteId === null;

    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        // New note: stage files
        if (isNewNote && onStageFile) {
            for (const file of Array.from(files)) {
                onStageFile(file);
            }
            toast.success(`Staged ${files.length} file(s)`);
            return;
        }

        // Existing note: upload immediately
        if (!noteId) return;
        for (const file of Array.from(files)) {
            try {
                await uploadMutation.mutateAsync({ noteId, file });
                toast.success(`Uploaded ${file.name}`);
            } catch {
                toast.error(`Failed to upload ${file.name}`);
            }
        }
    }, [noteId, isNewNote, onStageFile, uploadMutation]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        void handleFileSelect(e.target.files);
        e.target.value = ''; // Reset to allow re-uploading same file
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        void handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    const handleDelete = async (attachment: Attachment) => {
        if (!noteId) return;
        try {
            await deleteMutation.mutateAsync({ id: attachment.id, noteId });
            toast.success('Attachment deleted');
        } catch {
            toast.error('Failed to delete attachment');
        }
    };

    const handleCopyReference = (attachment: Attachment) => {
        const isImage = attachment.mimeType.startsWith('image/');
        const markdown = isImage
            ? `![${attachment.filename}](${getAttachmentDownloadUrl(attachment.id)})`
            : `[${attachment.filename}](${getAttachmentDownloadUrl(attachment.id)})`;
        
        if (onInsertReference) {
            onInsertReference(markdown);
            toast.success('Reference inserted');
        } else {
            navigator.clipboard.writeText(markdown).catch(() => {
                toast.error('Failed to copy');
            });
            toast.success('Markdown copied to clipboard');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return <Image className="w-4 h-4" />;
        }
        return <Edit className="w-4 h-4" />;
    };

    return (
        <div className={cn("w-64 h-full flex flex-col border-r-6 border-b-6 border-foreground dark:border-ring bg-background", className)}>
            {/* Header */}
            <div className="p-4 border-b-6 border-foreground dark:border-ring">
                <h3 className="retro text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    Attachments
                </h3>
                {isNewNote && (
                    <p className="retro text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                        Files will upload when you save
                    </p>
                )}
                
                {/* Upload zone */}
                <div
                    className="border-4 border-foreground dark:border-ring p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <p className="retro text-xs text-muted-foreground">
                        {uploadMutation.isPending ? 'Uploading...' : 'Click or drop files'}
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleInputChange}
                />
            </div>

            {/* Files list */}
            <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                    <p className="retro text-xs text-muted-foreground text-center p-4">
                        Loading...
                    </p>
                ) : (stagedFiles.length === 0 && attachments.length === 0) ? (
                    <p className="retro text-xs text-muted-foreground text-center p-4">
                        No files attached
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {/* Staged files (new notes) */}
                        {stagedFiles.map((file, index) => (
                            <li
                                key={`staged-${index}`}
                                className="p-2 border-4 border-yellow-600/50 dark:border-yellow-400/50 bg-yellow-50 dark:bg-yellow-900/20"
                            >
                                <div className="flex items-start gap-2">
                                    <Edit className="w-4 h-4" />
                                    <div className="flex-1 min-w-0">
                                        <p className="retro text-xs truncate">
                                            {file.name}
                                        </p>
                                        <p className="retro text-[10px] text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </p>
                                        <p className="retro text-[10px] text-yellow-600 dark:text-yellow-400">
                                            Pending
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => onRemoveStagedFile?.(index)}
                                        title="Remove"
                                    >
                                        <Trash className="w-3 h-3" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                        
                        {/* Uploaded attachments */}
                        {attachments.map((attachment) => (
                            <li
                                key={attachment.id}
                                className="p-2 border-4 border-foreground/30 dark:border-ring/30 hover:border-foreground/60 transition-colors"
                            >
                                <div className="flex items-start gap-2">
                                    {getFileIcon(attachment.mimeType)}
                                    <div className="flex-1 min-w-0">
                                        <p 
                                            className="retro text-xs truncate cursor-pointer hover:underline"
                                            onClick={() => handleCopyReference(attachment)}
                                            title="Click to insert reference"
                                        >
                                            {attachment.filename}
                                        </p>
                                        <p className="retro text-[10px] text-muted-foreground">
                                            {formatFileSize(attachment.size)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleCopyReference(attachment)}
                                        title="Insert reference"
                                    >
                                        <Edit className="w-3 h-3" />
                                    </Button>
                                    <a
                                        href={getAttachmentDownloadUrl(attachment.id)}
                                        download={attachment.filename}
                                        className="retro text-xs underline hover:no-underline"
                                        title="Download"
                                    >
                                        ↓
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => void handleDelete(attachment)}
                                        disabled={deleteMutation.isPending}
                                        title="Delete"
                                    >
                                        <Trash className="w-3 h-3" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
