import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface MenuItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    leftSection?: React.ReactNode;
    color?: string;
    disabled?: boolean;
    className?: string;
}

export interface MenuProps {
    children: React.ReactNode;
}

export interface MenuTargetProps {
    children: React.ReactElement;
}

export interface MenuDropdownProps {
    children: React.ReactNode;
    className?: string;
}

const MenuContext = React.createContext<{
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
} | null>(null);

/**
 * Menu component - dropdown menu
 * Replaces Mantine Menu
 */
export function Menu({ children }: MenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <MenuContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative inline-block">{children}</div>
        </MenuContext.Provider>
    );
}

export function MenuTarget({ children }: MenuTargetProps) {
    const context = React.useContext(MenuContext);
    if (!context) throw new Error('MenuTarget must be used within Menu');

    return React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            context.setIsOpen(!context.isOpen);
            children.props.onClick?.(e);
        },
    });
}

export function MenuDropdown({ children, className }: MenuDropdownProps) {
    const context = React.useContext(MenuContext);
    if (!context) throw new Error('MenuDropdown must be used within Menu');

    if (!context.isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-10"
                onClick={() => context.setIsOpen(false)}
            />
            <div
                className={cn(
                    'absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg z-20',
                    'rounded-none',
                    className
                )}
            >
                {children}
            </div>
        </>
    );
}

export function MenuItem({
    children,
    onClick,
    leftSection,
    color,
    disabled,
    className,
}: MenuItemProps) {
    const context = React.useContext(MenuContext);

    const handleClick = () => {
        if (!disabled) {
            onClick?.();
            context?.setIsOpen(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={cn(
                'w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2',
                color === 'red' && 'text-destructive hover:bg-destructive/5',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {leftSection && <span className="flex-shrink-0">{leftSection}</span>}
            <span>{children}</span>
        </button>
    );
}

export function MenuDivider() {
    return <div className="border-t border-gray-200 my-1" />;
}

// Attach sub-components
Menu.Target = MenuTarget;
Menu.Dropdown = MenuDropdown;
Menu.Item = MenuItem;
Menu.Divider = MenuDivider;

