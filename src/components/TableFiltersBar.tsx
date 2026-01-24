import React from 'react';


export const TableFiltersBar = ({ children, searchValue, onSearchChange, filterChips, onClearAll, placeholder }: any) => {


    return (
        <div className="bg-white rounded-lg border p-4">
            <input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className="border rounded px-3 py-2 w-full"
            />
            {children}
        </div>
    );
};
