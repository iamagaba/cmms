
export interface WhatsAppMessage {
    id: string;
    content: string;
    timestamp: Date;
    isFromCustomer: boolean;
    status: 'sent' | 'delivered' | 'read' | 'system';
    messageType: 'text' | 'image' | 'document' | 'location' | 'system';
    mediaUrl?: string;
    fileName?: string;
}

export interface WhatsAppChat {
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
    activeWorkOrderId?: string;
    customerSince?: Date;
    location?: string;
    whatsappVerified?: boolean;
}
