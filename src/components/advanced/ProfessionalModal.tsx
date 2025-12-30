/**
 * Professional CMMS Modal and Drawer System
 * 
 * A comprehensive modal and drawer system optimized for desktop CMMS workflows.
 * Features multiple sizes, animations, accessibility, and professional styling
 * designed for maintenance management interfaces.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalButton from '@/components/ui/ProfessionalButton';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  
  /**
   * Close handler
   */
  onClose: () => void;
  
  /**
   * Modal title
   */
  title?: string;
  
  /**
   * Modal description
   */
  description?: string;
  
  /**
   * Modal size
   */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  
  /**
   * Modal variant
   */
  variant?: 'default' | 'centered' | 'top';
  
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;
  
  /**
   * Whether clicking overlay closes modal
   */
  closeOnOverlayClick?: boolean;
  
  /**
   * Whether pressing escape closes modal
   */
  closeOnEscape?: boolean;
  
  /**
   * Modal header content
   */
  header?: React.ReactNode;
  
  /**
   * Modal footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Modal body content
   */
  children: React.ReactNode;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Custom overlay className
   */
  overlayClassName?: string;
  
  /**
   * Z-index for modal
   */
  zIndex?: number;
  
  /**
   * Prevent body scroll when modal is open
   */
  preventBodyScroll?: boolean;
  
  /**
   * Focus trap
   */
  focusTrap?: boolean;
  
  /**
   * Initial focus element selector
   */
  initialFocus?: string;
  
  /**
   * Return focus element selector
   */
  returnFocus?: string;
}

export interface DrawerProps {
  /**
   * Whether the drawer is open
   */
  open: boolean;
  
  /**
   * Close handler
   */
  onClose: () => void;
  
  /**
   * Drawer position
   */
  position?: 'left' | 'right' | 'top' | 'bottom';
  
  /**
   * Drawer size
   */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  
  /**
   * Drawer title
   */
  title?: string;
  
  /**
   * Drawer description
   */
  description?: string;
  
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;
  
  /**
   * Whether clicking overlay closes drawer
   */
  closeOnOverlayClick?: boolean;
  
  /**
   * Whether pressing escape closes drawer
   */
  closeOnEscape?: boolean;
  
  /**
   * Drawer header content
   */
  header?: React.ReactNode;
  
  /**
   * Drawer footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Drawer body content
   */
  children: React.ReactNode;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Custom overlay className
   */
  overlayClassName?: string;
  
  /**
   * Z-index for drawer
   */
  zIndex?: number;
  
  /**
   * Prevent body scroll when drawer is open
   */
  preventBodyScroll?: boolean;
  
  /**
   * Focus trap
   */
  focusTrap?: boolean;
}

// ============================================
// UTILITY HOOKS
// ============================================

const useBodyScrollLock = (lock: boolean) => {
  useEffect(() => {
    if (lock) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [lock]);
};

const useEscapeKey = (callback: () => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, enabled]);
};

const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, enabled: boolean) => {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef, enabled]);
};

// ============================================
// MODAL COMPONENT
// ============================================

const ProfessionalModal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  size = 'base',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  header,
  footer,
  children,
  className,
  overlayClassName,
  zIndex = 50,
  preventBodyScroll = true,
  focusTrap = true,
  initialFocus,
  returnFocus,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store previous active element
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [open]);

  // Return focus when modal closes
  useEffect(() => {
    if (!open && previousActiveElement.current) {
      const elementToFocus = returnFocus 
        ? document.querySelector(returnFocus) as HTMLElement
        : previousActiveElement.current;
      
      elementToFocus?.focus();
    }
  }, [open, returnFocus]);

  // Focus initial element
  useEffect(() => {
    if (open && initialFocus) {
      const element = document.querySelector(initialFocus) as HTMLElement;
      element?.focus();
    }
  }, [open, initialFocus]);

  useBodyScrollLock(open && preventBodyScroll);
  useEscapeKey(onClose, open && closeOnEscape);
  useFocusTrap(modalRef, open && focusTrap);

  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // Size classes
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    base: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Variant classes
  const variantClasses = {
    default: 'items-end sm:items-center',
    centered: 'items-center',
    top: 'items-start pt-16',
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className={cn(
          'fixed inset-0 flex justify-center',
          variantClasses[variant],
          overlayClassName
        )}
        style={{ zIndex }}
        onClick={handleOverlayClick}
      >
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ 
            opacity: 0, 
            scale: 0.95,
            y: variant === 'default' ? 20 : 0 
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0 
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.95,
            y: variant === 'default' ? 20 : 0 
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            'relative bg-white rounded-lg shadow-xl w-full',
            sizeClasses[size],
            'max-h-[90vh] flex flex-col',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Header */}
          {(header || title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-machinery-200">
              <div className="flex-1 min-w-0">
                {header || (
                  <>
                    {title && (
                      <h2 id="modal-title" className="text-xl font-semibold text-machinery-900">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id="modal-description" className="mt-1 text-sm text-machinery-600">
                        {description}
                      </p>
                    )}
                  </>
                )}
              </div>
              {showCloseButton && (
                <ProfessionalButton
                  variant="ghost"
                  size="sm"
                  icon={Cancel01Icon}
                  onClick={onClose}
                  className="ml-4 flex-shrink-0"
                  aria-label="Close modal"
                />
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-machinery-200 p-6">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

// ============================================
// DRAWER COMPONENT
// ============================================

const ProfessionalDrawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  position = 'right',
  size = 'base',
  title,
  description,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  header,
  footer,
  children,
  className,
  overlayClassName,
  zIndex = 50,
  preventBodyScroll = true,
  focusTrap = true,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open && preventBodyScroll);
  useEscapeKey(onClose, open && closeOnEscape);
  useFocusTrap(drawerRef, open && focusTrap);

  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // Size classes based on position
  const sizeClasses = {
    left: {
      xs: 'w-64',
      sm: 'w-80',
      base: 'w-96',
      lg: 'w-[28rem]',
      xl: 'w-[32rem]',
      '2xl': 'w-[36rem]',
    },
    right: {
      xs: 'w-64',
      sm: 'w-80',
      base: 'w-96',
      lg: 'w-[28rem]',
      xl: 'w-[32rem]',
      '2xl': 'w-[36rem]',
    },
    top: {
      xs: 'h-64',
      sm: 'h-80',
      base: 'h-96',
      lg: 'h-[28rem]',
      xl: 'h-[32rem]',
      '2xl': 'h-[36rem]',
    },
    bottom: {
      xs: 'h-64',
      sm: 'h-80',
      base: 'h-96',
      lg: 'h-[28rem]',
      xl: 'h-[32rem]',
      '2xl': 'h-[36rem]',
    },
  };

  // Position classes
  const positionClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  // Animation variants
  const animationVariants = {
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    top: {
      initial: { y: '-100%' },
      animate: { y: 0 },
      exit: { y: '-100%' },
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className={cn('fixed inset-0', overlayClassName)}
        style={{ zIndex }}
        onClick={handleOverlayClick}
      >
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50"
        />

        {/* Drawer */}
        <motion.div
          ref={drawerRef}
          initial={animationVariants[position].initial}
          animate={animationVariants[position].animate}
          exit={animationVariants[position].exit}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'absolute bg-white shadow-xl flex flex-col',
            positionClasses[position],
            sizeClasses[position][size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'drawer-title' : undefined}
          aria-describedby={description ? 'drawer-description' : undefined}
        >
          {/* Header */}
          {(header || title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-machinery-200 flex-shrink-0">
              <div className="flex-1 min-w-0">
                {header || (
                  <>
                    {title && (
                      <h2 id="drawer-title" className="text-xl font-semibold text-machinery-900">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id="drawer-description" className="mt-1 text-sm text-machinery-600">
                        {description}
                      </p>
                    )}
                  </>
                )}
              </div>
              {showCloseButton && (
                <ProfessionalButton
                  variant="ghost"
                  size="sm"
                  icon={Cancel01Icon}
                  onClick={onClose}
                  className="ml-4 flex-shrink-0"
                  aria-label="Close drawer"
                />
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-machinery-200 p-6 flex-shrink-0">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

// ============================================
// CONFIRMATION DIALOG
// ============================================

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}) => {
  return (
    <ProfessionalModal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      showCloseButton={false}
      footer={
        <div className="flex justify-end gap-3">
          <ProfessionalButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </ProfessionalButton>
          <ProfessionalButton
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </ProfessionalButton>
        </div>
      }
    >
      <p className="text-machinery-600">{message}</p>
    </ProfessionalModal>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ProfessionalModal;
export { ProfessionalDrawer, ConfirmationDialog };
export type { ModalProps, DrawerProps, ConfirmationDialogProps };
