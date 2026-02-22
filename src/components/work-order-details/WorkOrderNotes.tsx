import React, { useState, useEffect, useRef } from 'react';
import { useWorkOrderNotes, useCreateWorkOrderNote } from '@/hooks/useTicketing';
import { useSession } from '@/context/SessionContext';
import { Send, Clock, MessageSquare, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkOrderNotesProps {
    workOrderId: string;
}

export const WorkOrderNotes: React.FC<WorkOrderNotesProps> = ({ workOrderId }) => {
    const { profile } = useSession();
    const { data: notes = [], isLoading } = useWorkOrderNotes(workOrderId);
    const createNote = useCreateWorkOrderNote();
    const [newNote, setNewNote] = useState('');
    const [draftSaved, setDraftSaved] = useState(false);
    const notesEndRef = useRef<HTMLDivElement>(null);
    const previousNotesLength = useRef(notes.length);

    // Auto-scroll to bottom when new note is added
    useEffect(() => {
        if (notes.length > previousNotesLength.current) {
            notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        previousNotesLength.current = notes.length;
    }, [notes.length]);

    // Auto-save draft to localStorage
    useEffect(() => {
        const draftKey = `note-draft-${workOrderId}`;

        // Load draft on mount
        if (!newNote) {
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                setNewNote(savedDraft);
            }
        }

        // Save draft on change (debounced)
        if (newNote.trim()) {
            const timeoutId = setTimeout(() => {
                localStorage.setItem(draftKey, newNote);
                setDraftSaved(true);
                setTimeout(() => setDraftSaved(false), 2000);
            }, 1000);
            return () => clearTimeout(timeoutId);
        } else {
            localStorage.removeItem(draftKey);
        }
    }, [newNote, workOrderId]);

    const handleAddNote = async () => {
        if (!newNote.trim() || !profile?.id) return;

        try {
            await createNote.mutateAsync({
                work_order_id: workOrderId,
                content: newNote.trim(),
                created_by: profile.id,
                source_system: 'cmms'
            });
            setNewNote('');
            localStorage.removeItem(`note-draft-${workOrderId}`);

            // Announce to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = 'Note added';
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddNote();
        }
    };

    const formatMessageDate = (date: Date) => {
        if (isToday(date)) return format(date, 'h:mm a');
        if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
        return format(date, 'MMM d, h:mm a');
    };

    return (
        <div className="flex flex-col h-full bg-white p-4">
            <div className="flex flex-col h-full border border-slate-200 rounded-lg overflow-hidden bg-white">
                {/* Input Area */}
                <div className="p-4 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Textarea
                                value={newNote}
                                onChange={e => setNewNote(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="min-h-[44px] h-[44px] max-h-48 resize-none overflow-hidden bg-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary/20 transition-all rounded-md py-3 px-4 hover:bg-slate-50 text-[13px]"
                                rows={1}
                                style={{
                                    height: newNote.split('\n').length > 1 ? `${Math.min(Math.max(44, newNote.split('\n').length * 20 + 24), 200)}px` : '44px'
                                }}
                            />
                        </div>
                        <Button
                            onClick={handleAddNote}
                            disabled={!newNote.trim() || createNote.isPending}
                            size="icon"
                            variant="ghost"
                            className={cn(
                                "h-11 w-11 rounded-md shrink-0 transition-colors",
                                newNote.trim() ? "text-primary hover:text-primary bg-primary/5 hover:bg-primary/10" : "text-slate-400 bg-slate-100 hover:bg-slate-200 cursor-not-allowed"
                            )}
                        >
                            {createNote.isPending ? (
                                <Clock className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className={cn("w-[18px] h-[18px]", newNote.trim() && "translate-x-[1px] -translate-y-[1px]")} />
                            )}
                        </Button>
                    </div>

                    {draftSaved && (
                        <div className="max-w-4xl mx-auto flex items-center gap-1.5 mt-2 px-1 text-[10px] text-primary/70 font-medium animate-in fade-in slide-in-from-top-1">
                            <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                            Draft saved locally
                        </div>
                    )}
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    {isLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "flex-row-reverse" : "")}>
                                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                                    <div className={cn("flex flex-col space-y-2 max-w-[70%]", i % 2 === 0 ? "items-end" : "items-start")}>
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-16 w-full rounded-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center gap-3 px-4 py-3 animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100/60 shadow-sm flex items-center justify-center shrink-0">
                                    <MessageSquare className="w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-[13px] font-medium text-slate-500 pr-2">
                                    No notes yet. Start the conversation...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden bg-white mb-4">
                            {notes.map((note) => {
                                const initials = `${note.profile?.first_name?.[0] || ''}${note.profile?.last_name?.[0] || ''}`.toUpperCase();
                                const timestamp = formatMessageDate(new Date(note.created_at));

                                return (
                                    <div
                                        key={note.id}
                                        className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group animate-in fade-in duration-300"
                                    >
                                        {/* Header Layout */}
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                                                <Avatar className="w-6 h-6 rounded-full flex-shrink-0">
                                                    <AvatarImage src={note.profile?.avatar_url} alt={`${note.profile?.first_name} ${note.profile?.last_name}`} />
                                                    <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                                        {initials || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {note.profile?.first_name} {note.profile?.last_name}

                                                {note.source_system === 'ticketing' && (
                                                    <Badge variant="secondary" className="scale-90 origin-left">
                                                        Support
                                                    </Badge>
                                                )}
                                            </h4>
                                            <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                                                {timestamp}
                                            </span>
                                        </div>

                                        {/* Content Container (indented) */}
                                        <div className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap break-words pl-[2rem]">
                                            {note.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={notesEndRef} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
