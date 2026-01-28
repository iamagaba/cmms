import React from 'react';
import { Input } from '@/components/ui/input';


export const TableFiltersBar = ({ children, searchValue, onSearchChange, filterChips, onClearAll, placeholder }: any) => {


    return (
        <div className="bg-background rounded-lg border border-border p-4">
            <Input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
            />
            {children}
        </div>
    );
};
