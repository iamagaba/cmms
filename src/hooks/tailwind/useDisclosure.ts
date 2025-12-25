import { useState, useCallback } from 'react';

export interface UseDisclosureHandlers {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

/**
 * Custom hook for managing boolean state (modals, drawers, etc.)
 * Replaces @mantine/hooks useDisclosure
 */
export function useDisclosure(
    initialState = false
): [boolean, UseDisclosureHandlers] {
    const [opened, setOpened] = useState(initialState);

    const open = useCallback(() => setOpened(true), []);
    const close = useCallback(() => setOpened(false), []);
    const toggle = useCallback(() => setOpened((prev) => !prev), []);

    return [opened, { open, close, toggle }];
}
