
import React from 'react';
import { useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import {
    CheckCircle,
    Bell,
    BellOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

const NotificationsTab = () => {
    const { notifications, unreadCount, markAllAsRead } = useNotifications();

    return (
        <div className="space-y-6">
            {unreadCount > 0 && (
                <div className="flex justify-end">
                    <Button variant="outline" onClick={markAllAsRead}>
                        <CheckCircle className="w-4 h-4" />
                        Mark all as read
                    </Button>
                </div>
            )}

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <BellOff className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h4 className="text-base font-medium text-foreground mb-1">No notifications yet</h4>
                        <p className="text-sm text-muted-foreground">We'll let you know when something arrives</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => {
                        const isRead = notification.is_read;
                        return (
                            <Card
                                key={notification.id}
                                className={`transition-all ${isRead
                                    ? 'hover:border-border'
                                    : 'border-primary/20 bg-primary/5 hover:border-primary/30'
                                    }`}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`p-2 rounded-md ${isRead
                                                ? 'bg-muted text-muted-foreground'
                                                : 'bg-primary/10 text-primary'
                                                }`}
                                        >
                                            <Bell className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NotificationsTab;
