import { Check } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { ItemCategory } from '@/types/supabase';
import { getCategoryBadgeColor, getCategoryIcon, ALL_CATEGORIES, ITEM_CATEGORY_LABELS } from '@/utils/inventory-categorization-helpers';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface CategoryMultiSelectProps {
  value: ItemCategory[];
  onChange: (categories: ItemCategory[]) => void;
}

export const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (category: ItemCategory) => {
    if (value.includes(category)) {
      onChange(value.filter(c => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  const handleClear = () => {
    onChange([]);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-start min-h-[42px] h-auto"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">Select categories...</span>
            ) : (
              value.map(category => {
                const IconComponent = getCategoryIcon(category);
                return (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="gap-1"
                  >
                    <IconComponent className="w-4 h-4" />
                    {ITEM_CATEGORY_LABELS[category]}
                  </Badge>
                );
              })
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {ALL_CATEGORIES.map(category => {
                const isSelected = value.includes(category);
                const IconComponent = getCategoryIcon(category);
                return (
                  <CommandItem
                    key={category}
                    onSelect={() => handleToggle(category)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <IconComponent
                      className={cn(
                        "w-4 h-4 mr-2",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span>{ITEM_CATEGORY_LABELS[category]}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Simple badge component for displaying a single category
interface CategoryBadgeProps {
  category: ItemCategory;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'sm',
  showIcon = true,
}) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';
  const IconComponent = getCategoryIcon(category);
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center gap-1 rounded border font-medium ${getCategoryBadgeColor(category)} ${sizeClasses}`}>
      {showIcon && <IconComponent className={`${iconSize} text-current`} />}
      {ITEM_CATEGORY_LABELS[category]}
    </span>
  );
};


