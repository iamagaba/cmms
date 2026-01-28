import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

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
    <nav className="flex items-center gap-2 text-caption font-caption text-muted-foreground">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          {item.href && !item.active ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={item.active ? 'text-foreground' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};



