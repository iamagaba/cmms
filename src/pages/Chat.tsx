import React, { useState, useEffect } from 'react';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatDetails } from '@/components/chat/ChatDetails';
import { WhatsAppChat, WhatsAppMessage } from '@/components/chat/types';

// Mock Data
const mockChats: WhatsAppChat[] = [
  {
    id: '1',
    customerPhone: '+256764326743',
    customerName: 'Joshua Mugume',
    customerId: 'cust-1',
    vehicleId: 'vehicle-1',
    licensePlate: 'UMA456GH',
    lastMessage: 'I\'ve created a work order for you. Our technician Mugisha Amon will contact you shortly.',
    lastMessageTime: new Date('2026-01-11T10:27:00'),
    unreadCount: 0,
    isActive: true,
    priority: 'high',
    status: 'active',
    tags: ['Maintenance'],
    hasActiveWorkOrder: true,
    activeWorkOrderId: 'WO-20260109-6248',
    customerSince: new Date('2024-01-15'),
    location: 'Kampala, Uganda',
    whatsappVerified: true,
    messages: [
      {
        id: 'm1',
        content: 'Hi, my motorcycle is making strange noises from the engine. Can someone help?',
        timestamp: new Date('2026-01-11T10:23:00'),
        isFromCustomer: true,
        status: 'read',
        messageType: 'text'
      },
      {
        id: 'm2',
        content: 'It started this morning. The sound gets louder when I accelerate.',
        timestamp: new Date('2026-01-11T10:24:00'),
        isFromCustomer: true,
        status: 'read',
        messageType: 'text'
      },
      {
        id: 'm3',
        content: 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        timestamp: new Date('2026-01-11T10:25:00'),
        isFromCustomer: true,
        status: 'read',
        messageType: 'image'
      },
      {
        id: 'm4',
        content: 'Hello Joshua! I can help you with that. This sounds like it might be a timing issue.',
        timestamp: new Date('2026-01-11T10:26:00'),
        isFromCustomer: false,
        status: 'read',
        messageType: 'text'
      },
      {
        id: 's1',
        content: 'Work Order WO-20260109-6248 created',
        timestamp: new Date('2026-01-11T10:27:00'),
        isFromCustomer: false,
        status: 'system',
        messageType: 'system'
      },
      {
        id: 'm5',
        content: 'I\'ve created a work order for you. Our technician Mugisha Amon will contact you shortly.',
        timestamp: new Date('2026-01-11T10:27:30'),
        isFromCustomer: false,
        status: 'read',
        messageType: 'text'
      }
    ]
  },
  {
    id: '2',
    customerPhone: '+256701234567',
    customerName: 'Sarah Namukasa',
    licensePlate: 'UMA789JK',
    lastMessage: 'Thank you for the quick service!',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 0,
    isActive: false,
    priority: 'normal',
    status: 'resolved',
    messages: []
  },
  {
    id: '3',
    customerPhone: '+256772345678',
    customerName: 'Bodawerk Uganda',
    licensePlate: 'UMA546HJ',
    lastMessage: 'We need to schedule maintenance for 5 motorcycles',
    lastMessageTime: new Date(Date.now() - 10800000),
    unreadCount: 1,
    isActive: true,
    priority: 'high',
    status: 'active',
    hasActiveWorkOrder: true,
    activeWorkOrderId: 'WO-20260108-0791',
    messages: []
  },
  {
    id: '4',
    customerPhone: '+256753456789',
    customerName: 'David Okello',
    licensePlate: 'UMA321CD',
    lastMessage: 'Battery replacement completed',
    lastMessageTime: new Date(Date.now() - 18000000),
    unreadCount: 0,
    isActive: false,
    priority: 'normal',
    status: 'resolved',
    messages: []
  }
];

const Chat: React.FC = () => {
  const [chats, setChats] = useState<WhatsAppChat[]>(mockChats);
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(mockChats[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Update selectedChat when messages change
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: WhatsAppMessage = {
      id: `m${Date.now()}`,
      content: newMessage,
      timestamp: new Date(),
      isFromCustomer: false,
      status: 'sent',
      messageType: 'text'
    };

    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, message],
      lastMessage: newMessage,
      lastMessageTime: new Date()
    };

    // Update chats list
    const updatedChats = chats.map(c =>
      c.id === selectedChat.id ? updatedChat : c
    );

    setChats(updatedChats);
    setSelectedChat(updatedChat);
    setNewMessage('');
  };

  const filteredChats = chats.filter(chat =>
    !searchQuery ||
    chat.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.customerPhone.includes(searchQuery)
  );

  return (
    <div className="flex bg-background overflow-hidden h-[calc(100vh-9rem)] lg:h-screen">
      <ChatList
        chats={filteredChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ChatWindow
        chat={selectedChat}
        newMessage={newMessage}
        onNewMessageChange={setNewMessage}
        onSendMessage={handleSendMessage}
      />

      {selectedChat && (
        <ChatDetails chat={selectedChat} />
      )}
    </div>
  );
};

export default Chat;