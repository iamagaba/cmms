import React from 'react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { WhatsAppChat } from './types';

interface ChatListProps {
    chats: WhatsAppChat[];
    selectedChat: WhatsAppChat | null;
    onSelectChat: (chat: WhatsAppChat) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
    chats,
    selectedChat,
    onSelectChat,
    searchQuery,
    onSearchChange,
}) => {
    const totalUnread = chats.reduce((acc, chat) => acc + chat.unreadCount, 0);

    return (
        <div className="w-80 border-r border-border bg-background flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <div className="relative mb-4">
                    <HugeiconsIcon
                        icon={Search01Icon}
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 bg-secondary/50 border-transparent focus:bg-background transition-colors"
                    />
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground tracking-wide">
                    <span>All messages</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {totalUnread}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        className={cn(
                            "px-3 py-3 cursor-pointer transition-all rounded-xl border border-transparent",
                            selectedChat?.id === chat.id
                                ? "bg-secondary text-secondary-foreground"
                                : "hover:bg-muted/50"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            chat.customerName || 'User'
                                        )}&background=random`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {chat.isActive && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h4
                                        className={cn(
                                            "text-sm font-bold truncate",
                                            chat.unreadCount > 0 ? "text-foreground" : "text-card-foreground"
                                        )}
                                    >
                                        {chat.customerName || chat.customerPhone}
                                    </h4>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                        {chat.lastMessageTime.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    {chat.licensePlate && (
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 font-mono">
                                            {chat.licensePlate}
                                        </span>
                                    )}
                                    {chat.customerName && (
                                        <span className="text-xs text-muted-foreground truncate">
                                            • {chat.customerPhone}
                                        </span>
                                    )}
                                </div>

                                <p
                                    className={cn(
                                        "text-sm truncate text-muted-foreground",
                                        chat.unreadCount > 0 && "font-medium text-foreground"
                                    )}
                                >
                                    {chat.lastMessage}
                                </p>

                                {chat.hasActiveWorkOrder && chat.activeWorkOrderId && (
                                    <div className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">
                                        <span className="font-medium font-mono">{chat.activeWorkOrderId}</span>
                                    </div>
                                )}
                            </div>

                            {chat.unreadCount > 0 && (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                        {chat.unreadCount}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
