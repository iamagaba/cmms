# Chat Integration Guide

## Overview
The Chat feature integrates WhatsApp Business API with the CMMS work order system, allowing customer support to create work orders directly from chat conversations.

## Features Implemented

### 1. Work Orders Tab
- **Details Tab**: Shows customer info and recent work orders (limited to 3)
- **Work Orders Tab**: Shows complete work order history for the customer
- **Files Tab**: Placeholder for future file sharing functionality

### 2. Create Work Order Integration
- Clicking "Create Work Order" opens the work order creation form
- Customer details are automatically pre-filled:
  - Customer ID
  - Vehicle ID
  - License Plate
  - Contact Phone
- User only needs to complete:
  - Customer location (address)
  - Diagnostic information
  - Service location
  - Priority and scheduling

### 3. Database Integration
The mock chat data is automatically linked to real database records:

**Mock Chat Data → Database Matching:**
- Customer matching: By phone number OR name
- Vehicle matching: By license plate

**Example Mock Data:**
```typescript
{
  customerPhone: '+256764326743',
  customerName: 'Joshua Mugume',
  licensePlate: 'UMA456GH'
}
```

This will automatically find and link to:
- Customer record with phone `+256764326743` or name `Joshua Mugume`
- Vehicle record with license plate `UMA456GH`

## Testing the Integration

### Prerequisites
Ensure your database has customers and vehicles that match the mock data:

**Required Customers:**
1. Name: "Joshua Mugume" OR Phone: "+256764326743"
2. Name: "Sarah Namukasa" OR Phone: "+256701234567"
3. Name: "David Okello" OR Phone: "+256772345678"
4. Name: "Peter Ssemakula" OR Phone: "+256753456789"

**Required Vehicles:**
1. License Plate: "UMA456GH"
2. License Plate: "UMA789JK"
3. License Plate: "UMA546HJ"
4. License Plate: "UMA321CD"

### Testing Steps

1. **Navigate to Chat Page**
   - Go to `/chat` in the application
   - You should see 4 mock chat conversations

2. **View Work Order History**
   - Click on a chat to select it
   - Click the "Work Orders" tab in the right panel
   - You should see all work orders for that customer

3. **Create Work Order**
   - Select a chat
   - Click "Create Work Order" button (green button at bottom)
   - Verify customer details are pre-filled:
     - Customer dropdown should show the customer name
     - Vehicle dropdown should show the license plate
     - Contact phone should be filled
   - Complete the remaining fields:
     - Enter customer location
     - Complete diagnostic flow
     - Select service location
     - Set priority
   - Submit the work order

4. **Verify Work Order Creation**
   - After submission, the new work order should appear in the "Work Orders" tab
   - Navigate to `/work-orders` to see it in the main work orders list

## Database Setup (If Needed)

If you don't have matching customers/vehicles in your database, you can create them:

### SQL to Create Test Customers
```sql
INSERT INTO customers (name, phone, customer_type) VALUES
('Joshua Mugume', '+256764326743', 'individual'),
('Sarah Namukasa', '+256701234567', 'individual'),
('David Okello', '+256772345678', 'individual'),
('Peter Ssemakula', '+256753456789', 'individual');
```

### SQL to Create Test Vehicles
```sql
-- First, get customer IDs
-- Then insert vehicles linked to those customers

INSERT INTO vehicles (license_plate, vin, make, model, year, customer_id) VALUES
('UMA456GH', 'VIN001', 'Yamaha', 'YBR 125', 2023, '<customer_id_1>'),
('UMA789JK', 'VIN002', 'Honda', 'CB 125', 2023, '<customer_id_2>'),
('UMA546HJ', 'VIN003', 'Bajaj', 'Boxer 150', 2022, '<customer_id_3>'),
('UMA321CD', 'VIN004', 'TVS', 'Apache 160', 2023, '<customer_id_4>');
```

## Code Structure

### Key Files
- `src/pages/Chat.tsx` - Main chat page with database integration
- `src/components/chat/ChatDetails.tsx` - Right panel with work order history
- `src/components/chat/ChatWindow.tsx` - Chat message display
- `src/components/chat/ChatList.tsx` - Left panel with chat list
- `src/components/chat/types.ts` - TypeScript interfaces
- `src/components/work-orders/CreateWorkOrderForm.tsx` - Work order creation form

### Data Flow
1. Mock chat data is defined in `Chat.tsx`
2. On component mount, customers and vehicles are fetched from database
3. Mock data is matched to real database records by phone/name/license plate
4. When "Create Work Order" is clicked, the form opens with pre-filled data
5. User completes remaining fields and submits
6. Work order is created in database and appears in work order history

## Future Enhancements

1. **Real WhatsApp Integration**
   - Replace mock data with actual WhatsApp Business API
   - Real-time message synchronization
   - Message status updates (sent, delivered, read)

2. **File Sharing**
   - Implement file upload/download in Files tab
   - Store attachments in Supabase Storage
   - Display images, PDFs, and documents

3. **Chat History Persistence**
   - Store chat messages in `chat_messages` table
   - Load historical conversations from database
   - Search through message history

4. **Notifications**
   - Push notifications for new messages
   - Desktop notifications
   - Unread message badges

5. **Advanced Features**
   - Quick replies and templates
   - Automated responses
   - Chat assignment to support agents
   - Chat analytics and metrics
