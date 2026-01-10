import React from 'react';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';

export const TableFiltersBar = ({ children, searchValue, onSearchChange, filterChips, onClearAll, placeholder }: any) => {
    const spacing = useDensitySpacing();

    return (
        <div className={`${spacing.card} bg-white ${spacing.rounded} border`}>
            <input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className={`${spacing.input} border rounded`}
            />
            {children}
        </div>
    );
};
