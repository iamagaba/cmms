/**
 * Data Table Bulk Actions Component
 * 
 * Provides bulk operation capabilities for the Enhanced Professional Data Table.
 * Features confirmation dialogs, keyboard shortcuts, and professional styling.
 */

import React, { useState, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Tick01Icon, Keyboard01Icon } from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BulkAction } from './EnhancedProfessionalDataTable';

// ============================================
// INTERFACES
// ============================================

interface BulkActionsBarProps<T> {
  selectedCount: number;
  totalCount: number;
  bulkActions: BulkAction[];
  selectedRows: T[];
  onBulkAction: (action: string, selectedRows: T[]) => void;
  onClearSelection: () => void;
  className?: string;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

// ============================================
// CONFIRMATION DIALOG COMPONENT
// ============================================

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}) => {
  const variantStyles = {
    danger: {
      icon: 'tabler:alert-triangle',
      iconColor: 'text-warning-500',
      iconBg: 'bg-warning-100',
      confirmButton: 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500',
    },
    warning: {
      icon: 'tabler:alert-circle',
      iconColor: 'text-maintenance-500',
      iconBg: 'bg-maintenance-100',
      confirmButton: 'bg-maintenance-600 hover:bg-maintenance-700 focus:ring-maintenance-500',
    },
    info: {
      icon: 'tabler:info-circle',
      iconColor: 'text-steel-500',
      iconBg: 'bg-steel-100',
      confirmButton: 'bg-steel-600 hover:bg-steel-700 focus:ring-steel-500',
    },
  };

  const styles = variantStyles[variant];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn(
          'relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
          'border border-machinery-200'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', styles.iconBg)}>
              {/* TODO: Convert styles.icon prop to use HugeiconsIcon component */}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-machinery-900 mb-2">
                {title}
              </h3>
              <p className="text-machinery-600 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                'px-4 py-2 text-sm font-medium text-machinery-700',
                'border border-machinery-300 rounded-md',
                'hover:bg-machinery-50 focus:outline-none focus:ring-2 focus:ring-steel-500',
                'transition-colors duration-200'
              )}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'transition-colors duration-200',
                styles.confirmButton
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// BULK ACTION BUTTON COMPONENT
// ============================================

interface BulkActionButtonProps {
  action: BulkAction;
  selectedCount: number;
  onClick: () => void;
  disabled?: boolean;
}

const BulkActionButton: React.FC<BulkActionButtonProps> = ({
  action,
  selectedCount,
  onClick,
  disabled = false,
}) => {
  const variantStyles = {
    primary: 'bg-steel-600 hover:bg-steel-700 text-white border-steel-600 hover:border-steel-700',
    secondary: 'bg-machinery-100 hover:bg-machinery-200 text-machinery-700 border-machinery-300 hover:border-machinery-400',
    outline: 'bg-white hover:bg-machinery-50 text-machinery-700 border-machinery-300 hover:border-steel-400',
    ghost: 'bg-transparent hover:bg-machinery-100 text-machinery-700 border-transparent hover:border-machinery-300',
    danger: 'bg-warning-600 hover:bg-warning-700 text-white border-warning-600 hover:border-warning-700',
  };

  const baseStyles = cn(
    'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium',
    'border rounded-md transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-steel-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current'
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[action.variant || 'outline'],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
    >
      {/* TODO: Convert action.icon prop to use HugeiconsIcon component */}
      <span>{action.label}</span>
      {selectedCount > 0 && (
        <span className="ml-1 px-1.5 py-0.5 text-xs bg-black bg-opacity-20 rounded">
          {selectedCount}
        </span>
      )}
    </button>
  );
};

// ============================================
// MAIN BULK ACTIONS BAR COMPONENT
// ============================================

const DataTableBulkActions = <T,>({
  selectedCount,
  totalCount,
  bulkActions,
  selectedRows,
  onBulkAction,
  onClearSelection,
  className,
}: BulkActionsBarProps<T>) => {
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    action: BulkAction | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    action: null,
    title: '',
    message: '',
  });

  // Handle bulk action execution
  const handleBulkAction = useCallback((action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmationDialog({
        isOpen: true,
        action,
        title: `Confirm ${action.label}`,
        message: action.confirmationMessage || 
          `Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}?`,
      });
    } else {
      onBulkAction(action.key, selectedRows);
    }
  }, [selectedCount, selectedRows, onBulkAction]);

  // Handle confirmation dialog
  const handleConfirm = useCallback(() => {
    if (confirmationDialog.action) {
      onBulkAction(confirmationDialog.action.key, selectedRows);
    }
    setConfirmationDialog({ isOpen: false, action: null, title: '', message: '' });
  }, [confirmationDialog.action, selectedRows, onBulkAction]);

  const handleCancel = useCallback(() => {
    setConfirmationDialog({ isOpen: false, action: null, title: '', message: '' });
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedCount === 0) return;

      // Find action with matching shortcut
      const action = bulkActions.find(a => a.shortcut && 
        event.key.toLowerCase() === a.shortcut.toLowerCase() && 
        (event.ctrlKey || event.metaKey)
      );

      if (action && !action.disabled?.(selectedRows)) {
        event.preventDefault();
        handleBulkAction(action);
      }

      // Escape to clear selection
      if (event.key === 'Escape') {
        onClearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCount, bulkActions, selectedRows, handleBulkAction, onClearSelection]);

  if (selectedCount === 0) return null;

  return (
    <>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'bg-steel-50 border-b border-steel-200 px-4 py-3',
          'shadow-sm',
          className
        )}
      >
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Tick01Icon} size={16} className="text-steel-600" />
              <span className="text-sm font-medium text-steel-700">
                {selectedCount} of {totalCount} selected
              </span>
            </div>
            
            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              {bulkActions.map((action) => {
                const isDisabled = action.disabled?.(selectedRows) || false;
                
                return (
                  <BulkActionButton
                    key={action.key}
                    action={action}
                    selectedCount={selectedCount}
                    onClick={() => handleBulkAction(action)}
                    disabled={isDisabled}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Clear Selection */}
          <button
            type="button"
            onClick={onClearSelection}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 text-sm',
              'text-machinery-600 hover:text-steel-700',
              'hover:bg-white rounded-md transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-steel-500'
            )}
            title="Clear selection (Esc)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
            <span>Clear selection</span>
          </button>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        {bulkActions.some(action => action.shortcut) && (
          <div className="mt-2 pt-2 border-t border-steel-200">
            <div className="flex items-center gap-4 text-xs text-machinery-500">
              <HugeiconsIcon icon={Keyboard01Icon} size={12} />
              <span>Keyboard shortcuts:</span>
              {bulkActions
                .filter(action => action.shortcut)
                .map(action => (
                  <span key={action.key} className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white border border-machinery-300 rounded text-xs">
                      Ctrl+{action.shortcut}
                    </kbd>
                    <span>{action.label}</span>
                  </span>
                ))
              }
              <span className="ml-auto">
                <kbd className="px-1 py-0.5 bg-white border border-machinery-300 rounded text-xs">
                  Esc
                </kbd>
                <span className="ml-1">Clear selection</span>
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          title={confirmationDialog.title}
          message={confirmationDialog.message}
          variant={confirmationDialog.action?.variant === 'danger' ? 'danger' : 'info'}
          confirmText={confirmationDialog.action?.label || 'Confirm'}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </AnimatePresence>
    </>
  );
};

// ============================================
// EXPORTS
// ============================================

export default DataTableBulkActions;
export type { BulkActionsBarProps };