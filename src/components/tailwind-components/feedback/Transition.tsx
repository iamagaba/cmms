import { ReactNode } from 'react';

export interface TransitionProps {
    mounted: boolean;
    transition: string;
    duration?: number;
    timingFunction?: string;
    children: (styles: any) => ReactNode;
    keepMounted?: boolean;
}

// A simplified Transition component that handles mounted state but cheats on animation
// to avoid complex animation logic without a library like framer-motion or react-transition-group
export function Transition({
    mounted,
    children,
    keepMounted = false,
}: TransitionProps) {
    if (!mounted && !keepMounted) {
        return null;
    }

    // We simply pass empty styles or opacity styles.
    // For a real implementation, we would need to interpolate values over time.
    const styles = mounted ? { opacity: 1 } : { opacity: 0, pointerEvents: 'none' };

    return (
        <>
            {children(styles)}
        </>
    );
}
