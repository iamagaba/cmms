import React from 'react';

export interface MultiSelectProps {
    label?: string;
    placeholder?: string;
    data?: any[];
    value?: any[];
    onChange?: (value: any[]) => void;
    [key: string]: any;
}

export const MultiSelect = ({ label, placeholder, data, value, onChange, ...props }: MultiSelectProps) => {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-sm font-medium">{label}</label>}
            <div className="border rounded p-2">
                <select multiple className="w-full" onChange={(e) => {
                    // simple stub mapping
                    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                    onChange && onChange(selected);
                }}>
                    {data?.map((item: any) => (
                        <option key={item.value || item} value={item.value || item}>{item.label || item}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
