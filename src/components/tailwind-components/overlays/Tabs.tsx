import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabsProps {
    /** Default active tab */
    defaultValue?: string;
    /** Controlled active tab value */
    value?: string;
    /** Change handler for controlled mode */
    onTabChange?: (value: string) => void;
    /** Tabs orientation */
    orientation?: 'horizontal' | 'vertical';
    children: React.ReactNode;
    className?: string;
}

export interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export interface TabsTabProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export interface TabsPanelProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

const TabsContext = React.createContext<{
    activeTab: string;
    setActiveTab: (value: string) => void;
    orientation: 'horizontal' | 'vertical';
} | null>(null);

/**
 * Tabs component - tabbed interface
 * Replaces Mantine Tabs
 */
export function Tabs({
    defaultValue,
    value,
    onTabChange,
    orientation = 'horizontal',
    children,
    className,
}: TabsProps) {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const activeTab = value !== undefined ? value : internalValue;

    const setActiveTab = (newValue: string) => {
        if (value === undefined) {
            setInternalValue(newValue);
        }
        onTabChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab, orientation }}>
            <div className={cn('w-full', className)}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ children, className }: TabsListProps) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsList must be used within Tabs');

    return (
        <div
            className={cn(
                'flex border-b border-gray-200',
                context.orientation === 'vertical' && 'flex-col border-b-0 border-r',
                className
            )}
        >
            {children}
        </div>
    );
}

export function TabsTab({ value, children, className, disabled }: TabsTabProps) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsTab must be used within Tabs');

    const isActive = context.activeTab === value;

    return (
        <button
            onClick={() => !disabled && context.setActiveTab(value)}
            disabled={disabled}
            className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                isActive
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300',
                disabled && 'opacity-50 cursor-not-allowed',
                context.orientation === 'vertical' && isActive && 'border-b-0 border-r-2',
                className
            )}
        >
            {children}
        </button>
    );
}

export function TabsPanel({ value, children, className }: TabsPanelProps) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsPanel must be used within Tabs');

    if (context.activeTab !== value) return null;

    return <div className={cn('pt-4', className)}>{children}</div>;
}

// Attach sub-components
Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;
