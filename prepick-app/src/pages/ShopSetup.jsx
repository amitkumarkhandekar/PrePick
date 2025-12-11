import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { createShop } from '../services/databaseService';
import '../styles/Auth.css';

const ShopSetup = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'General Store',
    phone: '',
    gpayNumber: '',
    address: '',
    openingHours: '9:00 AM - 9:00 PM'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'General Store',
    'Medical',
    'Bakery',
    'Stationery',
    'Electronics',
    'Clothing',
    'Grocery',
    'Hardware',
    'Other'
  ];

  // Pre-fill form with existing data if available
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.shopName || currentUser.name || '',
        category: currentUser.shopCategory || 'General Store',
        phone: currentUser.shopPhone || currentUser.phone || '',
        gpayNumber: currentUser.shopGpayNumber || '',
        address: currentUser.shopAddress || '',
        openingHours: currentUser.shopOpeningHours || '9:00 AM - 9:00 PM'
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create shop in Firebase
      const shopId = await createShop({
        ...formData,
        ownerId: currentUser.uid,
        ownerName: currentUser.name,
        ownerEmail: currentUser.email,
        verified: false,
        status: 'online'
      });

      console.log('Shop created successfully:', shopId);
      alert('Shop registered successfully! Redirecting to dashboard...');
      
      // Reload to fetch the new shop
      window.location.href = '/shop/dashboard';
    } catch (error) {
      console.error('Shop creation error:', error);
      setError('Failed to create shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h1>Register Your Shop</h1>
        <p className="tagline">Complete your shop profile to start receiving orders</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Shop Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Kumar General Store"
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
              className="role-select"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gpayNumber">Google Pay Number *</label>
            <input
              type="tel"
              id="gpayNumber"
              name="gpayNumber"
              value={formData.gpayNumber}
              onChange={handleChange}
              placeholder="9876543210"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Shop Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street, City"
              required
              rows="3"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="openingHours">Opening Hours *</label>
            <input
              type="text"
              id="openingHours"
              name="openingHours"
              value={formData.openingHours}
              onChange={handleChange}
              placeholder="9:00 AM - 9:00 PM"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Shop...' : 'Register Shop'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShopSetup;