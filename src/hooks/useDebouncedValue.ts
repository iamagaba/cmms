import { useState, useEffect } from 'react';

/**
 * Hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebouncedValue<T>(value: T, delay: number): [T, (val: T) => void] {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    // We return a tuple to match Mantine's signature roughly, 
    // though Mantine's second arg is a 'cancel' function usually? 
    // Actually Mantine's useDebouncedValue returns `[debounced, cancel]`.
    // Wait, let me just check how it's used in WorkOrders.tsx:
    // `const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);`
    // It only destructures the first element. So the second element doesn't strictly matter yet.

    // But wait, if I want to be safe I should return [T, () => void] where the second is cancel.
    // But I don't have easy access to cancel inside useEffect without refs.
    // For now, I'll just return the value in a generic way.

    return [debouncedValue, () => { }];
}
