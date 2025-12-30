import React from 'react';
import { Button } from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';

export const EnhancedButton = ({ children, icon, badge, ...props }: any) => (
    <Button {...props}>
        {icon && (
            <span className="mr-2">
                {typeof icon === 'string' ? <HugeiconsIcon icon={icon} size={20} /> : icon}
            </span>
        )}
        {children}
        {badge && <span className="ml-2 bg-red-500 rounded-full px-2 text-white text-xs">{badge}</span>}
    </Button>
);
