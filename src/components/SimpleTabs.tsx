import React, { useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export const SimpleTabs: React.FC<TabsProps> = ({ defaultValue, className, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const SimpleTabsList: React.FC<TabsListProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const SimpleTabsTrigger: React.FC<TabsTriggerProps> = ({ value, className, children }) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(className)}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const SimpleTabsContent: React.FC<TabsContentProps> = ({ value, className, children }) => {
  const { activeTab } = useTabs();

  if (activeTab !== value) {
    return null;
  }

  return <div className={className}>{children}</div>;
};
