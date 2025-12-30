import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Tick01Icon,
  Search01Icon,
  MoreVerticalIcon,
  UserIcon,
  Wrench01Icon,
  Motorbike01Icon,
  ArrowLeft01Icon,
  InformationCircleIcon,
  Add01Icon,
  Call02Icon,
  Message01Icon as MessageIcon,
  ClipboardIcon,
  StarIcon,
  ArrowRight01Icon,
  Cancel01Icon,
  AlertCircleIcon,
  TimelineIcon,
  File01Icon as FileIcon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Vehicle } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { CreateWorkOrderForm } from '@/components/work-orders/CreateWorkOrderForm';

interface WhatsAppMessage {
  id: string;
  content: string;
  timestamp: Date;
  isFromCustomer: boolean;
  status: 'sent' | 'delivered' | 'read';
  messageType: 'text' | 'image' | 'document' | 'location';
  mediaUrl?: string;
  fileName?: string;
}

interface WhatsAppChat {
  id: string;
  customerPhone: string;
  customerName?: string;
  customerId?: string;
  vehicleId?: string;
  licensePlate?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isActive: boolean;
  messages: WhatsAppMessage[];
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  status?: 'active' | 'pending' | 'resolved';
  tags?: string[];
  hasActiveWorkOrder?: boolean;
  lastServiceDate?: Date;
}

// Mock data for demonstration
const mockChats: WhatsAppChat[] = [
  {
    id: '1',
    customerPhone: '+1234567890',
    customerName: 'John Smith',
    customerId: 'cust-1',
    vehicleId: 'vehicle-1',
    licensePlate: 'UBE 123A',
    lastMessage: 'My bike is making strange noises',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 2,
    isActive: true,
    priority: 'high',
    status: 'active',
    tags: ['brake-issue', 'noise'],
    hasActiveWorkOrder: false,
    lastServiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: 'm1',
        content: 'Hello, I need help with my bike',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isFromCustomer: true,
        status: 'read',
        messageType: 'text'
      },
      {
        id: 'm2',
        content: 'Hi John! I\'d be happy to help. What seems to be the issue?',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        isFromCustomer: false,
        status: 'read',
        messageType: 'text'
      },
      {
        id: 'm3',
        content: 'My bike is making strange noises when I brake',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        isFromCustomer: true,
        status: 'read',
        messageType: 'text'
      },
      {
        id: 'm4',
        content: 'Can you send me a photo or video of the bike?',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isFromCustomer: false,
        status: 'read',
        messageType: 'text'
      },
      {
        id: 'm5',
        content: 'My bike is making strange noises',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isFromCustomer: true,
        status: 'delivered',
        messageType: 'text'
      }
    ]
  },
  {
    id: '2',
    customerPhone: '+1987654321',
    customerName: 'Sarah Johnson',
    customerId: 'cust-2',
    vehicleId: 'vehicle-2',
    licensePlate: 'UBF 456B',
    lastMessage: 'Thank you for the quick service!',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
    isActive: false,
    priority: 'normal',
    status: 'resolved',
    tags: ['satisfied', 'completed'],
    hasActiveWorkOrder: false,
    lastServiceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    messages: []
  },
  {
    id: '3',
    customerPhone: '+1122334455',
    lastMessage: 'Is my bike ready for pickup?',
    lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    unreadCount: 1,
    isActive: false,
    priority: 'normal',
    status: 'pending',
    tags: ['pickup'],
    hasActiveWorkOrder: true,
    messages: []
  }
];

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(mockChats[0]);
  const [newMessage, setNewMessage] = useState('');
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Responsive design handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setShowCustomerDetails(false);
      } else {
        setShowCustomerDetails(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Query for customer details if we have a customer ID
  const { data: customerDetails } = useQuery<Customer | null>({
    queryKey: ['customer', selectedChat?.customerId],
    queryFn: async () => {
      if (!selectedChat?.customerId) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', selectedChat.customerId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!selectedChat?.customerId
  });

  // Query for vehicle details if we have a vehicle ID
  const { data: vehicleDetails } = useQuery<Vehicle | null>({
    queryKey: ['vehicle', selectedChat?.vehicleId],
    queryFn: async () => {
      if (!selectedChat?.vehicleId) return null;
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', selectedChat.vehicleId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!selectedChat?.vehicleId
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

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

    // Update the selected chat with new message
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, message],
      lastMessage: newMessage,
      lastMessageTime: new Date()
    };

    setSelectedChat(updatedChat);
    setNewMessage('');
    showSuccess('Message sent');
  };

  const handleCreateWorkOrder = () => {
    if (!selectedChat) return;
    setIsCreateWorkOrderOpen(true);
  };

  const handleWorkOrderFormClose = () => {
    setIsCreateWorkOrderOpen(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <HugeiconsIcon icon={Tick01Icon} size={16} className="text-gray-400" />;
      case 'delivered':
        return <HugeiconsIcon icon={Tick01Icon} size={16} className="text-gray-400" />;
      case 'read':
        return <HugeiconsIcon icon={Tick01Icon} size={16} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'normal':
        return 'bg-green-500';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
      case 'resolved':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };



  const filteredChats = mockChats.filter(chat => {
    const matchesSearch = !searchQuery ||
      chat.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.customerPhone.includes(searchQuery) ||
      chat.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => chat.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(mockChats.flatMap(chat => chat.tags || [])));

  return (
    <div className="h-[calc(100vh-120px)] flex bg-gray-50 dark:bg-gray-950">
      {/* Chat List Sidebar */}
      <div className={`${isMobileView ? 'w-full' : 'w-80'} ${isMobileView && selectedChat ? 'hidden' : 'flex'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">WhatsApp Chats</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <HugeiconsIcon icon={Search01Icon} size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <HugeiconsIcon icon={MoreVerticalIcon} size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-1">
            {allTags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
                className={`px-2 py-1 text-xs rounded transition-colors border ${selectedTags.includes(tag)
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                  }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded border border-red-200 dark:border-red-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedChat?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500' : ''
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar with Priority Indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <HugeiconsIcon icon={UserIcon} size={24} className="text-white" />
                  </div>
                  {/* Priority Dot */}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded border-2 border-white dark:border-gray-900 ${getPriorityColor(chat.priority)}`} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {chat.customerName || chat.customerPhone}
                      </h3>
                      {/* Status Badge */}
                      <span className={`text-xs px-2 py-0.5 rounded font-medium border ${getStatusColor(chat.status)}`}>
                        {chat.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {chat.hasActiveWorkOrder && (
                        <HugeiconsIcon icon={Wrench01Icon} size={16} className="text-orange-500" title="Active Work Order" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">{chat.lastMessage}</p>

                  {/* Bottom Row - Tags and Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* License Plate */}
                      {chat.licensePlate && (
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-700 flex items-center gap-1">
                          <HugeiconsIcon icon={Motorbike01Icon} size={12} />
                          {chat.licensePlate}
                        </span>
                      )}

                      {/* Tags */}
                      {chat.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                          {tag}
                        </span>
                      ))}

                      {/* Phone (smaller) */}
                      <span className="text-xs text-gray-400 hidden sm:inline">{chat.customerPhone}</span>
                    </div>

                    {/* Unread Count */}
                    {chat.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded px-2 py-1 min-w-[20px] text-center border border-green-600">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* No Results */}
          {filteredChats.length === 0 && (
            <div className="p-8 text-center">
              <HugeiconsIcon icon={Search01Icon} size={48} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No chats found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${isMobileView ? 'w-full' : 'flex-1'} ${isMobileView && !selectedChat ? 'hidden' : 'flex'} flex-col`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  {isMobileView && (
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  )}

                  {/* Avatar with Priority */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <HugeiconsIcon icon={UserIcon} size={20} className="text-white" />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded border-2 border-white dark:border-gray-900 ${getPriorityColor(selectedChat.priority)}`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedChat.customerName || selectedChat.customerPhone}
                      </h2>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium border ${getStatusColor(selectedChat.status)}`}>
                        {selectedChat.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedChat.customerPhone}</p>
                      {selectedChat.licensePlate && (
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-800">
                          {selectedChat.licensePlate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Customer Details Toggle for Mobile */}
                  {isMobileView && (
                    <button
                      onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
                    >
                      <HugeiconsIcon icon={InformationCircleIcon} size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  )}

                  <button
                    onClick={() => setIsCreateWorkOrderOpen(true)}
                    className={`${isMobileView ? 'px-3 py-2' : 'px-4 py-2'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2`}
                  >
                    <HugeiconsIcon icon={Add01Icon} size={16} />
                    {!isMobileView && 'Create Work Order'}
                  </button>

                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <HugeiconsIcon icon={Call02Icon} size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>

                  {!isMobileView && (
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <HugeiconsIcon icon={MoreVerticalIcon} size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
              {selectedChat.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <HugeiconsIcon icon={MessageIcon} size={48} className="text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Start a conversation with this customer</p>
                  </div>
                </div>
              ) : (
                selectedChat.messages.map((message, index) => {
                  const showTimestamp = index === 0 ||
                    (selectedChat.messages[index - 1].timestamp.getTime() - message.timestamp.getTime()) > 5 * 60 * 1000;

                  return (
                    <div key={message.id}>
                      {showTimestamp && (
                        <div className="flex justify-center mb-4">
                          <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            {message.timestamp.toLocaleDateString() === new Date().toLocaleDateString()
                              ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : message.timestamp.toLocaleDateString()
                            }
                          </span>
                        </div>
                      )}
                      <div className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}>
                        <div className="flex items-end gap-2 max-w-xs lg:max-w-md ${
                          message.isFromCustomer ? 'flex-row' : 'flex-row-reverse'
                        }">
                          {message.isFromCustomer && (
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <HugeiconsIcon icon={UserIcon} size={16} className="text-white" />
                            </div>
                          )}
                          <div
                            className={`px-4 py-2 rounded-lg border ${message.isFromCustomer
                              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                              : 'bg-blue-600 text-white border-blue-600 rounded-br-md'
                              }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${message.isFromCustomer ? 'text-gray-400 dark:text-gray-500' : 'text-blue-100'
                              }`}>
                              <span className="text-xs">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!message.isFromCustomer && getStatusIcon(message.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Attach file">
                  <HugeiconsIcon icon={ClipboardIcon} size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Send image">
                  <HugeiconsIcon icon={FileIcon} size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    rows={1}
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Add emoji">
                    <HugeiconsIcon icon={StarIcon} size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                </button>
              </div>

              {/* Typing indicator */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 h-4">
                {/* This would show "Customer is typing..." in a real implementation */}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="text-center">
              <HugeiconsIcon icon={MessageIcon} size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a chat to start messaging</h3>
              <p className="text-gray-500 dark:text-gray-400">Choose a conversation from the sidebar to view messages</p>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Sidebar */}
      {selectedChat && showCustomerDetails && (
        <div className={`${isMobileView ? 'absolute inset-0 z-10' : 'w-80'} bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Customer Details</h3>
            {isMobileView && (
              <button
                onClick={() => setShowCustomerDetails(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Customer Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
                    <HugeiconsIcon icon={UserIcon} size={32} className="text-white" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded border-2 border-white dark:border-gray-900 ${getPriorityColor(selectedChat.priority)}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedChat.customerName || 'Unknown Customer'}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded font-medium border ${getStatusColor(selectedChat.status)}`}>
                      {selectedChat.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{selectedChat.customerPhone}</p>

                  {/* Customer Badges */}
                  <div className="flex flex-wrap gap-2">
                    {selectedChat.licensePlate && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded border border-primary-200 dark:border-primary-800">
                        <HugeiconsIcon icon={Motorbike01Icon} size={12} />
                        {selectedChat.licensePlate}
                      </span>
                    )}
                    {selectedChat.hasActiveWorkOrder && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded border border-orange-200 dark:border-orange-800">
                        <HugeiconsIcon icon={Wrench01Icon} size={12} />
                        Active WO
                      </span>
                    )}
                    {selectedChat.lastServiceDate && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                        Last service: {formatTime(selectedChat.lastServiceDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {customerDetails ? (
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contact Info</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{customerDetails.email || 'No email provided'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{customerDetails.address || 'No address provided'}</p>
                  </div>

                  {vehicleDetails && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle Details</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {vehicleDetails.make} {vehicleDetails.model}
                        {vehicleDetails.year && ` (${vehicleDetails.year})`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">VIN: {vehicleDetails.vin || 'Not provided'}</p>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Customer Since</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {customerDetails.created_at ? new Date(customerDetails.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Customer not in system</span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">
                    This phone number is not associated with any customer record.
                  </p>
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    Add to customer database →
                  </button>
                </div>
              )}
            </div>

            {/* Service Timeline */}
            {customerDetails && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <HugeiconsIcon icon={TimelineIcon} size={16} />
                  Service Timeline
                </h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Last Service Completed</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Brake adjustment and tune-up</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {selectedChat.lastServiceDate ? formatTime(selectedChat.lastServiceDate) : '30 days ago'}
                      </p>
                    </div>
                  </div>

                  {selectedChat.hasActiveWorkOrder && (
                    <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="w-2 h-2 bg-orange-500 rounded mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Work Order</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Chain replacement in progress</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Started 2 days ago</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-2 h-2 bg-blue-500 rounded mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">WhatsApp Contact</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">First message received</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {selectedChat.messages.length > 0
                          ? formatTime(selectedChat.messages[0].timestamp)
                          : 'Today'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Work Orders */}
            {/* Recent Work Orders */}
            {customerDetails && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Activity</h5>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">WO-123456</span>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">Completed</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Brake adjustment</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Work Order Form */}
      <CreateWorkOrderForm
        isOpen={isCreateWorkOrderOpen}
        onClose={handleWorkOrderFormClose}
        initialData={{
          customerId: selectedChat?.customerId || '',
          vehicleId: selectedChat?.vehicleId || '',
          contactPhone: selectedChat?.customerPhone || '',
          customerNotes: selectedChat ? `Issue reported via WhatsApp: ${selectedChat.lastMessage}` : '',
          licensePlate: selectedChat?.licensePlate || ''
        }}
      />
    </div>
  );
};

export default Chat;