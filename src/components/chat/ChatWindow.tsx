import React, { useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Tick01Icon,
    InformationCircleIcon,
    MoreVerticalIcon,
    Add01Icon,
    File01Icon as FileIcon,
    StarIcon,
    ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { WhatsAppChat, WhatsAppMessage } from './types';

interface ChatWindowProps {
    chat: WhatsAppChat | null;
    newMessage: string;
    onNewMessageChange: (message: string) => void;
    onSendMessage: () => void;
    onToggleDetails?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    chat,
    newMessage,
    onNewMessageChange,
    onSendMessage,
    onToggleDetails,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <p className="text-muted-foreground">Select a chat to view messages</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-secondary/30 dark:bg-background">
            {/* HEADER */}
            <div className="h-16 px-6 border-b border-border bg-background flex items-center justify-between shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground font-brand">
                            {chat.customerName}
                        </h2>
                        {chat.whatsappVerified && (
                            <HugeiconsIcon icon={Tick01Icon} size={14} className="text-green-500" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{chat.licensePlate}</span>
                        <span>•</span>
                        <span>{chat.vehicleId ? 'EV 125AT' : 'Vehicle'}</span>
                        {chat.activeWorkOrderId && (
                            <>
                                <span>•</span>
                                <span className="text-primary font-medium font-mono">{chat.activeWorkOrderId}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <HugeiconsIcon icon={InformationCircleIcon} size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
                    </Button>
                </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
                <div className="flex justify-center">
                    <span className="bg-secondary text-muted-foreground text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide">
                        Today
                    </span>
                </div>

                {chat.messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} chat={chat} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-background border-t border-border shrink-0">
                <div className="flex items-center gap-3 max-w-4xl mx-auto bg-secondary/50 rounded-xl px-4 py-2 border border-border focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <HugeiconsIcon icon={Add01Icon} size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <HugeiconsIcon icon={FileIcon} size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <HugeiconsIcon icon={StarIcon} size={20} />
                    </Button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => onNewMessageChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground"
                    />

                    <Button
                        onClick={onSendMessage}
                        disabled={!newMessage.trim()}
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-full transition-colors",
                            newMessage.trim()
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground"
                        )}
                    >
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

const MessageBubble: React.FC<{ message: WhatsAppMessage; chat: WhatsAppChat }> = ({ message, chat }) => {
    if (message.messageType === 'system') {
        return (
            <div className="flex justify-center py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-4 py-2 rounded-full border border-border">
                    <HugeiconsIcon icon={Tick01Icon} size={14} className="text-green-500" />
                    <span>{message.content}</span>
                    <span className="mx-1">•</span>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        );
    }

    const isCustomer = message.isFromCustomer;

    return (
        <div className={cn("flex w-full", isCustomer ? "justify-start" : "justify-end")}>
            <div className={cn(
                "flex max-w-[70%] sm:max-w-[60%] items-end gap-2",
                isCustomer ? "flex-row" : "flex-row-reverse"
            )}>
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                    {isCustomer ? (
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.customerName || 'Cust')}&background=random`} className="w-full h-full object-cover" />
                    ) : (
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" className="w-full h-full object-cover" />
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    {message.messageType === 'image' ? (
                        <div className={cn(
                            "rounded-xl overflow-hidden border",
                            isCustomer ? "border-border" : "border-primary"
                        )}>
                            <img src={message.content} alt="Attachment" className="max-w-full h-auto max-h-60 object-cover" />
                        </div>
                    ) : (
                        <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                            isCustomer
                                ? "bg-background text-foreground rounded-bl-none border border-border"
                                : "bg-primary text-primary-foreground rounded-br-none"
                        )}>
                            {message.content}
                        </div>
                    )}
                    <span className={cn(
                        "text-xs text-muted-foreground",
                        isCustomer ? "ml-1" : "text-right mr-1"
                    )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
};
