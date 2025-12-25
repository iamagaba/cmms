import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface SimpleBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const SimpleBreadcrumbs: React.FC<SimpleBreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-caption font-caption text-neutral-500">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Icon icon="tabler:chevron-right" className="w-3 h-3 text-neutral-400" />
          )}
          {item.href && !item.active ? (
            <Link
              to={item.href}
              className="hover:text-neutral-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={item.active ? 'text-neutral-900' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

