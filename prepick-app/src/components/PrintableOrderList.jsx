import { useEffect } from 'react';

const PrintableOrderList = ({ order, shop, customer, userType = 'customer' }) => {
  const printOrderList = () => {
    const printWindow = window.open('', '_blank');
    
    // Separate regular items and custom items
    const regularItems = (order.items || []).filter(item => !item.isCustom);
    const customItems = (order.items || []).filter(item => item.isCustom);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order List - ${order.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10mm;
              font-size: 12px;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              
              body {
                margin: 0;
                padding: 10mm;
              }
            }
            
            .header {
              text-align: center;
              margin-bottom: 5mm;
              border-bottom: 2px solid #333;
              padding-bottom: 3mm;
            }
            
            .shop-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 2mm;
            }
            
            .section {
              margin: 8mm 0;
            }
            
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 3mm;
              padding-bottom: 1mm;
              border-bottom: 1px solid #666;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2mm;
              margin-bottom: 5mm;
            }
            
            .info-item {
              display: flex;
              margin-bottom: 1mm;
            }
            
            .info-label {
              font-weight: bold;
              min-width: 25mm;
              margin-right: 2mm;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 5mm;
            }
            
            .items-table th {
              background: #f0f0f0;
              border: 1px solid #333;
              padding: 2mm;
              text-align: left;
              font-size: 11px;
            }
            
            .items-table td {
              border: 1px solid #333;
              padding: 1.5mm;
              font-size: 11px;
            }
            
            .checkbox-cell {
              width: 8mm;
              text-align: center;
            }
            
            .checkbox-cell input {
              width: 5mm;
              height: 5mm;
            }
            
            .total-section {
              margin-top: 5mm;
              padding-top: 3mm;
              border-top: 1px solid #666;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2mm;
              font-weight: bold;
            }
            
            .footer {
              margin-top: 10mm;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 3mm;
            }
            
            .signature-line {
              margin-top: 10mm;
              display: flex;
              justify-content: space-between;
            }
            
            .signature-box {
              width: 60mm;
              border-top: 1px solid #333;
              text-align: center;
              padding-top: 2mm;
              margin-top: 15mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="shop-name">${shop?.name || 'Shop Name'}</div>
            <div>Order List - ${order.id || 'N/A'}</div>
            <div>${new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
          
          <div class="section">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Time:</span>
                <span>${new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              ${userType === 'shop' ? `
              <div class="info-item">
                <span class="info-label">Customer:</span>
                <span>${customer?.name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone:</span>
                <span>${customer?.phone || order?.customerPhone || 'N/A'}</span>
              </div>
              ` : `
              <div class="info-item">
                <span class="info-label">Shop:</span>
                <span>${shop?.name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone:</span>
                <span>${shop?.phone || 'N/A'}</span>
              </div>
              `}
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span>${order.orderStatus || 'Pending'}</span>
              </div>
            </div>
          </div>
          
          <!-- Regular Items Section -->
          ${regularItems.length > 0 ? `
          <div class="section">
            <div class="section-title">Items to Collect</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th class="checkbox-cell">✓</th>
                </tr>
              </thead>
              <tbody>
                ${regularItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.quantity}</td>
                    <td class="checkbox-cell">
                      <input type="checkbox">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <!-- Custom Items Section -->
          ${customItems.length > 0 ? `
          <div class="section">
            <div class="section-title">Custom Requests (Price to be added by shop)</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th class="checkbox-cell">✓</th>
                </tr>
              </thead>
              <tbody>
                ${customItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹______</td>
                    <td>₹______</td>
                    <td class="checkbox-cell">
                      <input type="checkbox">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <div class="section total-section">
            <div class="total-row">
              <span>Regular Items Total:</span>
              <span>₹${order.totalAmount || 0}</span>
            </div>
            <div class="total-row">
              <span>Paid (50% of regular items):</span>
              <span>₹${order.partialPayment || 0}</span>
            </div>
            <div class="total-row">
              <span>To Pay (Regular Items):</span>
              <span>₹${(order.totalAmount - order.partialPayment) || 0}</span>
            </div>
            ${customItems.length > 0 ? `
            <div class="total-row">
              <span>Custom Items Total:</span>
              <span>₹______</span>
            </div>
            <div class="total-row" style="font-size: 14px; margin-top: 3mm; padding-top: 2mm; border-top: 1px solid #333;">
              <span><strong>Grand Total:</strong></span>
              <span><strong>₹______</strong></span>
            </div>
            ` : ''}
          </div>
          
          <div class="signature-line">
            <div class="signature-box">Customer Signature</div>
            <div class="signature-box">Shop Owner Signature</div>
          </div>
          
          <div class="footer">
            <p>PrePick - Simplified Shopping | Order ID: ${order.id || 'N/A'}</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 10mm;">
            <button onclick="window.print()" style="padding: 3mm 6mm; background-color: #000; color: white; border: none; border-radius: 2mm; cursor: pointer; font-size: 12px; margin: 0 2mm;">🖨️ Print</button>
            <button onclick="window.close()" style="padding: 3mm 6mm; background-color: #666; color: white; border: none; border-radius: 2mm; cursor: pointer; font-size: 12px; margin: 0 2mm;">❌ Close</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div>
      <button 
        onClick={printOrderList} 
        className="print-receipt-btn" 
        style={{ 
          padding: '8px 12px', 
          backgroundColor: '#10b981', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          marginTop: '10px',
          fontWeight: '500',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        🖨️ Print List
      </button>
    </div>
  );
};

export default PrintableOrderList;