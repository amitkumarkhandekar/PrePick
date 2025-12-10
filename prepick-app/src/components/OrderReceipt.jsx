import React from 'react';
import '../styles/Cart.css';

const OrderReceipt = ({ order, shop, customer }) => {
  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .receipt-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .receipt-subtitle {
              font-size: 16px;
              color: #666;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .items-table td {
              text-align: left;
            }
            .text-right {
              text-align: right;
            }
            .total-section {
              margin-top: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .highlight {
              background-color: #f0f0f0;
              padding: 10px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ccc;
              font-size: 14px;
              color: #666;
            }
            @media print {
              body {
                padding: 10px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h1 class="receipt-title">PrePick Order Receipt</h1>
            <p class="receipt-subtitle">Order Confirmation Details</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">Order Information</h2>
            <div class="info-row">
              <span class="info-label">Order ID:</span>
              <span>${order.id || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Order Date:</span>
              <span>${new Date(order.createdAt).toLocaleDateString()} at ${new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Order Status:</span>
              <span>${order.orderStatus || 'Pending'}</span>
            </div>
            ${order.readyBy ? `<div class="info-row">
              <span class="info-label">Ready By:</span>
              <span>${order.readyBy}</span>
            </div>` : ''}
          </div>
          
          <div class="section">
            <h2 class="section-title">Customer Details</h2>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span>${customer?.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${customer?.email || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Customer ID:</span>
              <span>${customer?.uid || 'N/A'}</span>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Shop Details</h2>
            <div class="info-row">
              <span class="info-label">Shop Name:</span>
              <span>${shop?.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Category:</span>
              <span>${shop?.category || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span>${shop?.phone || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span>${shop?.address || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">GPay Number:</span>
              <span>${shop?.gpayNumber || 'N/A'}</span>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Order Items</h2>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${(order.items || []).map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section total-section">
            <div class="total-row">
              <span>Total Amount:</span>
              <span>₹${order.totalAmount || 0}</span>
            </div>
            <div class="total-row">
              <span>Paid (50%):</span>
              <span>₹${order.partialPayment || 0}</span>
            </div>
            <div class="total-row">
              <span>Remaining Balance:</span>
              <span>₹${(order.totalAmount - order.partialPayment) || 0}</span>
            </div>
          </div>
          
          <div class="section highlight">
            <h2 class="section-title">Payment Instructions</h2>
            <p>Please pay ₹${order.partialPayment || 0} via Google Pay to: ${shop?.gpayNumber || 'N/A'}</p>
            <p>The shop will confirm your order once payment is received.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for using PrePick! | Order ID: ${order.id || 'N/A'}</p>
            <p>This is a computer-generated receipt. No signature required.</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Receipt</button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div>
      <button onClick={printReceipt} className="print-receipt-btn" style={{ 
        padding: '10px 20px', 
        backgroundColor: '#007bff', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer',
        marginTop: '15px'
      }}>
        Print Receipt
      </button>
    </div>
  );
};

export default OrderReceipt;