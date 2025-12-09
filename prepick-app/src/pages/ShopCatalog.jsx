import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getProductsByShop } from '../services/databaseService';
import '../styles/ShopCatalog.css';

const ShopCatalog = () => {
  const { shopId } = useParams();
  const { shops, addToCart, cart } = useApp();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const shop = shops.find(s => s.id === shopId);
  
  // Fetch products for this shop
  useEffect(() => {
    const fetchProducts = async () => {
      if (!shopId) return;
      
      setLoading(true);
      try {
        const products = await getProductsByShop(shopId);
        console.log('Products for shop:', products);
        setShopProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [shopId]);
  
  // Get unique categories
  const categories = ['All', ...new Set(shopProducts.map(p => p.category))];
  
  // Filter products
  const filteredProducts = shopProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    if (product.inStock) {
      addToCart(product);
    }
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!shop) {
    return (
      <div className="error" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Shop not found</h3>
        <button onClick={() => navigate('/customer/shops')} style={{ marginTop: '20px' }}>
          ← Back to Shops
        </button>
      </div>
    );
  }

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
        Loading products...
      </div>
    );
  }

  return (
    <div className="shop-catalog">
      <div className="shop-header">
        <button className="back-btn" onClick={() => navigate('/customer/shops')}>
          ← Back to Shops
        </button>
        <div className="shop-info">
          <h2>{shop.name}</h2>
          <p className="shop-category">{shop.category}</p>
          <p className="shop-address">📍 {shop.address}</p>
          <p className="shop-hours">🕒 {shop.openingHours}</p>
        </div>
      </div>

      <div className="catalog-controls">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}>
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
            <span className="cart-total">Total: ₹{cartTotal}</span>
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
