import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ContextualTopBarProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  backLabel?: string;
  tabs?: {
    value: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function ContextualTopBar({
  title,
  subtitle,
  backUrl,
  backLabel = 'Back',
  tabs,
  activeTab,
  onTabChange,
  actions,
  className,
}: ContextualTopBarProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('border-b bg-background sticky top-0 z-30', className)}>
      <div className="px-6 py-4">
        {/* Top row: Back button + Title + Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {backUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backUrl)}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Bottom row: Tabs */}
        {tabs && tabs.length > 0 && (
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="h-10">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
    </div>
  );
}
