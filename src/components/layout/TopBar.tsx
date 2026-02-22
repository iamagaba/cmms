import React from 'react';
import { Bell, Search, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TopBarProps {
  className?: string;
  onQuickSearchClick?: () => void;
  onShortcutsClick?: () => void;
}

export function TopBar({ className, onQuickSearchClick, onShortcutsClick }: TopBarProps) {
  const [notifications] = React.useState([
    {
      id: '1',
      title: 'Work Order #1234 completed',
      time: '5 min ago',
      unread: true,
    },
    {
      id: '2',
      title: 'New asset added to inventory',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Scheduled maintenance due tomorrow',
      time: '2 hours ago',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={cn(
        'h-14 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-30',
        className
      )}
    >
      {/* Left: Page title placeholder */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-medium text-muted-foreground">Navigation</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Keyboard Shortcuts */}
        {onShortcutsClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onShortcutsClick}
            title="Keyboard shortcuts (⌘?)"
          >
            <Keyboard className="w-5 h-5" />
          </Button>
        )}

        {/* Quick Search Trigger */}
        {onQuickSearchClick && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={onQuickSearchClick}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Search</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Notifications</h4>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                    Mark all as read
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No notifications
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors',
                        notification.unread && 'bg-muted/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
