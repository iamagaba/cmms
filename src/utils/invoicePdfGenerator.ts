import { Invoice } from '@/types/cost';
import dayjs from 'dayjs';

// PDF generation utility for invoices
export const generateInvoicePDF = async (invoice: Invoice, companyInfo?: any): Promise<void> => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Unable to open print window. Please check your popup blocker settings.');
  }

  const company = companyInfo || {
    name: 'EV Motorbike Repair Center',
    address: 'Kampala Central, Uganda',
    phone: '+256-700-000000',
    email: 'info@evrepair.ug',
    tin: 'TIN-1234567890',
    logo: '' // Optional logo URL
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #333;
          line-height: 1.6;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #1890ff;
        }
        
        .company-info {
          flex: 1;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1890ff;
          margin-bottom: 8px;
        }
        
        .company-details {
          font-size: 12px;
          color: #666;
          line-height: 1.8;
        }
        
        .invoice-title {
          text-align: right;
        }
        
        .invoice-number {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        
        .invoice-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-paid {
          background: #f6ffed;
          color: #52c41a;
          border: 1px solid #b7eb8f;
        }
        
        .status-sent {
          background: #e6f7ff;
          color: #1890ff;
          border: 1px solid #91d5ff;
        }
        
        .status-overdue {
          background: #fff1f0;
          color: #f5222d;
          border: 1px solid #ffa39e;
        }
        
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        
        .detail-section {
          flex: 1;
        }
        
        .detail-section h3 {
          font-size: 14px;
          font-weight: bold;
          color: #1890ff;
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        
        .detail-section p {
          font-size: 13px;
          margin-bottom: 4px;
        }
        
        .detail-label {
          color: #666;
          display: inline-block;
          width: 100px;
        }
        
        .detail-value {
          color: #333;
          font-weight: 500;
        }
        
        .line-items {
          margin-bottom: 30px;
        }
        
        .line-items table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .line-items th {
          background: #f5f5f5;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: bold;
          color: #333;
          text-transform: uppercase;
          border-bottom: 2px solid #d9d9d9;
        }
        
        .line-items th.text-right {
          text-align: right;
        }
        
        .line-items td {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
        }
        
        .line-items td.text-right {
          text-align: right;
        }
        
        .line-items tr:hover {
          background: #fafafa;
        }
        
        .totals-section {
          margin-left: auto;
          width: 300px;
          margin-top: 20px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        
        .totals-row.subtotal {
          border-top: 1px solid #f0f0f0;
          padding-top: 12px;
        }
        
        .totals-row.total {
          border-top: 2px solid #333;
          padding-top: 12px;
          margin-top: 8px;
          font-size: 18px;
          font-weight: bold;
        }
        
        .totals-row.balance-due {
          background: #fff1f0;
          padding: 12px;
          margin-top: 8px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: bold;
          color: #f5222d;
        }
        
        .payment-info {
          margin-top: 40px;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        .payment-info h3 {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #333;
        }
        
        .payment-methods {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          font-size: 12px;
        }
        
        .payment-method {
          padding: 12px;
          background: white;
          border-radius: 4px;
          border: 1px solid #d9d9d9;
        }
        
        .payment-method strong {
          display: block;
          margin-bottom: 4px;
          color: #1890ff;
        }
        
        .notes-section {
          margin-top: 30px;
          padding: 16px;
          background: #fffbe6;
          border-left: 4px solid #faad14;
          border-radius: 4px;
        }
        
        .notes-section h4 {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #333;
        }
        
        .notes-section p {
          font-size: 12px;
          color: #666;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #d9d9d9;
          text-align: center;
          font-size: 11px;
          color: #999;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .no-print {
            display: none;
          }
        }
        
        @page {
          margin: 20mm;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
          <div class="company-info">
            <div class="company-name">${company.name}</div>
            <div class="company-details">
              ${company.address}<br>
              Phone: ${company.phone}<br>
              Email: ${company.email}<br>
              TIN: ${company.tin}
            </div>
          </div>
          <div class="invoice-title">
            <div class="invoice-number">INVOICE</div>
            <div style="font-size: 18px; color: #666; margin-bottom: 8px;">#${invoice.invoice_number}</div>
            <div class="invoice-status status-${invoice.status}">
              ${invoice.status.toUpperCase()}
            </div>
          </div>
        </div>
        
        <!-- Invoice Details -->
        <div class="invoice-details">
          <div class="detail-section">
            <h3>Bill To</h3>
            <p><strong style="font-size: 15px;">${invoice.customer_name}</strong></p>
            <p style="color: #666; font-size: 12px;">Customer ID: ${invoice.customer_id}</p>
          </div>
          <div class="detail-section" style="text-align: right;">
            <h3>Invoice Details</h3>
            <p><span class="detail-label">Invoice Date:</span> <span class="detail-value">${dayjs(invoice.invoice_date).format('MMM DD, YYYY')}</span></p>
            <p><span class="detail-label">Due Date:</span> <span class="detail-value">${dayjs(invoice.due_date).format('MMM DD, YYYY')}</span></p>
            <p><span class="detail-label">Payment Terms:</span> <span class="detail-value">${invoice.payment_terms}</span></p>
            <p><span class="detail-label">Work Order:</span> <span class="detail-value">${invoice.work_order_id}</span></p>
          </div>
        </div>
        
        <!-- Line Items -->
        <div class="line-items">
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th class="text-right" style="width: 10%;">Qty</th>
                <th class="text-right" style="width: 15%;">Unit Price</th>
                <th class="text-right" style="width: 10%;">Tax</th>
                <th class="text-right" style="width: 15%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.line_items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">UGX ${item.unit_price.toLocaleString('en-US')}</td>
                  <td class="text-right">${item.tax_rate}%</td>
                  <td class="text-right">UGX ${item.total_price.toLocaleString('en-US')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="totals-row subtotal">
            <span>Subtotal:</span>
            <span>UGX ${invoice.subtotal.toLocaleString('en-US')}</span>
          </div>
          <div class="totals-row">
            <span>Tax (18%):</span>
            <span>UGX ${invoice.tax_amount.toLocaleString('en-US')}</span>
          </div>
          ${invoice.discount_amount > 0 ? `
          <div class="totals-row">
            <span>Discount:</span>
            <span>-UGX ${invoice.discount_amount.toLocaleString('en-US')}</span>
          </div>
          ` : ''}
          <div class="totals-row total">
            <span>Total Amount:</span>
            <span>UGX ${invoice.total_amount.toLocaleString('en-US')}</span>
          </div>
          ${invoice.paid_amount > 0 ? `
          <div class="totals-row">
            <span>Paid:</span>
            <span style="color: #52c41a;">UGX ${invoice.paid_amount.toLocaleString('en-US')}</span>
          </div>
          ` : ''}
          ${invoice.balance_due > 0 ? `
          <div class="totals-row balance-due">
            <span>Balance Due:</span>
            <span>UGX ${invoice.balance_due.toLocaleString('en-US')}</span>
          </div>
          ` : ''}
        </div>
        
        <!-- Payment Information -->
        <div class="payment-info">
          <h3>Payment Information</h3>
          <div class="payment-methods">
            <div class="payment-method">
              <strong>Bank Transfer</strong>
              Bank: Stanbic Bank Uganda<br>
              Account: 9030012345678<br>
              Account Name: ${company.name}
            </div>
            <div class="payment-method">
              <strong>Mobile Money</strong>
              MTN: +256-700-000000<br>
              Airtel: +256-750-000000<br>
              Name: ${company.name}
            </div>
          </div>
        </div>
        
        ${invoice.notes ? `
        <div class="notes-section">
          <h4>Notes</h4>
          <p>${invoice.notes}</p>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="margin-top: 8px;">This is a computer-generated invoice. For any queries, please contact us at ${company.email}</p>
        </div>
        
        <!-- Print Button -->
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button 
            onclick="window.print(); return false;" 
            style="
              background: #1890ff;
              color: white;
              border: none;
              padding: 12px 32px;
              font-size: 14px;
              font-weight: bold;
              border-radius: 6px;
              cursor: pointer;
              margin-right: 12px;
            "
          >
            Print Invoice
          </button>
          <button 
            onclick="window.close(); return false;" 
            style="
              background: #f5f5f5;
              color: #333;
              border: 1px solid #d9d9d9;
              padding: 12px 32px;
              font-size: 14px;
              font-weight: bold;
              border-radius: 6px;
              cursor: pointer;
            "
          >
            Close
          </button>
        </div>
      </div>
      
      <script>
        // Auto-print option (commented out by default)
        // window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

// Download invoice as PDF (using browser print to PDF)
export const downloadInvoicePDF = async (invoice: Invoice, companyInfo?: any): Promise<void> => {
  await generateInvoicePDF(invoice, companyInfo);
  // Note: User will need to use browser's "Save as PDF" option in the print dialog
};

// Generate and download invoice as HTML file
export const downloadInvoiceHTML = (invoice: Invoice, companyInfo?: any): void => {
  const htmlContent = generateInvoiceHTML(invoice, companyInfo);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoice.invoice_number}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Send invoice via email (opens email client)
export const emailInvoice = (invoice: Invoice, companyInfo?: any): void => {
  const company = companyInfo || {
    name: 'EV Motorbike Repair Center',
    email: 'info@evrepair.ug'
  };
  
  const subject = encodeURIComponent(`Invoice ${invoice.invoice_number} from ${company.name}`);
  const body = encodeURIComponent(
    `Dear ${invoice.customer_name},\n\n` +
    `Please find attached your invoice #${invoice.invoice_number}.\n\n` +
    `Invoice Date: ${dayjs(invoice.invoice_date).format('MMM DD, YYYY')}\n` +
    `Due Date: ${dayjs(invoice.due_date).format('MMM DD, YYYY')}\n` +
    `Total Amount: UGX ${invoice.total_amount.toLocaleString('en-US')}\n` +
    `Balance Due: UGX ${invoice.balance_due.toLocaleString('en-US')}\n\n` +
    `Thank you for your business!\n\n` +
    `Best regards,\n${company.name}`
  );
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

// Generate invoice preview HTML (for email or display)
export const generateInvoiceHTML = (invoice: Invoice, companyInfo?: any): string => {
  const company = companyInfo || {
    name: 'EV Motorbike Repair Center',
    address: 'Kampala Central, Uganda',
    phone: '+256-700-000000',
    email: 'info@evrepair.ug',
    tin: 'TIN-1234567890'
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1890ff;">Invoice #${invoice.invoice_number}</h1>
      <p><strong>Customer:</strong> ${invoice.customer_name}</p>
      <p><strong>Date:</strong> ${dayjs(invoice.invoice_date).format('MMM DD, YYYY')}</p>
      <p><strong>Due Date:</strong> ${dayjs(invoice.due_date).format('MMM DD, YYYY')}</p>
      <hr style="margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Description</th>
            <th style="padding: 10px; text-align: right;">Qty</th>
            <th style="padding: 10px; text-align: right;">Unit Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.line_items.map(item => `
            <tr>
              <td style="padding: 10px;">${item.description}</td>
              <td style="padding: 10px; text-align: right;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right;">UGX ${item.unit_price.toLocaleString('en-US')}</td>
              <td style="padding: 10px; text-align: right;">UGX ${item.total_price.toLocaleString('en-US')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top: 20px; text-align: right;">
        <p><strong>Subtotal:</strong> UGX ${invoice.subtotal.toLocaleString('en-US')}</p>
        <p><strong>Tax:</strong> UGX ${invoice.tax_amount.toLocaleString('en-US')}</p>
        <p style="font-size: 18px; color: #1890ff;"><strong>Total:</strong> UGX ${invoice.total_amount.toLocaleString('en-US')}</p>
        ${invoice.balance_due > 0 ? `
        <p style="font-size: 16px; color: #f5222d;"><strong>Balance Due:</strong> UGX ${invoice.balance_due.toLocaleString('en-US')}</p>
        ` : ''}
      </div>
    </div>
  `;
};