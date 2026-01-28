import React from 'react';
import { Button } from '@/components/tailwind-components';
import type { LucideIcon } from 'lucide-react';

interface EnhancedButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  badge?: string | number;
  [key: string]: any;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({ 
  children, 
  icon: IconComponent, 
  badge, 
  ...props 
}) => (
  <Button {...props}>
    {IconComponent && (
      <span className="mr-2">
        <IconComponent className="w-5 h-5" />
      </span>
    )}
    {children}
    {badge && (
      <span className="ml-2 bg-destructive rounded-full px-2 text-white text-xs">
        {badge}
      </span>
    )}
  </Button>
);
