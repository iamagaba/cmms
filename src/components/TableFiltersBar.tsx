import React from 'react';
export const TableFiltersBar = ({ children, searchValue, onSearchChange, filterChips, onClearAll, placeholder }: any) => (
    <div className="p-4 bg-white rounded border">
        <input value={searchValue} onChange={(e) => onSearchChange(e.target.value)} placeholder={placeholder} />
        {children}
    </div>
);
