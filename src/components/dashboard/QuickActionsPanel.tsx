import { Plus, Search, Calendar, FileText, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
/**
 * Quick Actions Panel Component
 * 
 * Desktop-optimized quick actions panel with hover states,
 * keyboard navigation, and professional CMMS workflow shortcuts.
 */

import React from 'react';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================
// INTERFACES
// ============================================

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  hoverColor: string;
  onClick: () => void;
  description?: string;
  shortcut?: string;
}

export interface QuickActionsPanelProps {
  className?: string;
  actions?: QuickAction[];
}

// ============================================
// DEFAULT ACTIONS
// ============================================

const useDefaultActions = (): QuickAction[] => {
  const navigate = useNavigate();

  return [
    {
      id: 'new-work-order',
      label: 'New Work Order',
      icon: Plus,
      color: 'bg-steel-500',
      hoverColor: 'hover:bg-steel-600',
      description: 'Create a new maintenance request',
      shortcut: 'Ctrl+N',
      onClick: () => navigate('/work-orders/new')
    },
    {
      id: 'schedule-maintenance',
      label: 'Schedule Maintenance',
      icon: Calendar,
      color: 'bg-industrial-500',
      hoverColor: 'hover:bg-industrial-600',
      description: 'Plan preventive maintenance',
      shortcut: 'Ctrl+S',
      onClick: () => navigate('/maintenance/schedule')
    },
    {
      id: 'asset-inspection',
      label: 'Asset Inspection',
      icon: Search,
      color: 'bg-maintenance-500',
      hoverColor: 'hover:bg-maintenance-600',
      description: 'Inspect equipment status',
      shortcut: 'Ctrl+I',
      onClick: () => navigate('/assets/inspect')
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: FileText,
      color: 'bg-machinery-500',
      hoverColor: 'hover:bg-machinery-600',
      description: 'Create maintenance reports',
      shortcut: 'Ctrl+R',
      onClick: () => navigate('/reports/generate')
    }
  ];
};

// ============================================
// QUICK ACTION BUTTON
// ============================================

interface QuickActionButtonProps {
  action: QuickAction;
  index: number;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action, index }) => {
  const IconComponent = action.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Button
        variant="outline"
        onClick={action.onClick}
        className="w-full justify-start gap-4 h-auto py-3"
        title={action.description}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-foreground" />
        </div>
        
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-medium">
            {action.label}
          </div>
        </div>
        
        <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </Button>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ 
  className,
  actions 
}) => {
  const defaultActions = useDefaultActions();
  const quickActions = actions || defaultActions;

  return (
    <div className={cn('space-y-4', className)}>
      {quickActions.map((action, index) => (
        <QuickActionButton
          key={action.id}
          action={action}
          index={index}
        />
      ))}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default QuickActionsPanel;
export type { QuickActionsPanelProps, QuickAction };
