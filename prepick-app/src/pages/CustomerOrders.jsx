import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import OrderReceipt from '../components/OrderReceipt';
import PrintableOrderList from '../components/PrintableOrderList';
import '../styles/CustomerOrders.css';

const CustomerOrders = () => {
  const { currentUser, shops } = useApp();
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch customer orders with real-time listener (no notifications here, handled in AppContext)
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    
    // Set up real-time listener
    const ordersRef = ref(database, 'orders');
    const ordersQuery = query(ordersRef, orderByChild('customerId'), equalTo(currentUser.uid));
    
    const unsubscribe = onValue(ordersQuery, (snapshot) => {
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersArray = Object.values(ordersData);
        console.log('Customer orders updated:', ordersArray);
        setUserOrders(ordersArray);
      } else {
        setUserOrders([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser]);
  
  const sortedOrders = [...userOrders].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'ready': return 'status-ready';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Confirmation';
      case 'confirmed': return 'Confirmed';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading orders...
      </div>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className="no-orders">
        <h2>No Orders Yet</h2>
        <p>Start shopping to place your first order!</p>
        <button onClick={() => navigate('/customer/shops')} className="browse-btn">
          Browse Shops
        </button>
      </div>
    );
  }

  return (
    <div className="customer-orders">
      <h2>My Orders</h2>
      <p className="subtitle">Track your order history and status</p>

      <div className="orders-list">
        {sortedOrders.map(order => {
          const shop = shops.find(s => s.id === order.shopId);
          
          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>{shop?.name}</h3>
                  <p className="order-date">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                  {getStatusText(order.orderStatus)}
                </span>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} × {item.quantity} - ₹{item.price * item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="summary-row">
                  <span>Paid (50%):</span>
                  <span className="paid-amount">₹{order.partialPayment}</span>
                </div>
                <div className="summary-row">
                  <span>Remaining:</span>
                  <span>₹{order.totalAmount - order.partialPayment}</span>
                </div>
                {order.readyBy && (
                  <div className="ready-by">
                    <strong>Ready By:</strong> {order.readyBy}
                  </div>
                )}
              </div>

              {order.orderStatus === 'ready' && (
                <div className="pickup-alert">
                  🎉 Your order is ready for pickup!
                </div>
              )}

              <div className="order-actions">
                <button className="call-shop-btn" onClick={() => window.open(`tel:${shop.phone}`)}>
                  📞 Call Shop
                </button>
                <PrintableOrderList 
                  order={order} 
                  shop={shop} 
                  customer={currentUser}
                  userType="customer"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerOrders;