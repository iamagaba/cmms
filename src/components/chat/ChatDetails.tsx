import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Call02Icon,
    Message01Icon as MessageIcon,
    Location01Icon,
    Motorbike01Icon,
    Add01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { WhatsAppChat } from './types';

interface ChatDetailsProps {
    chat: WhatsAppChat;
}

export const ChatDetails: React.FC<ChatDetailsProps> = ({ chat }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'files' | 'work-orders'>('details');

    return (
        <div className="w-80 2xl:w-96 border-l border-border bg-background flex flex-col h-full overflow-y-auto no-scrollbar">
            <div className="h-16 flex border-b border-border shrink-0">
                {['Details', 'Files', 'Work Orders'].map((tab) => {
                    const tabKey = tab.toLowerCase().replace(' ', '-') as typeof activeTab;
                    const isActive = activeTab === tabKey;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tabKey)}
                            className={cn(
                                "flex-1 text-xs font-bold tracking-wider transition-colors relative",
                                isActive
                                    ? "text-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'details' && (
                <div className="p-5 space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-muted mb-3 overflow-hidden border-4 border-background shadow-sm">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.customerName || 'User')}&background=random&size=128`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-base font-bold text-foreground font-brand text-center">
                            {chat.customerName}
                        </h2>

                        <div className="mt-3 w-full space-y-2.5">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <HugeiconsIcon icon={Call02Icon} size={14} className="text-primary" />
                                <span>{chat.customerPhone}</span>
                            </div>
                            {chat.whatsappVerified && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <HugeiconsIcon icon={MessageIcon} size={14} className="text-green-500" />
                                    <span className="text-green-600 dark:text-green-400 font-medium">WhatsApp Verified</span>
                                </div>
                            )}
                            {chat.location && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <HugeiconsIcon icon={Location01Icon} size={14} className="text-muted-foreground" />
                                    <span>{chat.location}</span>
                                </div>
                            )}
                        </div>


                    </div>



                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground mb-2 flex justify-between items-center tracking-wider uppercase">
                            <span>Work orders (3)</span>
                        </h3>

                        <div className="space-y-2">
                            <div className="group hover:bg-muted/50 p-2.5 -mx-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-bold text-primary font-mono">WO-20260109-6248</span>
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold rounded">Ready</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">Engine Issues</p>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>Jan 9, 2026</span>
                                    <span>Mugisha Amon</span>
                                </div>
                            </div>

                            <div className="group hover:bg-muted/50 p-2.5 -mx-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-bold text-primary font-mono">WO-20260106-5402</span>
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px] font-bold rounded">Completed</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">Engine Issues</p>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>Jan 6, 2026</span>
                                    <span>Mugisha Amon</span>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full mt-6 text-sm font-bold gap-2" size="sm">
                            <HugeiconsIcon icon={Add01Icon} size={16} />
                            Create Work Order
                        </Button>


                    </div>
                </div>
            )}
        </div>
    );
};
