import { ReactNode } from 'react';

interface CollapseProps {
    in: boolean;
    children: ReactNode;
    className?: string;
}

export function Collapse({ in: isOpen, children, className }: CollapseProps) {
    if (!isOpen) return null;

    return (
        <div className={className}>
            {children}
        </div>
    );
}

export default Collapse;
