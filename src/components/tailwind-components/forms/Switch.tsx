import { cn } from '@/lib/utils';

export interface SwitchProps {
    /** Whether switch is checked */
    checked?: boolean;
    /** Change handler */
    onChange?: (checked: boolean) => void;
    /** Switch label */
    label?: string;
    /** Whether switch is disabled */
    disabled?: boolean;
    /** Switch size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Additional className */
    className?: string;
}

const sizeMap = {
    xs: { switch: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    sm: { switch: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
    md: { switch: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { switch: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
    xl: { switch: 'w-16 h-8', thumb: 'w-7 h-7', translate: 'translate-x-8' },
};

/**
 * Switch component - toggle switch
 * Replaces Mantine Switch
 */
export function Switch({
    checked = false,
    onChange,
    label,
    disabled,
    size = 'md',
    className,
}: SwitchProps) {
    const sizes = sizeMap[size];

    const handleClick = () => {
        if (!disabled) {
            onChange?.(!checked);
        }
    };

    return (
        <label className={cn('inline-flex items-center gap-2 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
            <div
                onClick={handleClick}
                className={cn(
                    'relative inline-flex items-center rounded-full transition-colors',
                    sizes.switch,
                    checked ? 'bg-primary-600' : 'bg-gray-300',
                    disabled && 'cursor-not-allowed'
                )}
            >
                <span
                    className={cn(
                        'inline-block rounded-full bg-white transition-transform',
                        sizes.thumb,
                        checked ? sizes.translate : 'translate-x-0.5'
                    )}
                />
            </div>
            {label && <span className="text-sm text-gray-700">{label}</span>}
        </label>
    );
}
