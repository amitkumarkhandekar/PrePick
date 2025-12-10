import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getShopsByOwner, getProductsByShop, updateProduct, deleteProduct, getOrdersByShop, updateOrder as updateOrderInDB, listenToOrders } from '../services/databaseService';
import ProductManagement from '../components/ProductManagement';
import PrintableOrderList from '../components/PrintableOrderList';
import '../styles/ShopDashboard.css';

const ShopDashboard = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [userShop, setUserShop] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Fetch shop data for current user
  useEffect(() => {
    const fetchShop = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const shops = await getShopsByOwner(currentUser.uid);
        if (shops && shops.length > 0) {
          setUserShop(shops[0]); // Use first shop
        } else {
          // Check if user already has shop information in their profile
          // If they do, we can create the shop record automatically
          if (currentUser.shopName && currentUser.shopGpayNumber && currentUser.shopAddress) {
            try {
              // Create shop from user profile data
              const shopId = await createShop({
                name: currentUser.shopName,
                category: currentUser.shopCategory || 'General Store',
                phone: currentUser.shopPhone || currentUser.phone || '',
                gpayNumber: currentUser.shopGpayNumber,
                address: currentUser.shopAddress,
                openingHours: currentUser.shopOpeningHours || '9:00 AM - 9:00 PM',
                ownerId: currentUser.uid,
                ownerName: currentUser.name,
                ownerEmail: currentUser.email,
                verified: false
              });
              
              // Fetch the newly created shop
              const newShops = await getShopsByOwner(currentUser.uid);
              if (newShops && newShops.length > 0) {
                setUserShop(newShops[0]);
              } else {
                // If shop creation somehow failed, redirect to setup
                navigate('/shop/setup');
              }
            } catch (creationError) {
              console.error('Error creating shop from profile data:', creationError);
              // Redirect to manual setup if automatic creation fails
              navigate('/shop/setup');
            }
          } else {
            // No shop found and no profile data, redirect to setup
            navigate('/shop/setup');
          }
        }
      } catch (error) {
        console.error('Error fetching shop:', error);
        // In case of error, still try to redirect to setup
        navigate('/shop/setup');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShop();
  }, [currentUser, navigate]);

  // Fetch products when shop is loaded or catalog tab is active
  useEffect(() => {
    const fetchProducts = async () => {
      if (!userShop?.id || activeTab !== 'catalog') return;
      
      setProductsLoading(true);
      try {
        const products = await getProductsByShop(userShop.id);
        console.log('Products fetched:', products);
        setShopProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };
    
    fetchProducts();
  }, [userShop, activeTab]);

  // Fetch orders when shop is loaded or orders tab is active
  useEffect(() => {
    if (!userShop?.id || (activeTab !== 'orders' && activeTab !== 'history')) return;
    
    setOrdersLoading(true);
    
    // Set up real-time listener for orders
    const unsubscribe = listenToOrders(userShop.id, (orders) => {
      console.log('Orders updated in real-time:', orders);
      
      // Check for new orders and show notification
      if (shopOrders.length > 0 && orders.length > shopOrders.length) {
        const newOrder = orders[orders.length - 1];
        if (window.showNotification) {
          window.showNotification({
            type: 'order',
            title: 'New Order Received! 🛍️',
            message: `Order #${newOrder.id.substring(0, 8)} - ₹${newOrder.totalAmount} from ${newOrder.customerName || 'Customer'}`
          });
        }
      }
      
      setShopOrders(orders);
      setOrdersLoading(false);
    });

    return () => unsubscribe();
  }, [userShop, activeTab]);
  
  const pendingOrders = shopOrders.filter(o => o.orderStatus === 'pending');
  const activeOrders = shopOrders.filter(o => ['confirmed', 'ready'].includes(o.orderStatus));
  const completedOrders = shopOrders.filter(o => o.orderStatus === 'completed');

  const handleConfirmOrder = async (orderId) => {
    const readyBy = prompt('Enter ready by time (e.g., 2:30 PM):');
    if (readyBy) {
      try {
        await updateOrderInDB(orderId, {
          orderStatus: 'confirmed',
          readyBy: readyBy,
        });
        // Refresh orders
        const orders = await getOrdersByShop(userShop.id);
        setShopOrders(orders);
        alert('Order confirmed! Customer will be notified.');
      } catch (error) {
        console.error('Error confirming order:', error);
        alert('Failed to confirm order');
      }
    }
  };

  const handleMarkReady = async (orderId) => {
    if (confirm('Mark this order as ready for pickup?')) {
      try {
        await updateOrderInDB(orderId, {
          orderStatus: 'ready',
        });
        // Refresh orders
        const orders = await getOrdersByShop(userShop.id);
        setShopOrders(orders);
        alert('Order marked as ready! Customer will receive a notification.');
      } catch (error) {
        console.error('Error marking order ready:', error);
        alert('Failed to mark order ready');
      }
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (confirm('Mark this order as completed?')) {
      try {
        await updateOrderInDB(orderId, {
          orderStatus: 'completed',
          completedAt: new Date().toISOString(),
        });
        // Refresh orders
        const orders = await getOrdersByShop(userShop.id);
        setShopOrders(orders);
        alert('Order completed successfully!');
      } catch (error) {
        console.error('Error completing order:', error);
        alert('Failed to complete order');
      }
    }
  };

  const handleToggleStock = async (productId, currentStatus) => {
    try {
      await updateProduct(userShop.id, productId, { inStock: !currentStatus });
      // Refresh products
      const products = await getProductsByShop(userShop.id);
      setShopProducts(products);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await deleteProduct(userShop.id, productId);
        // Refresh products
        const products = await getProductsByShop(userShop.id);
        setShopProducts(products);
        alert('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const refreshProducts = async () => {
    if (!userShop?.id) return;
    try {
      const products = await getProductsByShop(userShop.id);
      setShopProducts(products);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading shop data...
      </div>
    );
  }
  
  if (!userShop) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="shop-dashboard">
      <div className="dashboard-header">
        <h2>{userShop.name}</h2>
        <div className="shop-status">
          {userShop.verified ? (
            <span className="verified-badge">✓ Verified</span>
          ) : (
            <span className="pending-verification-badge">Pending Verification</span>
          )}
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({pendingOrders.length + activeOrders.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History ({completedOrders.length})
        </button>
        <button
          className={`tab ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          Manage Catalog
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h3>Pending Orders ({pendingOrders.length})</h3>
            {pendingOrders.length === 0 ? (
              <p className="no-data">No pending orders</p>
            ) : (
              <div className="orders-list">
                {pendingOrders.map(order => (
                  <div key={order.id} className="order-card pending">
                    <div className="order-header">
                      <div>
                        <h4>Order #{order.id}</h4>
                        <p className="order-time">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="status-badge status-pending">Pending</span>
                    </div>
                    <div className="order-items">
                      <ul>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="order-footer">
                      <div className="order-amount">
                        Total: ₹{order.totalAmount}
                      </div>
                      <div className="order-actions">
                        <PrintableOrderList 
                          order={order} 
                          shop={userShop} 
                          customer={{ 
                            name: order.customerName, 
                            email: order.customerEmail, 
                            uid: order.customerId,
                            phone: order.customerPhone
                          }}
                          userType="shop"
                        />
                        <button
                          className="btn-confirm"
                          onClick={() => handleConfirmOrder(order.id)}
                        >
                          Confirm Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ marginTop: '2rem' }}>Active Orders ({activeOrders.length})</h3>
            {activeOrders.length === 0 ? (
              <p className="no-data">No active orders</p>
            ) : (
              <div className="orders-list">
                {activeOrders.map(order => (
                  <div key={order.id} className="order-card active">
                    <div className="order-header">
                      <div>
                        <h4>Order #{order.id}</h4>
                        <p className="order-time">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        {order.readyBy && (
                          <p className="ready-by-time">Ready by: {order.readyBy}</p>
                        )}
                      </div>
                      <span className={`status-badge status-${order.orderStatus}`}>
                        {order.orderStatus === 'confirmed' ? 'Confirmed' : 'Ready'}
                      </span>
                    </div>
                    <div className="order-items">
                      <ul>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="order-footer">
                      <div className="order-amount">
                        Total: ₹{order.totalAmount} | Paid: ₹{order.partialPayment}
                      </div>
                      <div className="order-actions">
                        <PrintableOrderList 
                          order={order} 
                          shop={userShop} 
                          customer={{ 
                            name: order.customerName, 
                            email: order.customerEmail, 
                            uid: order.customerId,
                            phone: order.customerPhone
                          }}
                          userType="shop"
                        />
                        {order.orderStatus === 'confirmed' && (
                          <button
                            className="btn-ready"
                            onClick={() => handleMarkReady(order.id)}
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.orderStatus === 'ready' && (
                          <button
                            className="btn-complete"
                            onClick={() => handleCompleteOrder(order.id)}
                          >
                            Complete Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <h3>Completed Orders</h3>
            {completedOrders.length === 0 ? (
              <p className="no-data">No completed orders yet</p>
            ) : (
              <div className="orders-list">
                {completedOrders.map(order => (
                  <div key={order.id} className="order-card completed">
                    <div className="order-header">
                      <div>
                        <h4>Order #{order.id}</h4>
                        <p className="order-time">
                          Completed: {new Date(order.completedAt || order.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="status-badge status-completed">Completed</span>
                    </div>
                    <div className="order-items">
                      <ul>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="order-footer">
                      <div className="order-amount">
                        Total: ₹{order.totalAmount}
                      </div>
                      <div className="order-actions">
                        <PrintableOrderList 
                          order={order} 
                          shop={userShop} 
                          customer={{ 
                            name: order.customerName, 
                            email: order.customerEmail, 
                            uid: order.customerId,
                            phone: order.customerPhone
                          }}
                          userType="shop"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="catalog-section">
            <h3>Catalog Management</h3>
            
            {/* Add Product Form */}
            <ProductManagement shopId={userShop.id} onProductAdded={refreshProducts} />
            
            {/* Product List */}
            <div className="products-section">
              <h3>Your Products ({shopProducts.length})</h3>
              
              {productsLoading ? (
                <p className="loading-text">Loading products...</p>
              ) : shopProducts.length === 0 ? (
                <p className="no-data">No products yet. Add your first product above!</p>
              ) : (
                <div className="products-grid">
                  {shopProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-header">
                        <h4>{product.name}</h4>
                        <span className={`stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                          {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                        </span>
                      </div>
                      <div className="product-details">
                        <p className="product-price">₹{product.price}</p>
                        <p className="product-category">{product.category}</p>
                      </div>
                      <div className="product-actions">
                        <button
                          className="btn-toggle-stock"
                          onClick={() => handleToggleStock(product.id, product.inStock)}
                        >
                          {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                        </button>
                        <button
                          className="btn-delete-product"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDashboard;
