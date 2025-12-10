import { useState } from 'react';
import { useApp } from '../context/AppContext';

const CustomItemEntry = ({ shopId, shopName }) => {
  const { addToCart } = useApp();
  const [customItem, setCustomItem] = useState({
    name: '',
    quantity: 1
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomItem(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  const handleAddCustomItem = () => {
    if (!customItem.name.trim()) {
      setMessage('Please enter an item name');
      return;
    }

    if (customItem.quantity < 1) {
      setMessage('Quantity must be at least 1');
      return;
    }

    // Create a custom item with special identifier
    const customCartItem = {
      id: `custom_${Date.now()}`, // Unique ID for custom items
      name: customItem.name.trim(),
      quantity: customItem.quantity,
      price: 0, // Price will be determined by shop owner
      shopId: shopId,
      isCustom: true // Flag to identify custom items
    };

    addToCart(customCartItem);
    setCustomItem({ name: '', quantity: 1 });
    setMessage('Item added to cart!');
    
    // Clear message after 2 seconds
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="custom-item-entry">
      <h4>Can't find what you need?</h4>
      <p>Add items manually that aren't in the catalog</p>
      
      {message && (
        <div className={`message ${message.includes('added') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <div className="custom-item-form">
        <div className="form-group">
          <label htmlFor="itemName">Item Name *</label>
          <input
            type="text"
            id="itemName"
            name="name"
            value={customItem.name}
            onChange={handleInputChange}
            placeholder="e.g., Specific brand of chips"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="itemQuantity">Quantity *</label>
          <input
            type="number"
            id="itemQuantity"
            name="quantity"
            min="1"
            value={customItem.quantity}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        
        <button 
          onClick={handleAddCustomItem}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Add to Cart
        </button>
      </div>
      
      <div className="note">
        <p><strong>Note:</strong> Custom items will appear in a separate section on your order. 
        The shop owner will add the price and calculate the total manually.</p>
      </div>
    </div>
  );
};

export default CustomItemEntry;