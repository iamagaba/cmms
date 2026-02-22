import React from 'react';
import { Bell, Search, PanelLeft, PanelLeftClose } from 'lucide-react';
import { useLocation } from 'react-router-dom';
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
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function TopBar({ className, onQuickSearchClick, sidebarCollapsed, onToggleSidebar }: TopBarProps) {
  const location = useLocation();
  
  // Map routes to page titles
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/work-orders')) return 'Work Orders';
    if (path.startsWith('/assets')) return 'Assets';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/technicians')) return 'Technicians';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/locations')) return 'Service Centers';
    if (path.startsWith('/scheduling')) return 'Scheduling';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/design-system')) return 'Design System';
    if (path.startsWith('/customer-care')) return 'Customer Care';
    
    return 'Navigation';
  };
  
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
      {/* Left: Sidebar toggle + Page title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Sidebar Toggle Button */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </Button>
        )}
        
        <h2 className="text-sm font-medium text-muted-foreground">{getPageTitle()}</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
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
