import { useState } from 'react';
import { addBulkProducts } from '../services/databaseService';

const BulkProductEntry = ({ shopId, onProductsAdded }) => {
  const [products, setProducts] = useState([
    { name: '', price: '', category: 'Groceries', inStock: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    'Groceries', 'Dairy', 'Bakery', 'Medicine', 'First Aid', 
    'Supplements', 'Medical Devices', 'Hygiene', 'Bread', 
    'Cakes', 'Pastries', 'Snacks', 'Books', 'Writing', 
    'Paper', 'Personal Care', 'Other'
  ];

  const addRow = () => {
    setProducts([...products, { name: '', price: '', category: 'Groceries', inStock: true }]);
  };

  const removeRow = (index) => {
    if (products.length <= 1) {
      setMessage({ type: 'error', text: 'At least one row is required' });
      return;
    }
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate products
      const validProducts = products.filter(product => 
        product.name.trim() !== '' && 
        product.price !== '' && 
        !isNaN(parseFloat(product.price)) &&
        parseFloat(product.price) > 0
      );

      if (validProducts.length === 0) {
        setMessage({ type: 'error', text: 'Please add at least one valid product with name and price' });
        setLoading(false);
        return;
      }

      // Format products for submission
      const formattedProducts = validProducts.map(product => ({
        name: product.name.trim(),
        price: parseFloat(product.price),
        category: product.category,
        inStock: product.inStock
      }));

      await addBulkProducts(shopId, formattedProducts);
      
      setMessage({ 
        type: 'success', 
        text: `Successfully added ${formattedProducts.length} products!` 
      });
      
      // Reset form
      setProducts([{ name: '', price: '', category: 'Groceries', inStock: true }]);
      
      // Notify parent to refresh product list
      if (onProductsAdded) {
        onProductsAdded();
      }
    } catch (error) {
      console.error('Error adding products:', error);
      setMessage({ type: 'error', text: 'Failed to add products. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-product-entry">
      <div className="bulk-entry-header">
        <h3>Bulk Product Entry</h3>
        <p>Add multiple products manually in the table below</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bulk-entry-form">
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name *</th>
                <th>Price (₹) *</th>
                <th>Category</th>
                <th>In Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      placeholder="e.g., Rice (1kg)"
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => updateProduct(index, 'price', e.target.value)}
                      placeholder="60"
                      min="0"
                      step="0.01"
                      className="table-input"
                    />
                  </td>
                  <td>
                    <select
                      value={product.category}
                      onChange={(e) => updateProduct(index, 'category', e.target.value)}
                      className="table-select"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={(e) => updateProduct(index, 'inStock', e.target.checked)}
                      className="table-checkbox"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="btn-remove-row"
                      title="Remove row"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bulk-entry-actions">
          <button type="button" onClick={addRow} className="btn-add-row">
            + Add Row
          </button>
          
          <div className="bulk-submit-section">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding Products...' : `Add ${products.filter(p => p.name.trim() !== '' && p.price !== '').length} Products`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BulkProductEntry;