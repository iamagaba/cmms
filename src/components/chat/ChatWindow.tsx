import { Check, Info, MoreVertical, File, ChevronRight } from 'lucide-react';
import React, { useRef, useEffect } from 'react';


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
            <div className="flex-1 flex items-center justify-center bg-[#e5ddd5]">
                <p className="text-gray-600">Select a chat to view messages</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#e5ddd5]">
            {/* HEADER */}
            <div className="h-16 px-6 border-b border-gray-200 bg-[#f0f0f0] flex items-center justify-between shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-gray-900 font-brand">
                            {chat.customerName}
                        </h2>
                        {chat.whatsappVerified && (
                            <Check className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="font-mono">{chat.licensePlate}</span>
                        <span>•</span>
                        <span>{chat.vehicleId ? 'EV 125AT' : 'Vehicle'}</span>
                        {chat.activeWorkOrderId && (
                            <>
                                <span>•</span>
                                <span className="text-blue-600 font-medium font-mono">{chat.activeWorkOrderId}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Chat information">
                        <Info className="w-5 h-5" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="More options">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
                <div className="flex justify-center">
                    <span className="bg-white/80 text-gray-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                        Today
                    </span>
                </div>

                {chat.messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} chat={chat} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-[#f0f0f0] border-t border-gray-200 shrink-0">
                <div className="flex items-center gap-3 max-w-4xl mx-auto bg-white rounded-xl px-4 py-2 shadow-sm">
                    <button className="h-8 w-8 text-gray-500 hover:text-gray-700 flex items-center justify-center" aria-label="Attach file">
                        <File className="w-5 h-5" />
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => onNewMessageChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                        placeholder="Type your message..."
                        aria-label="Type message"
                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-500"
                    />

                    <button
                        onClick={onSendMessage}
                        disabled={!newMessage.trim()}
                        aria-label="Send message"
                        className={cn(
                            "h-8 w-8 rounded-full transition-colors flex items-center justify-center",
                            newMessage.trim()
                                ? "bg-[#25d366] text-white hover:bg-[#20bd5a]"
                                : "bg-gray-200 text-gray-400"
                        )}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const MessageBubble: React.FC<{ message: WhatsAppMessage; chat: WhatsAppChat }> = ({ message, chat }) => {
    if (message.messageType === 'system') {
        return (
            <div className="flex justify-center py-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                    <Check className="w-4 h-4 text-green-500" />
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
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-300">
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
                            isCustomer ? "border-gray-200" : "border-[#25d366]"
                        )}>
                            <img src={message.content} alt="Attachment" className="max-w-full h-auto max-h-60 object-cover" />
                        </div>
                    ) : (
                        <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                            isCustomer
                                ? "bg-white text-gray-900 rounded-bl-none"
                                : "bg-[#dcf8c6] text-gray-900 rounded-br-none"
                        )}>
                            {message.content}
                        </div>
                    )}
                    <span className={cn(
                        "text-xs text-gray-500",
                        isCustomer ? "ml-1" : "text-right mr-1"
                    )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
};


