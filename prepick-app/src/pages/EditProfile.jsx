import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { updateUserProfile, updateShop } from '../services/databaseService';
import '../styles/Auth.css';

const EditProfile = () => {
  const { currentUser, setCurrentUser, shops } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Shop-specific fields
    shopName: '',
    shopCategory: 'General Store',
    shopPhone: '',
    shopGpayNumber: '',
    shopAddress: '',
    shopOpeningHours: '9:00 AM - 9:00 PM'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      // For shop owners, get shop data
      if (currentUser.role === 'shop') {
        const userShop = shops.find(s => s.ownerId === currentUser.uid);
        if (userShop) {
          setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            // Shop-specific fields from shop data
            shopName: userShop.name || '',
            shopCategory: userShop.category || 'General Store',
            shopPhone: userShop.phone || '',
            shopGpayNumber: userShop.gpayNumber || '',
            shopAddress: userShop.address || '',
            shopOpeningHours: userShop.openingHours || '9:00 AM - 9:00 PM'
          });
        } else {
          // Fallback to user data if shop not found
          setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            // Shop-specific fields from user data
            shopName: currentUser.shopName || currentUser.name || '',
            shopCategory: currentUser.shopCategory || 'General Store',
            shopPhone: currentUser.shopPhone || '',
            shopGpayNumber: currentUser.shopGpayNumber || '',
            shopAddress: currentUser.shopAddress || '',
            shopOpeningHours: currentUser.shopOpeningHours || '9:00 AM - 9:00 PM'
          });
        }
      } else {
        // For customers
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          // Shop-specific fields (not used for customers)
          shopName: '',
          shopCategory: 'General Store',
          shopPhone: '',
          shopGpayNumber: '',
          shopAddress: '',
          shopOpeningHours: '9:00 AM - 9:00 PM'
        });
      }
    }
  }, [currentUser, shops]);

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate phone number (if provided)
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate shop-specific fields for shop owners
    if (currentUser.role === 'shop') {
      if (!formData.shopName.trim()) {
        newErrors.shopName = 'Shop name is required';
      }

      if (!formData.shopPhone && !formData.phone) {
        newErrors.shopPhone = 'Either shop phone or personal phone is required';
      }

      if (formData.shopPhone && !/^[0-9+\-\s()]+$/.test(formData.shopPhone)) {
        newErrors.shopPhone = 'Please enter a valid phone number';
      }

      if (!formData.shopGpayNumber) {
        newErrors.shopGpayNumber = 'Google Pay number is required';
      } else if (!/^[0-9]{10}$/.test(formData.shopGpayNumber)) {
        newErrors.shopGpayNumber = 'Google Pay number must be 10 digits';
      }

      if (!formData.shopAddress.trim()) {
        newErrors.shopAddress = 'Shop address is required';
      }

      if (!formData.shopOpeningHours.trim()) {
        newErrors.shopOpeningHours = 'Opening hours are required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare updates object for user profile
      const userUpdates = {
        name: formData.name,
        phone: formData.phone,
        updatedAt: new Date().toISOString()
      };

      // If user is a shop owner, also update shop data
      if (currentUser.role === 'shop') {
        userUpdates.shopName = formData.shopName;
        userUpdates.shopCategory = formData.shopCategory;
        userUpdates.shopPhone = formData.shopPhone || formData.phone; // Use personal phone if shop phone not provided
        userUpdates.shopGpayNumber = formData.shopGpayNumber;
        userUpdates.shopAddress = formData.shopAddress;
        userUpdates.shopOpeningHours = formData.shopOpeningHours;
        
        // Also update the shop record
        const userShop = shops.find(s => s.ownerId === currentUser.uid);
        if (userShop) {
          const shopUpdates = {
            name: formData.shopName,
            category: formData.shopCategory,
            phone: formData.shopPhone || formData.phone,
            gpayNumber: formData.shopGpayNumber,
            address: formData.shopAddress,
            openingHours: formData.shopOpeningHours,
            updatedAt: new Date().toISOString()
          };
          
          await updateShop(userShop.id, shopUpdates);
        }
      }

      // Update user profile in database
      await updateUserProfile(currentUser.uid, userUpdates);

      // Update current user in context, preserving existing fields
      setCurrentUser({
        ...currentUser,
        ...userUpdates
      });

      setSuccess('Profile updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        if (currentUser.role === 'shop') {
          navigate('/shop/dashboard');
        } else {
          navigate('/customer/shops');
        }
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: currentUser.role === 'shop' ? '#3b82f6' : '#10b981',
            margin: '0 auto 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            {currentUser.name?.charAt(0) || 'U'}
          </div>
          <h2>Edit Profile</h2>
          <p className="subtitle">
            {currentUser.role === 'shop' ? 'Shop Owner' : 'Customer'} Profile
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled
            />
            <p className="help-text">Email cannot be changed</p>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
            <p className="help-text">Used for order notifications and communication</p>
          </div>

          {currentUser.role === 'shop' && (
            <>
              <div style={{ 
                backgroundColor: '#eff6ff', 
                padding: '15px', 
                borderRadius: '8px', 
                margin: '25px 0',
                borderLeft: '4px solid #3b82f6'
              }}>
                <h3 style={{ 
                  margin: '0 0 10px 0', 
                  color: '#1e40af',
                  fontSize: '1.1rem'
                }}>
                  🏪 Shop Information
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#374151',
                  fontSize: '0.9rem'
                }}>
                  These details will be visible to customers when they browse your shop.
                </p>
              </div>
              
              <div className="form-group">
                <label htmlFor="shopName">Shop Name *</label>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Enter your shop name"
                  className={errors.shopName ? 'error' : ''}
                />
                {errors.shopName && <div className="error-message">{errors.shopName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="shopCategory">Shop Category</label>
                <select
                  id="shopCategory"
                  name="shopCategory"
                  value={formData.shopCategory}
                  onChange={handleChange}
                  className="role-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="shopPhone">Shop Phone Number</label>
                <input
                  type="tel"
                  id="shopPhone"
                  name="shopPhone"
                  value={formData.shopPhone}
                  onChange={handleChange}
                  placeholder="Enter shop phone number"
                  className={errors.shopPhone ? 'error' : ''}
                />
                {errors.shopPhone && <div className="error-message">{errors.shopPhone}</div>}
                {!formData.shopPhone && (
                  <p className="help-text">If not provided, your personal phone number will be used</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="shopGpayNumber">Google Pay Number *</label>
                <input
                  type="tel"
                  id="shopGpayNumber"
                  name="shopGpayNumber"
                  value={formData.shopGpayNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit GPay number"
                  className={errors.shopGpayNumber ? 'error' : ''}
                />
                {errors.shopGpayNumber && <div className="error-message">{errors.shopGpayNumber}</div>}
                <p className="help-text">Customers will use this number to make partial payments</p>
              </div>

              <div className="form-group">
                <label htmlFor="shopAddress">Shop Address *</label>
                <textarea
                  id="shopAddress"
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleChange}
                  placeholder="Enter shop address"
                  rows="3"
                  className={errors.shopAddress ? 'error' : ''}
                />
                {errors.shopAddress && <div className="error-message">{errors.shopAddress}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="shopOpeningHours">Opening Hours *</label>
                <input
                  type="text"
                  id="shopOpeningHours"
                  name="shopOpeningHours"
                  value={formData.shopOpeningHours}
                  onChange={handleChange}
                  placeholder="e.g., 9:00 AM - 9:00 PM"
                  className={errors.shopOpeningHours ? 'error' : ''}
                />
                {errors.shopOpeningHours && <div className="error-message">{errors.shopOpeningHours}</div>}
              </div>
            </>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Updating Profile...' : 'Update Profile'}
          </button>
        </form>

        <button 
          onClick={() => {
            if (currentUser.role === 'shop') {
              navigate('/shop/dashboard');
            } else {
              navigate('/customer/shops');
            }
          }}
          className="secondary-button"
          style={{ marginTop: '15px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfile;