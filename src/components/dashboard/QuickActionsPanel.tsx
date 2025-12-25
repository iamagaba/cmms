/**
 * Quick Actions Panel Component
 * 
 * Desktop-optimized quick actions panel with hover states,
 * keyboard navigation, and professional CMMS workflow shortcuts.
 */

import React from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ProfessionalCard from '@/components/ui/ProfessionalCard';

// ============================================
// INTERFACES
// ============================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
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
      icon: 'tabler:plus',
      color: 'bg-steel-500',
      hoverColor: 'hover:bg-steel-600',
      description: 'Create a new maintenance request',
      shortcut: 'Ctrl+N',
      onClick: () => navigate('/work-orders/new')
    },
    {
      id: 'schedule-maintenance',
      label: 'Schedule Maintenance',
      icon: 'tabler:calendar-plus',
      color: 'bg-industrial-500',
      hoverColor: 'hover:bg-industrial-600',
      description: 'Plan preventive maintenance',
      shortcut: 'Ctrl+S',
      onClick: () => navigate('/maintenance/schedule')
    },
    {
      id: 'asset-inspection',
      label: 'Asset Inspection',
      icon: 'tabler:search',
      color: 'bg-maintenance-500',
      hoverColor: 'hover:bg-maintenance-600',
      description: 'Inspect equipment status',
      shortcut: 'Ctrl+I',
      onClick: () => navigate('/assets/inspect')
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: 'tabler:file-text',
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
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      onClick={action.onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-150',
        'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
      )}
      title={action.description}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
        <Icon icon={action.icon} className="w-4 h-4 text-gray-700" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">
          {action.label}
        </div>
      </div>
      
      <Icon icon="tabler:chevron-right" className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </motion.button>
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
    <div className={cn('space-y-2', className)}>
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