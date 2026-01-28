import { Check, X } from 'lucide-react';
/**
 * Data Table Bulk Actions Component
 * 
 * Provides bulk operation capabilities for the Enhanced Professional Data Table.
 * Features confirmation dialogs, keyboard shortcuts, and professional styling.
 */

import React, { useState, useCallback } from 'react';


import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BulkAction } from './EnhancedDataTable';

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
      iconColor: 'text-destructive',
      iconBg: 'bg-destructive/10',
    },
    warning: {
      icon: 'tabler:alert-circle',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 dark:bg-amber-950',
    },
    info: {
      icon: 'tabler:info-circle',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
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
          'relative bg-background rounded-lg shadow-xl max-w-md w-full mx-4',
          'border border-border'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', styles.iconBg)}>
              {/* TODO: Convert styles.icon prop to use HugeiconsIcon component */}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              variant={variant === 'danger' ? 'destructive' : 'default'}
            >
              {confirmText}
            </Button>
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
  // Map BulkAction variants to Button variants
  const getButtonVariant = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'danger':
        return 'destructive';
      case 'secondary':
        return 'secondary';
      case 'ghost':
        return 'ghost';
      case 'outline':
      default:
        return 'outline';
    }
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={getButtonVariant(action.variant)}
      title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
    >
      {/* TODO: Convert action.icon prop to use HugeiconsIcon component */}
      <span>{action.label}</span>
      {selectedCount > 0 && (
        <span className="ml-1 px-1.5 py-0.5 text-xs bg-black bg-opacity-20 rounded">
          {selectedCount}
        </span>
      )}
    </Button>
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
          'bg-muted/50 border-b border-border px-4 py-3',
          'shadow-sm',
          className
        )}
      >
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {selectedCount} of {totalCount} selected
              </span>
            </div>
            
            {/* Bulk Actions */}
            <div className="flex items-center gap-4">
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
          <Button
            type="button"
            onClick={onClearSelection}
            variant="ghost"
            title="Clear selection (Esc)"
          >
            <X className="w-5 h-5" />
            <span>Clear selection</span>
          </Button>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        {bulkActions.some(action => action.shortcut) && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Keyboard01Icon className="w-4 h-4" />
              <span>Keyboard shortcuts:</span>
              {bulkActions
                .filter(action => action.shortcut)
                .map(action => (
                  <span key={action.key} className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-background border border-input rounded text-xs">
                      Ctrl+{action.shortcut}
                    </kbd>
                    <span>{action.label}</span>
                  </span>
                ))
              }
              <span className="ml-auto">
                <kbd className="px-1 py-0.5 bg-background border border-input rounded text-xs">
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