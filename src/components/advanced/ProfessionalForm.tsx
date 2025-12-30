/**
 * Professional CMMS Form System
 * 
 * A comprehensive form system optimized for desktop CMMS workflows.
 * Features form validation, field groups, conditional fields, and
 * professional industrial styling designed for maintenance management.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  AlertCircleIcon,
  ArrowUp01Icon,
  ArrowDown01Icon
} from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalInput, { ProfessionalTextarea, ProfessionalSelect } from '@/components/ui/ProfessionalInput';
import ProfessionalButton from '@/components/ui/ProfessionalButton';
import { FormGrid } from '@/components/layout/ProfessionalGrid';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'datetime-local'
  | 'time'
  | 'file'
  | 'switch'
  | 'slider'
  | 'custom';

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any, formData: Record<string, any>) => string | null;
}

export interface FieldOption {
  label: string;
  value: any;
  disabled?: boolean;
  description?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationRule;
  disabled?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  span?: 1 | 2 | 3 | 'full';
  dependsOn?: string;
  showWhen?: (value: any, formData: Record<string, any>) => boolean;
  render?: (field: FormField, value: any, onChange: (value: any) => void, error?: string) => React.ReactNode;
  props?: Record<string, any>;
}

export interface FormSection {
  title: string;
  description?: string;
  icon?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  fields: FormField[];
  showWhen?: (formData: Record<string, any>) => boolean;
}

export interface FormConfig {
  title?: string;
  description?: string;
  sections?: FormSection[];
  fields?: FormField[];
  layout?: 'single' | 'double' | 'triple';
  submitLabel?: string;
  cancelLabel?: string;
  showReset?: boolean;
  resetLabel?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface ProfessionalFormProps {
  config: FormConfig;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  onReset?: () => void;
  onChange?: (data: Record<string, any>) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

const validateField = (field: FormField, value: any, formData: Record<string, any>): string | null => {
  const { validation } = field;
  if (!validation) return null;

  // Required validation
  if (validation.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`;
  }

  // Skip other validations if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // String length validations
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }
  }

  // Number validations
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
    const numValue = Number(value);
    if (validation.min !== undefined && numValue < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && numValue > validation.max) {
      return `${field.label} must be no more than ${validation.max}`;
    }
  }

  // Pattern validation
  if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
    return `${field.label} format is invalid`;
  }

  // Email validation
  if (validation.email && typeof value === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${field.label} must be a valid email address`;
    }
  }

  // URL validation
  if (validation.url && typeof value === 'string') {
    try {
      new URL(value);
    } catch {
      return `${field.label} must be a valid URL`;
    }
  }

  // Custom validation
  if (validation.custom) {
    return validation.custom(value, formData);
  }

  return null;
};

// ============================================
// FIELD COMPONENTS
// ============================================

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  // Custom render function
  if (field.render) {
    return <>{field.render(field, value, onChange, error)}</>;
  }

  const commonProps = {
    label: field.label,
    placeholder: field.placeholder,
    description: field.description,
    error: error,
    disabled: disabled || field.disabled,
    required: field.validation?.required,
    ...field.props,
  };

  switch (field.type) {
    case 'textarea':
      return (
        <ProfessionalTextarea
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      );

    case 'select':
      return (
        <ProfessionalSelect
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          options={field.options}
          placeholder={field.placeholder || `Select ${field.label}`}
        />
      );

    case 'multiselect':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-machinery-700">
            {field.label}
            {field.validation?.required && (
              <span className="ml-1 text-warning-500">*</span>
            )}
          </label>
          {field.description && (
            <p className="text-sm text-machinery-500">{field.description}</p>
          )}
          <div className="space-y-2 max-h-40 overflow-y-auto border border-machinery-300 rounded-lg p-3">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    onChange(newValues);
                  }}
                  disabled={disabled || option.disabled}
                  className="rounded border-machinery-300 text-steel-600 focus:ring-steel-500"
                />
                <span className="text-sm text-machinery-700">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-machinery-500">({option.description})</span>
                )}
              </label>
            ))}
          </div>
          {error && (
            <p className="text-sm text-warning-600 flex items-center gap-1">
              <HugeiconsIcon icon={AlertCircleIcon} size={16} />
              {error}
            </p>
          )}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-machinery-700">
            {field.label}
            {field.validation?.required && (
              <span className="ml-1 text-warning-500">*</span>
            )}
          </label>
          {field.description && (
            <p className="text-sm text-machinery-500">{field.description}</p>
          )}
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled || option.disabled}
                  className="border-machinery-300 text-steel-600 focus:ring-steel-500"
                />
                <span className="text-sm text-machinery-700">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-machinery-500">({option.description})</span>
                )}
              </label>
            ))}
          </div>
          {error && (
            <p className="text-sm text-warning-600 flex items-center gap-1">
              <HugeiconsIcon icon={AlertCircleIcon} size={16} />
              {error}
            </p>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="mt-1 rounded border-machinery-300 text-steel-600 focus:ring-steel-500"
          />
          <div className="flex-1">
            <label className="text-sm font-medium text-machinery-700">
              {field.label}
              {field.validation?.required && (
                <span className="ml-1 text-warning-500">*</span>
              )}
            </label>
            {field.description && (
              <p className="text-sm text-machinery-500 mt-1">{field.description}</p>
            )}
            {error && (
              <p className="text-sm text-warning-600 flex items-center gap-1 mt-1">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                {error}
              </p>
            )}
          </div>
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="text-sm font-medium text-machinery-700">
              {field.label}
              {field.validation?.required && (
                <span className="ml-1 text-warning-500">*</span>
              )}
            </label>
            {field.description && (
              <p className="text-sm text-machinery-500 mt-1">{field.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(!value)}
            disabled={disabled}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-2',
              value ? 'bg-steel-600' : 'bg-machinery-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                value ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      );

    case 'file':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-machinery-700">
            {field.label}
            {field.validation?.required && (
              <span className="ml-1 text-warning-500">*</span>
            )}
          </label>
          {field.description && (
            <p className="text-sm text-machinery-500">{field.description}</p>
          )}
          <div className="flex items-center gap-3">
            <input
              type="file"
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              disabled={disabled}
              className="block w-full text-sm text-machinery-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-steel-50 file:text-steel-700 hover:file:bg-steel-100"
              {...field.props}
            />
          </div>
          {error && (
            <p className="text-sm text-warning-600 flex items-center gap-1">
              <HugeiconsIcon icon={AlertCircleIcon} size={16} />
              {error}
            </p>
          )}
        </div>
      );

    default:
      return (
        <ProfessionalInput
          {...commonProps}
          type={field.type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

// ============================================
// FORM SECTION COMPONENT
// ============================================

interface FormSectionProps {
  section: FormSection;
  formData: Record<string, any>;
  errors: Record<string, string>;
  onChange: (name: string, value: any) => void;
  disabled?: boolean;
}

const FormSectionComponent: React.FC<FormSectionProps> = ({
  section,
  formData,
  errors,
  onChange,
  disabled,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(section.defaultCollapsed || false);

  // Check if section should be shown
  if (section.showWhen && !section.showWhen(formData)) {
    return null;
  }

  // Filter visible fields
  const visibleFields = section.fields.filter(field => {
    if (field.hidden) return false;
    if (field.showWhen && !field.showWhen(formData[field.dependsOn || ''], formData)) {
      return false;
    }
    return true;
  });

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-machinery-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div className="border-b border-machinery-200">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            {section.icon && (
              <div className="w-8 h-8 bg-steel-100 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-steel-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-machinery-900">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-sm text-machinery-600 mt-1">
                  {section.description}
                </p>
              )}
            </div>
          </div>
          {section.collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-machinery-500 hover:text-machinery-700 rounded-lg hover:bg-machinery-100"
            >
              <HugeiconsIcon 
                icon={isCollapsed ? ArrowDown01Icon : ArrowUp01Icon} 
                size={20} 
              />
            </button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {(!section.collapsible || !isCollapsed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              <FormGrid variant="double" gap="base">
                {visibleFields.map((field) => (
                  <div
                    key={field.name}
                    className={cn(
                      field.span === 'full' && 'col-span-full',
                      field.span === 2 && 'md:col-span-2',
                      field.span === 3 && 'md:col-span-3'
                    )}
                  >
                    <FieldRenderer
                      field={field}
                      value={formData[field.name]}
                      onChange={(value) => onChange(field.name, value)}
                      error={errors[field.name]}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </FormGrid>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// MAIN FORM COMPONENT
// ============================================

const ProfessionalForm: React.FC<ProfessionalFormProps> = ({
  config,
  initialData = {},
  onSubmit,
  onCancel,
  onReset,
  onChange,
  loading = false,
  disabled = false,
  className,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle field change
  const handleFieldChange = useCallback((name: string, value: any) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Clear field error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Call onChange callback
    onChange?.(newFormData);

    // Auto-save
    if (config.autoSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        // Auto-save logic here
        console.log('Auto-saving form data:', newFormData);
      }, config.autoSaveDelay || 1000);
    }
  }, [formData, errors, onChange, config.autoSave, config.autoSaveDelay]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const allFields = config.sections 
      ? config.sections.flatMap(section => section.fields)
      : config.fields || [];

    allFields.forEach(field => {
      // Skip hidden fields
      if (field.hidden) return;
      
      // Skip conditional fields that shouldn't be shown
      if (field.showWhen && !field.showWhen(formData[field.dependsOn || ''], formData)) {
        return;
      }

      const error = validateField(field, formData[field.name], formData);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config, formData]);

  // Handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit]);

  // Handle reset
  const handleReset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    onReset?.();
  }, [initialData, onReset]);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Form Header */}
      {(config.title || config.description) && (
        <div className="text-center">
          {config.title && (
            <h2 className="text-2xl font-bold text-machinery-900 mb-2">
              {config.title}
            </h2>
          )}
          {config.description && (
            <p className="text-machinery-600">
              {config.description}
            </p>
          )}
        </div>
      )}

      {/* Form Sections */}
      {config.sections ? (
        <div className="space-y-6">
          {config.sections.map((section, index) => (
            <FormSectionComponent
              key={index}
              section={section}
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
              disabled={disabled || loading}
            />
          ))}
        </div>
      ) : (
        /* Single Section Form */
        config.fields && (
          <div className="bg-white border border-machinery-200 rounded-lg p-6">
            <FormGrid variant={config.layout || 'double'} gap="base">
              {config.fields
                .filter(field => {
                  if (field.hidden) return false;
                  if (field.showWhen && !field.showWhen(formData[field.dependsOn || ''], formData)) {
                    return false;
                  }
                  return true;
                })
                .map((field) => (
                  <div
                    key={field.name}
                    className={cn(
                      field.span === 'full' && 'col-span-full',
                      field.span === 2 && 'md:col-span-2',
                      field.span === 3 && 'md:col-span-3'
                    )}
                  >
                    <FieldRenderer
                      field={field}
                      value={formData[field.name]}
                      onChange={(value) => handleFieldChange(field.name, value)}
                      error={errors[field.name]}
                      disabled={disabled || loading}
                    />
                  </div>
                ))}
            </FormGrid>
          </div>
        )
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end bg-white border border-machinery-200 rounded-lg p-6">
        {config.showReset && (
          <ProfessionalButton
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={disabled || loading || isSubmitting}
          >
            {config.resetLabel || 'Reset'}
          </ProfessionalButton>
        )}
        
        {onCancel && (
          <ProfessionalButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={disabled || loading || isSubmitting}
          >
            {config.cancelLabel || 'Cancel'}
          </ProfessionalButton>
        )}
        
        <ProfessionalButton
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={disabled || loading}
        >
          {config.submitLabel || 'Submit'}
        </ProfessionalButton>
      </div>
    </form>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ProfessionalForm;
export type {
  ProfessionalFormProps,
  FormConfig,
  FormSection,
  FormField,
  FieldType,
  ValidationRule,
  FieldOption,
};
