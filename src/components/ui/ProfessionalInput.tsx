/**
 * Professional CMMS Input Component System
 * 
 * A comprehensive input system designed for maintenance management workflows.
 * Includes text inputs, selects, textareas, and form field wrappers with
 * consistent styling, validation states, and accessibility features.
 */

import React, { forwardRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// BASE INPUT INTERFACES
// ============================================

export interface BaseInputProps {
  /**
   * Input size affects padding and font size
   */
  size?: 'sm' | 'base' | 'lg';
  
  /**
   * Input validation state
   */
  state?: 'default' | 'success' | 'warning' | 'error';
  
  /**
   * Icon to display before the input
   */
  icon?: string;
  
  /**
   * Icon to display after the input
   */
  iconRight?: string;
  
  /**
   * Whether the input is loading
   */
  loading?: boolean;
  
  /**
   * Label for the input
   */
  label?: string;
  
  /**
   * Description text below the input
   */
  description?: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Success message to display
   */
  success?: string;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * Wrapper className
   */
  wrapperClassName?: string;
}

export interface ProfessionalInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    BaseInputProps {}

export interface ProfessionalTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    BaseInputProps {
  /**
   * Whether the textarea should auto-resize
   */
  autoResize?: boolean;
  
  /**
   * Minimum number of rows
   */
  minRows?: number;
  
  /**
   * Maximum number of rows
   */
  maxRows?: number;
}

export interface ProfessionalSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    BaseInputProps {
  /**
   * Select options
   */
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  
  /**
   * Placeholder option
   */
  placeholder?: string;
}

// ============================================
// STYLE VARIANTS
// ============================================

const inputSizes = {
  sm: {
    input: 'h-8 px-3 text-sm',
    icon: 'w-4 h-4',
    iconContainer: 'px-2.5',
  },
  base: {
    input: 'h-10 px-3 text-sm',
    icon: 'w-4 h-4',
    iconContainer: 'px-3',
  },
  lg: {
    input: 'h-12 px-4 text-base',
    icon: 'w-5 h-5',
    iconContainer: 'px-3.5',
  },
};

const inputStates = {
  default: {
    input: 'border-machinery-300 dark:border-gray-700 focus:border-steel-500 focus:ring-steel-500',
    icon: 'text-machinery-400 dark:text-gray-500',
  },
  success: {
    input: 'border-industrial-300 dark:border-industrial-700 focus:border-industrial-500 focus:ring-industrial-500',
    icon: 'text-industrial-500 dark:text-industrial-400',
  },
  warning: {
    input: 'border-maintenance-300 dark:border-maintenance-700 focus:border-maintenance-500 focus:ring-maintenance-500',
    icon: 'text-maintenance-500 dark:text-maintenance-400',
  },
  error: {
    input: 'border-warning-300 dark:border-warning-700 focus:border-warning-500 focus:ring-warning-500',
    icon: 'text-warning-500 dark:text-warning-400',
  },
};

// ============================================
// LOADING SPINNER COMPONENT
// ============================================

const InputLoadingSpinner: React.FC<{ size: 'sm' | 'base' | 'lg' }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    base: 'w-4 h-4',
    lg: 'w-4 h-4',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={cn(
        'border-2 border-current border-t-transparent rounded-full',
        sizeClasses[size]
      )}
    />
  );
};

// ============================================
// FIELD WRAPPER COMPONENT
// ============================================

interface FieldWrapperProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  description,
  error,
  success,
  required,
  children,
  className,
  htmlFor,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-machinery-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="ml-1 text-warning-500" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-machinery-500 dark:text-gray-400">{description}</p>
      )}

      {/* Input */}
      {children}

      {/* Messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-sm text-warning-600 dark:text-warning-400"
          >
            <Icon icon="tabler:alert-circle" className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-sm text-industrial-600 dark:text-industrial-400"
          >
            <Icon icon="tabler:circle-check" className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// TEXT INPUT COMPONENT
// ============================================

const ProfessionalInput = forwardRef<HTMLInputElement, ProfessionalInputProps>(
  (
    {
      size = 'base',
      state = 'default',
      icon,
      iconRight,
      loading = false,
      label,
      description,
      error,
      success,
      required,
      wrapperClassName,
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const actualState = error ? 'error' : success ? 'success' : state;
    const sizeConfig = inputSizes[size];
    const stateConfig = inputStates[actualState];

    const inputElement = (
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className={cn(
            'absolute left-0 top-0 h-full flex items-center pointer-events-none',
            sizeConfig.iconContainer
          )}>
            <Icon 
              icon={icon} 
              className={cn(sizeConfig.icon, stateConfig.icon)} 
            />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled || loading}
          className={cn(
            // Base styles
            'block w-full rounded-lg border bg-white dark:bg-gray-800 shadow-sm',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-gray-900',
            'disabled:bg-machinery-50 dark:disabled:bg-gray-900 disabled:text-machinery-500 dark:disabled:text-gray-500 disabled:cursor-not-allowed',
            'placeholder:text-machinery-400 dark:placeholder:text-gray-500',
            'text-gray-900 dark:text-gray-100',
            
            // Size styles
            sizeConfig.input,
            
            // State styles
            stateConfig.input,
            
            // Icon padding
            icon && 'pl-10',
            (iconRight || loading) && 'pr-10',
            
            // Custom className
            className
          )}
          {...props}
        />

        {/* Right Icon or Loading */}
        {(iconRight || loading) && (
          <div className={cn(
            'absolute right-0 top-0 h-full flex items-center pointer-events-none',
            sizeConfig.iconContainer
          )}>
            {loading ? (
              <InputLoadingSpinner size={size} />
            ) : iconRight ? (
              <Icon 
                icon={iconRight} 
                className={cn(sizeConfig.icon, stateConfig.icon)} 
              />
            ) : null}
          </div>
        )}
      </div>
    );

    if (label || description || error || success) {
      return (
        <FieldWrapper
          label={label}
          description={description}
          error={error}
          success={success}
          required={required}
          className={wrapperClassName}
          htmlFor={inputId}
        >
          {inputElement}
        </FieldWrapper>
      );
    }

    return inputElement;
  }
);

ProfessionalInput.displayName = 'ProfessionalInput';

// ============================================
// TEXTAREA COMPONENT
// ============================================

const ProfessionalTextarea = forwardRef<HTMLTextAreaElement, ProfessionalTextareaProps>(
  (
    {
      size = 'base',
      state = 'default',
      loading = false,
      label,
      description,
      error,
      success,
      required,
      wrapperClassName,
      className,
      disabled,
      id,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      ...props
    },
    ref
  ) => {
    const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const actualState = error ? 'error' : success ? 'success' : state;
    const sizeConfig = inputSizes[size];
    const stateConfig = inputStates[actualState];

    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef) {
        const adjustHeight = () => {
          textareaRef.style.height = 'auto';
          const scrollHeight = textareaRef.scrollHeight;
          const lineHeight = parseInt(getComputedStyle(textareaRef).lineHeight);
          const minHeight = lineHeight * minRows;
          const maxHeight = lineHeight * maxRows;
          
          const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
          textareaRef.style.height = `${newHeight}px`;
        };

        adjustHeight();
        textareaRef.addEventListener('input', adjustHeight);
        
        return () => {
          textareaRef.removeEventListener('input', adjustHeight);
        };
      }
    }, [autoResize, textareaRef, minRows, maxRows]);

    const textareaElement = (
      <div className="relative">
        <textarea
          ref={(node) => {
            setTextareaRef(node);
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          id={inputId}
          disabled={disabled || loading}
          rows={autoResize ? minRows : props.rows || minRows}
          className={cn(
            // Base styles
            'block w-full rounded-lg border bg-white dark:bg-gray-800 shadow-sm resize-none',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-gray-900',
            'disabled:bg-machinery-50 dark:disabled:bg-gray-900 disabled:text-machinery-500 dark:disabled:text-gray-500 disabled:cursor-not-allowed',
            'placeholder:text-machinery-400 dark:placeholder:text-gray-500',
            'text-gray-900 dark:text-gray-100',
            
            // Size styles (excluding height for textarea)
            'px-3 py-2.5 text-sm',
            
            // State styles
            stateConfig.input,
            
            // Custom className
            className
          )}
          {...props}
        />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute top-3 right-3">
            <InputLoadingSpinner size={size} />
          </div>
        )}
      </div>
    );

    if (label || description || error || success) {
      return (
        <FieldWrapper
          label={label}
          description={description}
          error={error}
          success={success}
          required={required}
          className={wrapperClassName}
          htmlFor={inputId}
        >
          {textareaElement}
        </FieldWrapper>
      );
    }

    return textareaElement;
  }
);

ProfessionalTextarea.displayName = 'ProfessionalTextarea';

// ============================================
// SELECT COMPONENT
// ============================================

const ProfessionalSelect = forwardRef<HTMLSelectElement, ProfessionalSelectProps>(
  (
    {
      size = 'base',
      state = 'default',
      icon,
      loading = false,
      label,
      description,
      error,
      success,
      required,
      wrapperClassName,
      className,
      disabled,
      id,
      options = [],
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const actualState = error ? 'error' : success ? 'success' : state;
    const sizeConfig = inputSizes[size];
    const stateConfig = inputStates[actualState];

    const selectElement = (
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className={cn(
            'absolute left-0 top-0 h-full flex items-center pointer-events-none z-10',
            sizeConfig.iconContainer
          )}>
            <Icon 
              icon={icon} 
              className={cn(sizeConfig.icon, stateConfig.icon)} 
            />
          </div>
        )}

        {/* Select */}
        <select
          ref={ref}
          id={inputId}
          disabled={disabled || loading}
          className={cn(
            // Base styles
            'block w-full rounded-lg border bg-white dark:bg-gray-800 shadow-sm appearance-none',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-gray-900',
            'disabled:bg-machinery-50 dark:disabled:bg-gray-900 disabled:text-machinery-500 dark:disabled:text-gray-500 disabled:cursor-not-allowed',
            'text-gray-900 dark:text-gray-100',
            
            // Size styles
            sizeConfig.input,
            
            // State styles
            stateConfig.input,
            
            // Icon padding
            icon && 'pl-10',
            'pr-10', // Always reserve space for dropdown arrow
            
            // Custom className
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
          {children}
        </select>

        {/* Dropdown Arrow or Loading */}
        <div className={cn(
          'absolute right-0 top-0 h-full flex items-center pointer-events-none',
          sizeConfig.iconContainer
        )}>
          {loading ? (
            <InputLoadingSpinner size={size} />
          ) : (
            <Icon 
              icon="tabler:chevron-down" 
              className={cn(sizeConfig.icon, stateConfig.icon)} 
            />
          )}
        </div>
      </div>
    );

    if (label || description || error || success) {
      return (
        <FieldWrapper
          label={label}
          description={description}
          error={error}
          success={success}
          required={required}
          className={wrapperClassName}
          htmlFor={inputId}
        >
          {selectElement}
        </FieldWrapper>
      );
    }

    return selectElement;
  }
);

ProfessionalSelect.displayName = 'ProfessionalSelect';

// ============================================
// EXPORTS
// ============================================

export default ProfessionalInput;
export {
  ProfessionalTextarea,
  ProfessionalSelect,
  FieldWrapper,
};