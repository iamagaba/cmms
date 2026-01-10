import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        style={{ zIndex: 1040 }}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 1050 }}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  );
};

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const DialogContent: React.FC<DialogContentProps> = ({ className = '', children, onClose }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Close dialog"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
      )}
    </div>
  );
};

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h2>
  );
};
