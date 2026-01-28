
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Initialize Supabase Client (Replace with your actual env vars if using Vite env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Message {
    id: string;
    contact_phone: string;
    direction: 'inbound' | 'outbound';
    content: string;
    status: string;
    created_at: string;
}

const WhatsAppTest = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [phone, setPhone] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages();

        // Subscribe to realtime updates
        const channel = supabase
            .channel('chat_messages_changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
                body: { phone, message: newMessage },
            });

            if (error) throw error;

            // Optimistically add to UI or wait for webhook to add it?
            // For now, let's wait for the webhook/database insert to update UI 
            // OR manually insert an outbound message record if the Edge Function doesn't do it.
            // The send-whatsapp-message function currently ONLY sends to Meta.
            // Meta will trigger a webhook for 'sent' status, but strictly speaking 
            // we should insert the outbound message record ourselves for tracking.

            await supabase.from('chat_messages').insert({
                contact_phone: phone,
                direction: 'outbound',
                type: 'text',
                content: newMessage,
                status: 'sent'
            });

            setNewMessage('');
        } catch (err: any) {
            alert('Error sending message: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">WhatsApp Integration Test</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border rounded-lg p-4 h-[600px] overflow-y-auto flex flex-col bg-muted">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`mb-4 p-3 rounded-lg max-w-[80%] ${msg.direction === 'outbound'
                                    ? 'bg-primary text-primary-foreground self-end'
                                    : 'bg-card border self-start'
                                }`}
                        >
                            <div className="text-xs opacity-75 mb-1">{msg.contact_phone}</div>
                            <div>{msg.content}</div>
                            <div className="text-xs opacity-75 mt-1 text-right">{msg.status}</div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border rounded-lg">
                    <form onSubmit={sendMessage} className="space-y-4">
                        <div>
                            <Label htmlFor="phone" className="text-xs">To Phone Number</Label>
                            <Input
                                id="phone"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. 15550000000"
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Format: Country code + Number (no +, no dashes).
                                For test numbers, you must add this number to your Meta App as a recipient.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="message" className="text-xs">Message</Label>
                            <Textarea
                                id="message"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="h-32"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppTest;

