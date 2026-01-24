import React from 'react';


export const ModernPageHeader = ({ title, subtitle, breadcrumbs, actions }: any) => {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
            {actions}
        </div>
    );
};
