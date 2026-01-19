import { useState, type ReactNode } from 'react';
import { Check, ChevronDown } from '@nsmr/pixelart-react';
import { Button } from '@/components/ui/8bit/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/8bit/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export interface CategoryOption {
    id: number;
    name: string;
}

export interface CategoryMultiSelectProps {
    /** All available categories */
    categories: CategoryOption[];
    /** Currently selected category IDs */
    selectedIds: string[];
    /** Callback when selection changes */
    onSelectionChange: (selectedIds: string[]) => void;
    /** Placeholder text when nothing is selected */
    placeholder?: string;
    /** Additional class names */
    className?: string;
    /** Whether the component is disabled */
    disabled?: boolean;
}

export function CategoryMultiSelect({
    categories,
    selectedIds,
    onSelectionChange,
    placeholder = 'Categories',
    className,
    disabled = false,
}: CategoryMultiSelectProps): ReactNode {
    const [open, setOpen] = useState(false);

    const selectedCount = selectedIds.length;
    const selectedNames = categories
        .filter((cat) => selectedIds.includes(String(cat.id)))
        .map((cat) => cat.name);

    const displayText =
        selectedCount === 0
            ? placeholder
            : selectedCount === 1
            ? selectedNames[0]
            : `${selectedCount} selected`;

    const handleToggle = (categoryId: string) => {
        if (selectedIds.includes(categoryId)) {
            onSelectionChange(selectedIds.filter((id) => id !== categoryId));
        } else {
            onSelectionChange([...selectedIds, categoryId]);
        }
    };

    const handleClearAll = () => {
        onSelectionChange([]);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn('justify-between gap-2', className)}
                >
                    <span className="truncate max-w-[150px]">{displayText}</span>
                    <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <Command className="retro">
                    <CommandInput placeholder="Search categories..." className="retro text-xs" />
                    <CommandList>
                        <CommandEmpty className="retro text-xs py-4">No categories found.</CommandEmpty>
                        <CommandGroup>
                            {categories.map((category) => {
                                const isSelected = selectedIds.includes(String(category.id));
                                return (
                                    <CommandItem
                                        key={category.id}
                                        value={category.name}
                                        onSelect={() => handleToggle(String(category.id))}
                                        className="retro text-xs cursor-pointer"
                                    >
                                        <div
                                            className={cn(
                                                'mr-2 flex h-4 w-4 items-center justify-center border-2 border-foreground',
                                                isSelected ? 'bg-foreground text-background' : 'bg-transparent'
                                            )}
                                        >
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                        {category.name}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                    {selectedCount > 0 && (
                        <div className="border-t border-foreground p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAll}
                                className="w-full text-xs"
                            >
                                Clear All
                            </Button>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
