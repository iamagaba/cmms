import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';

interface MasterListShellProps {
  title: string;
  subtitle?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onCreateNew?: () => void;
  createButtonText?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  filtersActive?: boolean;
  filterContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  emptyState?: React.ReactNode;
  itemCount?: number;
}

/**
 * MasterListShell Component
 * 
 * Standardized shell for master-detail list views.
 * Provides consistent header, search, filters, and list container.
 * 
 * Used in: Assets, WorkOrders, Customers, Locations pages
 */
export function MasterListShell({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  onCreateNew,
  createButtonText = "Add New",
  showFilters = false,
  onToggleFilters,
  filtersActive = false,
  filterContent,
  children,
  className,
  emptyState,
  itemCount
}: MasterListShellProps) {
  return (
    <div className={cn("w-80 flex-none border-r border-border bg-card flex flex-col", className)}>
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showFilters && onToggleFilters && (
              <Button
                variant={filtersActive ? "secondary" : "ghost"}
                size="sm"
                onClick={onToggleFilters}
                className="w-7 p-0"
              >
                <Filter className="w-4 h-4" />
              </Button>
            )}
            {onCreateNew && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateNew}
                className="w-7 p-0"
                title={createButtonText}
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-1.5 text-xs"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filters */}
        {showFilters && filterContent && (
          <div className="mt-3">
            {filterContent}
          </div>
        )}

        {/* Item Count */}
        {itemCount !== undefined && (
          <div className="mt-2 text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
        )}
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto">
        {children || emptyState}
      </div>
    </div>
  );
}

export default MasterListShell;