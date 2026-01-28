import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            className,
            label,
            description,
            error,
            size = 'sm',
            color = 'blue',
            wrapperProps,
            disabled,
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

        const sizeClasses = {
            xs: 'h-3 w-3',
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
            xl: 'h-7 w-7',
        };

        return (
            <div className={twMerge("flex items-start", wrapperProps?.className)} {...wrapperProps}>
                <div className="flex items-center h-5">
                    <input
                        ref={ref}
                        id={generatedId}
                        type="checkbox"
                        disabled={disabled}
                        className={twMerge(
                            'rounded border-gray-300 text-muted-foreground focus:ring-blue-500',
                            sizeClasses[size],
                            disabled && 'opacity-50 cursor-not-allowed',
                            className
                        )}
                        {...props}
                    />
                </div>
                {(label || description) && (
                    <div className="ml-2 text-sm">
                        {label && (
                            <label
                                htmlFor={generatedId}
                                className={clsx(
                                    'font-medium',
                                    disabled ? 'text-gray-400' : 'text-gray-700',
                                    size === 'xs' && 'text-xs',
                                    size === 'sm' && 'text-sm',
                                    size === 'md' && 'text-base',
                                    size === 'lg' && 'text-lg',
                                )}
                            >
                                {label}
                            </label>
                        )}
                        {description && (
                            <p className={clsx('text-gray-500', size === 'sm' ? 'text-xs' : 'text-sm')}>
                                {description}
                            </p>
                        )}
                        {error && (
                            <p className="mt-1 text-sm text-destructive">
                                {error}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

// Checkbox Group Component to mimic Mantine's Checkbox.Group
interface CheckboxGroupProps {
    children: ReactNode;
    value?: string[];
    onChange?: (value: string[]) => void;
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
}

export const CheckboxGroup = ({
    children,
    value,
    onChange,
    label,
    description,
    error
}: CheckboxGroupProps) => {
    return (
        <div className="space-y-2">
            {(label || description) && (
                <div className="mb-2">
                    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
                    {description && <p className="text-sm text-gray-500">{description}</p>}
                </div>
            )}
            <div className="space-y-2">
                {children}
            </div>
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
        </div>
    );
};

// Start of sub-components
type CheckboxComponent = React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>> & {
    Group: typeof CheckboxGroup;
};

(Checkbox as unknown as CheckboxComponent).Group = CheckboxGroup;

export default Checkbox as CheckboxComponent;

