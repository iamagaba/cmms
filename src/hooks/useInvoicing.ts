import { useState, useEffect, useCallback } from 'react';
import { 
  Invoice, 
  InvoiceLineItem, 
  Payment,
  UseInvoicingReturn 
} from '@/types/cost';

// Mock data for EV motorbike maintenance and repair
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2024-001',
    work_order_id: 'WO-001',
    customer_id: 'customer-1',
    customer_name: 'SafeBoda Uganda',
    invoice_date: '2024-01-20',
    due_date: '2024-02-19',
    subtotal: 131250,
    tax_amount: 23625,
    discount_amount: 0,
    total_amount: 154875,
    paid_amount: 154875,
    balance_due: 0,
    status: 'paid',
    payment_terms: 'Net 30',
    notes: 'Emergency battery and brake repair service for EV motorbike',
    line_items: [
      {
        id: '1',
        invoice_id: '1',
        cost_entry_id: '1',
        description: 'Battery diagnostic and motor controller repair - 2.5 hours',
        quantity: 2.5,
        unit_price: 30000,
        total_price: 75000,
        tax_rate: 18,
        tax_amount: 13500
      },
      {
        id: '2',
        invoice_id: '1',
        cost_entry_id: '2',
        description: 'EV motorbike brake pads replacement',
        quantity: 1,
        unit_price: 56250,
        total_price: 56250,
        tax_rate: 18,
        tax_amount: 10125
      }
    ],
    payments: [
      {
        id: '1',
        invoice_id: '1',
        payment_date: '2024-02-15',
        amount: 154875,
        payment_method: 'bank_transfer',
        reference_number: 'TXN-20240215-001',
        notes: 'Payment received via mobile money transfer',
        created_by: 'user-1',
        created_at: '2024-02-15T10:30:00Z'
      }
    ],
    created_by: 'user-1',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-02-15T10:30:00Z'
  },
  {
    id: '2',
    invoice_number: 'INV-2024-002',
    work_order_id: 'WO-002',
    customer_id: 'customer-2',
    customer_name: 'Bolt Food Uganda',
    invoice_date: '2024-01-25',
    due_date: '2024-02-24',
    subtotal: 1200000,
    tax_amount: 216000,
    discount_amount: 60000,
    total_amount: 1356000,
    paid_amount: 0,
    balance_due: 1356000,
    status: 'sent',
    payment_terms: 'Net 30',
    notes: 'Battery replacement and routine maintenance service',
    line_items: [
      {
        id: '3',
        invoice_id: '2',
        description: 'Battery system maintenance - 4 hours',
        quantity: 4,
        unit_price: 25000,
        total_price: 100000,
        tax_rate: 18,
        tax_amount: 18000
      },
      {
        id: '4',
        invoice_id: '2',
        description: 'Lithium battery pack replacement',
        quantity: 1,
        unit_price: 850000,
        total_price: 850000,
        tax_rate: 18,
        tax_amount: 153000
      },
      {
        id: '5',
        invoice_id: '2',
        description: 'Motor controller diagnostic and calibration',
        quantity: 1,
        unit_price: 250000,
        total_price: 250000,
        tax_rate: 18,
        tax_amount: 45000
      }
    ],
    payments: [],
    created_by: 'user-1',
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  }
];

export const useInvoicing = (): UseInvoicingReturn => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load invoices
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setInvoices(mockInvoices);
    } catch (err) {
      setError('Failed to load invoices');
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Create invoice from work order
  const createInvoice = useCallback(async (workOrderId: string): Promise<Invoice> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
      
      // Mock line items (would be generated from cost entries)
      const lineItems: InvoiceLineItem[] = [
        {
          id: `line-${Date.now()}-1`,
          invoice_id: '',
          description: 'Service work',
          quantity: 1,
          unit_price: 150,
          total_price: 150,
          tax_rate: 8,
          tax_amount: 12
        }
      ];
      
      const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
      const taxAmount = lineItems.reduce((sum, item) => sum + item.tax_amount, 0);
      
      const newInvoice: Invoice = {
        id: `invoice-${Date.now()}`,
        invoice_number: invoiceNumber,
        work_order_id: workOrderId,
        customer_id: 'customer-1',
        customer_name: 'Sample Customer',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal,
        tax_amount: taxAmount,
        discount_amount: 0,
        total_amount: subtotal + taxAmount,
        paid_amount: 0,
        balance_due: subtotal + taxAmount,
        status: 'draft',
        payment_terms: 'Net 30',
        line_items: lineItems.map(item => ({ ...item, invoice_id: `invoice-${Date.now()}` })),
        payments: [],
        created_by: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    } catch (err) {
      setError('Failed to create invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  // Update invoice
  const updateInvoice = useCallback(async (
    id: string, 
    updates: Partial<Invoice>
  ): Promise<Invoice> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setInvoices(prev => prev.map(invoice => {
        if (invoice.id === id) {
          const updatedInvoice = { 
            ...invoice, 
            ...updates, 
            updated_at: new Date().toISOString() 
          };
          
          // Recalculate totals if line items changed
          if (updates.line_items) {
            const subtotal = updatedInvoice.line_items.reduce((sum, item) => sum + item.total_price, 0);
            const taxAmount = updatedInvoice.line_items.reduce((sum, item) => sum + item.tax_amount, 0);
            updatedInvoice.subtotal = subtotal;
            updatedInvoice.tax_amount = taxAmount;
            updatedInvoice.total_amount = subtotal + taxAmount - updatedInvoice.discount_amount;
            updatedInvoice.balance_due = updatedInvoice.total_amount - updatedInvoice.paid_amount;
          }
          
          return updatedInvoice;
        }
        return invoice;
      }));
      
      const updatedInvoice = invoices.find(i => i.id === id);
      if (!updatedInvoice) throw new Error('Invoice not found');
      
      return { ...updatedInvoice, ...updates };
    } catch (err) {
      setError('Failed to update invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  // Send invoice
  const sendInvoice = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await updateInvoice(id, { status: 'sent' });
    } catch (err) {
      setError('Failed to send invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateInvoice]);

  // Record payment
  const recordPayment = useCallback(async (
    invoiceId: string, 
    payment: Omit<Payment, 'id' | 'created_at'>
  ): Promise<Payment> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newPayment: Payment = {
        ...payment,
        id: `payment-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      // Update invoice with new payment
      setInvoices(prev => prev.map(invoice => {
        if (invoice.id === invoiceId) {
          const updatedPayments = [...invoice.payments, newPayment];
          const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
          const balanceDue = invoice.total_amount - totalPaid;
          
          return {
            ...invoice,
            payments: updatedPayments,
            paid_amount: totalPaid,
            balance_due: balanceDue,
            status: balanceDue <= 0 ? 'paid' : invoice.status,
            updated_at: new Date().toISOString()
          };
        }
        return invoice;
      }));
      
      return newPayment;
    } catch (err) {
      setError('Failed to record payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate invoice from cost entries
  const generateInvoiceFromCosts = useCallback(async (
    workOrderId: string, 
    costEntryIds: string[]
  ): Promise<Invoice> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // This would fetch cost entries and convert them to line items
      // For now, using mock data
      return await createInvoice(workOrderId);
    } catch (err) {
      setError('Failed to generate invoice from costs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createInvoice]);

  // Preview invoice
  const previewInvoice = useCallback(async (workOrderId: string): Promise<Invoice> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate preview without saving
      const preview: Invoice = {
        id: 'preview',
        invoice_number: 'PREVIEW',
        work_order_id: workOrderId,
        customer_id: 'customer-1',
        customer_name: 'Sample Customer',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal: 150,
        tax_amount: 12,
        discount_amount: 0,
        total_amount: 162,
        paid_amount: 0,
        balance_due: 162,
        status: 'draft',
        payment_terms: 'Net 30',
        line_items: [
          {
            id: 'preview-1',
            invoice_id: 'preview',
            description: 'Service work',
            quantity: 1,
            unit_price: 150,
            total_price: 150,
            tax_rate: 8,
            tax_amount: 12
          }
        ],
        payments: [],
        created_by: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return preview;
    } catch (err) {
      setError('Failed to preview invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get invoice aging report
  const getInvoiceAging = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const now = new Date();
      const aging = {
        current: 0,
        days_1_30: 0,
        days_31_60: 0,
        days_61_90: 0,
        over_90: 0,
        total_outstanding: 0
      };
      
      invoices.forEach(invoice => {
        if (invoice.balance_due > 0) {
          const dueDate = new Date(invoice.due_date);
          const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysPastDue <= 0) {
            aging.current += invoice.balance_due;
          } else if (daysPastDue <= 30) {
            aging.days_1_30 += invoice.balance_due;
          } else if (daysPastDue <= 60) {
            aging.days_31_60 += invoice.balance_due;
          } else if (daysPastDue <= 90) {
            aging.days_61_90 += invoice.balance_due;
          } else {
            aging.over_90 += invoice.balance_due;
          }
          
          aging.total_outstanding += invoice.balance_due;
        }
      });
      
      return aging;
    } catch (err) {
      setError('Failed to get invoice aging');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  // Get payment history
  const getPaymentHistory = useCallback(async (customerId?: string): Promise<Payment[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredInvoices = invoices;
      if (customerId) {
        filteredInvoices = invoices.filter(invoice => invoice.customer_id === customerId);
      }
      
      const payments = filteredInvoices.flatMap(invoice => invoice.payments);
      return payments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
    } catch (err) {
      setError('Failed to get payment history');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    sendInvoice,
    recordPayment,
    generateInvoiceFromCosts,
    previewInvoice,
    getInvoiceAging,
    getPaymentHistory
  };
};