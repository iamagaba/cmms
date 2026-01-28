import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Base FormField Props
interface BaseFormFieldProps {
  label: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
}

// Input FormField
interface InputFormFieldProps extends BaseFormFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
}

export function FormField({
  label,
  id,
  error,
  helperText,
  required,
  className,
  labelClassName,
  ...inputProps
}: InputFormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label 
        htmlFor={id} 
        className={cn('text-xs font-medium', labelClassName)}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        id={id}
        {...inputProps}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive'
        )}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

// Textarea FormField
interface TextareaFormFieldProps extends BaseFormFieldProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {}

export function TextareaFormField({
  label,
  id,
  error,
  helperText,
  required,
  className,
  labelClassName,
  ...textareaProps
}: TextareaFormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label 
        htmlFor={id} 
        className={cn('text-xs font-medium', labelClassName)}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Textarea
        id={id}
        {...textareaProps}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive'
        )}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

// Select FormField
interface SelectOption {
  value: string;
  label: string;
}

interface SelectFormFieldProps extends BaseFormFieldProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

export function SelectFormField({
  label,
  id,
  error,
  helperText,
  required,
  className,
  labelClassName,
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
}: SelectFormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label 
        htmlFor={id} 
        className={cn('text-xs font-medium', labelClassName)}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger 
          id={id}
          className={cn(
            error && 'border-destructive focus:ring-destructive'
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

// Export all as named exports
export { type InputFormFieldProps, type TextareaFormFieldProps, type SelectFormFieldProps, type SelectOption };
