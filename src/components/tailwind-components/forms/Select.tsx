import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps {
    /** Select value */
    value?: string;
    /** Change handler */
    onChange?: (value: string | null) => void;
    /** Select options */
    data: SelectOption[] | string[];
    /** Placeholder text */
    placeholder?: string;
    /** Whether select is disabled */
    disabled?: boolean;
    /** Select label */
    label?: string;
    /** Error message */
    error?: string;
    /** Description text */
    description?: string;
    /** Whether select is required */
    required?: boolean;
    /** Select size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Width */
    w?: number | string;
    /** Additional className */
    className?: string;
}

const sizeMap = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
    xl: 'px-6 py-4 text-xl',
};

/**
 * Select component - dropdown select input
 * Replaces Mantine Select
 */
export function Select({
    value,
    onChange,
    data,
    placeholder = 'Select an option',
    disabled,
    label,
    error,
    description,
    required,
    size = 'md',
    w,
    className,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const options: SelectOption[] = data.map(item =>
        typeof item === 'string' ? { value: item, label: item } : item
    );

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cn('relative', className)} style={{ width: w }}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {description && (
                <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={cn(
                        'w-full text-left border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'transition-colors flex items-center justify-between',
                        sizeMap[size],
                        error && 'border-red-500 focus:ring-red-500',
                        disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
                        'rounded-none'
                    )}
                >
                    <span className={cn(!selectedOption && 'text-gray-400')}>
                        {selectedOption?.label || placeholder}
                    </span>
                    <HugeiconsIcon
                        icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
                        className="text-gray-400"
                        size={20}
                    />
                </button>

                {isOpen && !disabled && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-auto rounded-none">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => !option.disabled && handleSelect(option.value)}
                                    disabled={option.disabled}
                                    className={cn(
                                        'w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors',
                                        option.value === value && 'bg-primary-50 text-primary-600',
                                        option.disabled && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}
