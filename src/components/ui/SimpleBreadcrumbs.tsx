import React from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

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
            <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="text-neutral-400" />
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

