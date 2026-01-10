import React from 'react';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';

export const ModernPageHeader = ({ title, subtitle, breadcrumbs, actions }: any) => {
    const spacing = useDensitySpacing();

    return (
        <div className={spacing.mb}>
            <h1 className={spacing.text.heading}>{title}</h1>
            <p className={spacing.text.body}>{subtitle}</p>
            {actions}
        </div>
    );
};
