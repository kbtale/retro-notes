import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/8bit/button';
import { Input } from '@/components/ui/8bit/input';
import { isGlobalCategory, type Category } from '@/types';
import { useCreateCategory } from '@/hooks/useCategories';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

interface CategoryListProps {
    categories: Category[];
    selectedCategoryId: number | null;
    onSelectCategory: (id: number | null) => void;
    isArchiveView: boolean;
    onToggleArchiveView: () => void;
    className?: string;
}

export function CategoryList({
    categories,
    selectedCategoryId,
    onSelectCategory,
    isArchiveView,
    onToggleArchiveView,
    className,
}: CategoryListProps): ReactNode {
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const createCategoryMutation = useCreateCategory();
    const { user } = useAuthState();
    const { logout } = useAuthActions();

    function handleCreateCategory() {
        if (!newCategoryName.trim()) {
            setIsCreating(false);
            return;
        }
        createCategoryMutation.mutate({ name: newCategoryName });
        setNewCategoryName('');
        setIsCreating(false);
    }
    
    // Separate global and personal categories
    const globalCategories = categories.filter(isGlobalCategory);
    const personalCategories = categories.filter((cat) => !isGlobalCategory(cat));

    return (
        <nav className={cn('flex flex-col gap-1', className)}>
            <p className="retro mb-2 text-xs uppercase text-muted-foreground">
                View
            </p>
            <Button
                variant={!isArchiveView ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                    if (isArchiveView) onToggleArchiveView();
                }}
            >
                Active Notes
            </Button>
            <Button
                variant={isArchiveView ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                    if (!isArchiveView) onToggleArchiveView();
                }}
            >
                Archived
            </Button>

            <div className="my-4 h-1 w-full bg-foreground" />

            <p className="retro mb-2 text-xs uppercase text-muted-foreground">
                Categories
            </p>
            <Button
                variant={selectedCategoryId === null ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onSelectCategory(null)}
            >
                All Categories
            </Button>

            {/* Global Categories */}
            {globalCategories.length > 0 && (
                <>
                    <p className="retro mb-1 mt-2 text-xs text-muted-foreground">
                        Global
                    </p>
                    {globalCategories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategoryId === category.id ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => onSelectCategory(category.id)}
                        >
                            {category.name}
                        </Button>
                    ))}
                </>
            )}

            {/* Personal Categories */}
            {personalCategories.length > 0 && (
                <>
                    <div className="mb-1 mt-2 flex items-center justify-between px-2">
                        <p className="retro text-xs text-muted-foreground">
                            My Categories
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setIsCreating(true)}
                        >
                            +
                        </Button>
                    </div>

                    {isCreating && (
                        <div className="mb-2 px-2">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCreateCategory();
                                }}
                                className="flex gap-1"
                            >
                                <Input
                                    autoFocus
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Name..."
                                    className="h-7 text-xs"
                                    onBlur={() => {
                                        // Delay to allow submit on enter/click
                                        setTimeout(() => {
                                           if (!newCategoryName) setIsCreating(false) 
                                        }, 200)
                                    }}
                                />
                            </form>
                        </div>
                    )}
                    {personalCategories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategoryId === category.id ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => onSelectCategory(category.id)}
                        >
                            {category.name}
                        </Button>
                    ))}
                </>
            )}
            
            {/* Mobile-only User Profile & Logout */}
            <div className="mt-auto pt-4 border-t-4 border-foreground md:hidden">
                <div className="flex items-center gap-3 px-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold retro text-xs">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="retro text-xs font-bold truncate">
                        {user?.username}
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => void logout()}
                >
                    Logout
                </Button>
            </div>
        </nav>
    );
}
