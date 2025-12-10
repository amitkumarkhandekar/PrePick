import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CustomItemEntry from '../components/CustomItemEntry';
import '../styles/ShopCatalog.css';

const ShopCatalog = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { shops, cart, addToCart, listenToProducts } = useApp();
  const [shopProducts, setShopProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCustomEntry, setShowCustomEntry] = useState(false);

  const shop = shops.find(s => s.id === shopId);

  // Fetch products when shopId changes
  useEffect(() => {
    if (!shopId) return;
    
    const unsubscribe = listenToProducts(shopId, (productsData) => {
      console.log('Products updated for shop:', shopId, productsData);
      setShopProducts(productsData);
    });

    return () => unsubscribe();
  }, [shopId]);

  // Get unique categories
  const categories = ['All', ...new Set(shopProducts.map(p => p.category))];

  // Filter products based on search and category
  const filteredProducts = shopProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (!shop) {
    return (
      <div className="shop-not-found">
        <h2>Shop not found</h2>
        <button onClick={() => navigate('/customer/shops')} className="back-btn">
          Back to Shops
        </button>
      </div>
    );
  }

  return (
    <div className="shop-catalog">
      <div className="shop-header">
        <button 
          className="back-btn" 
          onClick={() => navigate('/customer/shops')}
        >
          ← Back to Shops
        </button>
        <div className="shop-info">
          <h2>{shop.name}</h2>
          <div className="shop-meta">
            <span className="shop-category">{shop.category}</span>
            <span className="shop-phone">📞 {shop.phone}</span>
          </div>
          <p className="shop-address">📍 {shop.address}</p>
          <p className="shop-hours">🕒 {shop.openingHours}</p>
        </div>
      </div>

      <div className="catalog-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="custom-request-section">
        <button 
          className="custom-request-btn"
          onClick={() => setShowCustomEntry(!showCustomEntry)}
        >
          {showCustomEntry ? 'Hide Custom Request' : 'Can\'t find what you need?'}
        </button>
        
        {showCustomEntry && (
          <div className="custom-entry-container">
            <CustomItemEntry shopId={shopId} shopName={shop.name} />
          </div>
        )}
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">₹{product.price}</p>
            </div>
            
            {product.inStock ? (
              <div className="product-actions">
                {getCartQuantity(product.id) > 0 ? (
                  <div className="in-cart-badge">
                    ✓ In Cart ({getCartQuantity(product.id)})
                  </div>
                ) : null}
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            ) : (
              <div className="out-of-stock-badge">Out of Stock</div>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      )}

      {cart.length > 0 && (
        <div className="cart-summary">
          <div className="cart-info">
            <span>{cart.length} items in cart</span>
            <span className="cart-total">Total: ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
          </div>
          <button className="view-cart-btn" onClick={() => navigate('/customer/cart')}>
            View Cart & Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopCatalog;