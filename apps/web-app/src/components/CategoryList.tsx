import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/8bit/button';
import type { Category } from '@/types';
import { isGlobalCategory } from '@/types';

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
                    <p className="retro mb-1 mt-2 text-xs text-muted-foreground">
                        My Categories
                    </p>
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
        </nav>
    );
}
