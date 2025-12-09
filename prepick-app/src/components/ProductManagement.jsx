import { useState } from 'react';
import { addProduct, addBulkProducts } from '../services/databaseService';

const ProductManagement = ({ shopId, onProductAdded }) => {
  const [activeMode, setActiveMode] = useState('manual'); // 'manual' or 'csv'
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Groceries',
    inStock: true
  });
  const [csvFile, setCsvFile] = useState(null);
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

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setMessage({ type: 'error', text: 'Please select a CSV file' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const text = await csvFile.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      // Parse CSV data
      const products = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 3) {
          products.push({
            name: values[0],
            price: parseFloat(values[1]),
            category: values[2] || 'Other',
            inStock: values[3] === 'false' ? false : true
          });
        }
      }

      if (products.length === 0) {
        setMessage({ type: 'error', text: 'No valid products found in CSV' });
        return;
      }

      await addBulkProducts(shopId, products);
      setMessage({ 
        type: 'success', 
        text: `Successfully added ${products.length} products!` 
      });
      setCsvFile(null);
      e.target.reset();
      
      // Notify parent to refresh product list
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setMessage({ type: 'error', text: 'Failed to upload CSV. Please try again.' });
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
          className={`mode-btn ${activeMode === 'csv' ? 'active' : ''}`}
          onClick={() => setActiveMode('csv')}
        >
          Upload CSV
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
        <div className="csv-upload">
          <div className="csv-instructions">
            <h4>CSV Format Instructions:</h4>
            <p>Your CSV file should have the following columns:</p>
            <code>name,price,category,inStock</code>
            <p><strong>Example:</strong></p>
            <pre>
name,price,category,inStock{'\n'}
Rice (1kg),60,Groceries,true{'\n'}
Milk (1L),65,Dairy,true{'\n'}
Bread,35,Bakery,false
            </pre>
          </div>

          <form onSubmit={handleCSVUpload} className="csv-form">
            <div className="form-group">
              <label htmlFor="csvFile">Select CSV File *</label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
