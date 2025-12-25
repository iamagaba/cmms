import React from 'react';
export const ModernPageHeader = ({ title, subtitle, breadcrumbs, actions }: any) => (
    <div className="mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p>{subtitle}</p>
        {actions}
    </div>
);
