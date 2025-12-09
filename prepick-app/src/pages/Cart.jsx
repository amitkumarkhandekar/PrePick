import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/Cart.css';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, createOrder, shops, currentUser } = useApp();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Browse shops and add items to get started!</p>
        <button onClick={() => navigate('/customer/shops')} className="browse-btn">
          Browse Shops
        </button>
      </div>
    );
  }

  // Group cart items by shop
  const itemsByShop = cart.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = [];
    }
    acc[item.shopId].push(item);
    return acc;
  }, {});

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const partialPayment = Math.ceil(totalAmount / 2); // 50% upfront payment

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handlePlaceOrder = async (shopId) => {
    const shopItems = itemsByShop[shopId];
    const shopTotal = shopItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shop = shops.find(s => s.id === shopId);

    const orderData = {
      customerId: currentUser.uid,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      shopId: shopId,
      shopName: shop.name,
      items: shopItems.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: shopTotal,
      partialPayment: Math.ceil(shopTotal / 2),
      paymentStatus: 'partial',
      orderStatus: 'pending',
    };

    try {
      await createOrder(orderData);
      alert(`Order placed successfully!

Please pay ₹${orderData.partialPayment} to GPay: ${shop.gpayNumber}

The shop will confirm your order once payment is received.`);
      navigate('/customer/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate('/customer/shops')}>
          ← Continue Shopping
        </button>
        <h2>Your Cart</h2>
      </div>

      {Object.entries(itemsByShop).map(([shopId, items]) => {
        const shop = shops.find(s => s.id === shopId);
        const shopTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return (
          <div key={shopId} className="shop-cart-section">
            <div className="shop-cart-header">
              <h3>{shop.name}</h3>
              <span className="shop-category">{shop.category}</span>
            </div>

            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="item-price">₹{item.price} each</p>
                  </div>

                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="qty-btn"
                      >
                        −
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      <span className="total-label">Total:</span>
                      <span className="total-amount">₹{item.price * item.quantity}</span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="shop-cart-footer">
              <div className="shop-total">
                <span>Subtotal ({items.length} items):</span>
                <span className="amount">₹{shopTotal}</span>
              </div>
              <div className="partial-payment-info">
                <span>Partial Payment (50%):</span>
                <span className="amount">₹{Math.ceil(shopTotal / 2)}</span>
              </div>
              {showCheckout && (
                <div className="checkout-section">
                  <p className="payment-instruction">
                    Pay ₹{Math.ceil(shopTotal / 2)} via Google Pay to: <strong>{shop.gpayNumber}</strong>
                  </p>
                  <button
                    onClick={() => handlePlaceOrder(shopId)}
                    className="place-order-btn"
                  >
                    Confirm Order
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="cart-footer">
        <div className="total-summary">
          <div className="summary-row">
            <span>Total Amount:</span>
            <span className="amount">₹{totalAmount}</span>
          </div>
          <div className="summary-row highlight">
            <span>Partial Payment Required (50%):</span>
            <span className="amount">₹{partialPayment}</span>
          </div>
          <p className="payment-note">
            Pay 50% upfront. Remaining amount to be paid at pickup.
          </p>
        </div>

        {!showCheckout && (
          <button onClick={handleCheckout} className="checkout-btn">
            Proceed to Checkout
          </button>
        )}
      </div>
    </div>
  );
};

export default Cart;
