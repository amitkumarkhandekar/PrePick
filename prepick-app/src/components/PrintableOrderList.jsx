import React, { useState } from 'react';
import '../styles/Cart.css';

const PrintableOrderList = ({ order, shop, customer, userType }) => {
  const [fetchedItems, setFetchedItems] = useState({});

  const handleCheckboxChange = (itemId) => {
    setFetchedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const printOrderList = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order List</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 210mm;
              margin: 0 auto;
              padding: 10mm;
              color: #000;
              background-color: #fff;
              font-size: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 5mm;
              margin-bottom: 5mm;
            }
            .header h1 {
              font-size: 18px;
              margin: 0;
            }
            .section {
              margin-bottom: 5mm;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 2mm;
              border-bottom: 1px solid #ccc;
              padding-bottom: 1mm;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2mm;
              margin-bottom: 3mm;
            }
            .info-item {
              margin-bottom: 1mm;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              margin-right: 2mm;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 3mm 0;
              font-size: 11px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #000;
              padding: 1mm;
              text-align: left;
            }
            .items-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .checkbox-cell {
              text-align: center;
              width: 15px;
            }
            .checkbox-cell input {
              width: 12px;
              height: 12px;
            }
            .total-section {
              margin-top: 5mm;
              padding-top: 3mm;
              border-top: 1px solid #000;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-bottom: 1mm;
            }
            .footer {
              text-align: center;
              margin-top: 10mm;
              font-size: 10px;
            }
            @media print {
              body {
                padding: 5mm;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PrePick Order List</h1>
            <p>Order ID: ${order.id || 'N/A'}</p>
          </div>
          
          <div class="section">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Date:</span>
                <span>${new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
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
                ${(order.items || []).map(item => `
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
          
          <div class="section total-section">
            <div class="total-row">
              <span>Total:</span>
              <span>₹${order.totalAmount || 0}</span>
            </div>
            <div class="total-row">
              <span>Paid:</span>
              <span>₹${order.partialPayment || 0}</span>
            </div>
            <div class="total-row">
              <span>To Pay:</span>
              <span>₹${(order.totalAmount - order.partialPayment) || 0}</span>
            </div>
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