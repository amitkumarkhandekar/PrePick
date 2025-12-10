import { useState } from 'react';
import { addProduct, addBulkProducts } from '../services/databaseService';
import BulkProductEntry from './BulkProductEntry';

const ProductManagement = ({ shopId, onProductAdded }) => {
  const [activeMode, setActiveMode] = useState('manual'); // 'manual' or 'bulk'
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Groceries',
    inStock: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    'Groceries', 'Dairy', 'Bakery', 'Medicine', 'First Aid', 
    'Supplements', 'Medical Devices', 'Hygiene', 'Bread', 
    'Cakes', 'Pastries', 'Snacks', 'Books', 'Writing', 
    'Paper', 'Personal Care', 'Other'
  ];

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await addProduct(shopId, {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        inStock: formData.inStock
      });

      setMessage({ type: 'success', text: 'Product added successfully!' });
      // Reset form
      setFormData({
        name: '',
        price: '',
        category: 'Groceries',
        inStock: true
      });
      
      // Notify parent to refresh product list
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ type: 'error', text: 'Failed to add product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-management">
      <div className="mode-toggle">
        <button
          className={`mode-btn ${activeMode === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveMode('manual')}
        >
          Add Manually
        </button>
        <button
          className={`mode-btn ${activeMode === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveMode('bulk')}
        >
          Bulk Entry
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {activeMode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Rice (1kg)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="60"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
              />
              <span>In Stock</span>
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      ) : (
        <BulkProductEntry shopId={shopId} onProductsAdded={onProductAdded} />
      )}
    </div>
  );
};

export default ProductManagement;