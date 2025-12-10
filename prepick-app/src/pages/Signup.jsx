import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpWithEmail, signInWithGoogle, handleGoogleRedirect, getUserProfile } from '../services/authService';
import { useApp } from '../context/AppContext';
import '../styles/Auth.css';

const Signup = () => {
  const { setCurrentUser } = useApp(); // Get setCurrentUser from context
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    // Additional fields for profile information
    phone: '',
    shopName: '',
    shopCategory: 'General Store',
    shopPhone: '',
    shopGpayNumber: '',
    shopAddress: '',
    shopOpeningHours: '9:00 AM - 9:00 PM'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  // Handle Google redirect result on component mount
  useEffect(() => {
    const checkRedirect = async () => {
      setLoading(true);
      try {
        const user = await handleGoogleRedirect();
        if (user) {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile?.role === 'customer') {
            navigate('/customer/shops');
          } else if (userProfile?.role === 'shop') {
            navigate('/shop/dashboard');
          } else {
            navigate('/customer/shops');
          }
        }
      } catch (error) {
        console.error('Google redirect error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
          setError('Failed to complete Google sign-in.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkRedirect();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate phone number if provided
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    // Additional validation for shop owners
    if (formData.role === 'shop') {
      if (!formData.shopName.trim()) {
        setError('Shop name is required');
        return;
      }
      
      if (!formData.shopPhone && !formData.phone) {
        setError('Either shop phone or personal phone is required');
        return;
      }
      
      // Validate shop phone number if provided
      if (formData.shopPhone && !/^[0-9+\-\s()]+$/.test(formData.shopPhone)) {
        setError('Please enter a valid shop phone number');
        return;
      }
      
      if (!formData.shopGpayNumber) {
        setError('Google Pay number is required');
        return;
      } else if (!/^[0-9]{10}$/.test(formData.shopGpayNumber)) {
        setError('Google Pay number must be 10 digits');
        return;
      }
      
      if (!formData.shopAddress.trim()) {
        setError('Shop address is required');
        return;
      }
    }

    setLoading(true);

    try {
      // Pass additional profile data to signup function
      const user = await signUpWithEmail(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.role,
        {
          phone: formData.phone,
          shopName: formData.shopName,
          shopCategory: formData.shopCategory,
          shopPhone: formData.shopPhone,
          shopGpayNumber: formData.shopGpayNumber,
          shopAddress: formData.shopAddress,
          shopOpeningHours: formData.shopOpeningHours
        }
      );
      console.log('Signup successful:', user);
      
      // Manually set the currentUser in context to avoid timing issues
      const userProfile = {
        uid: user.uid,
        email: user.email,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        // For shop owners, also add shop-related fields
        ...(formData.role === 'shop' && {
          shopName: formData.shopName,
          shopCategory: formData.shopCategory,
          shopPhone: formData.shopPhone || formData.phone || '',
          shopGpayNumber: formData.shopGpayNumber,
          shopAddress: formData.shopAddress,
          shopOpeningHours: formData.shopOpeningHours
        })
      };
      
      setCurrentUser(userProfile);
      
      // Redirect based on role
      if (formData.role === 'customer') {
        navigate('/customer/shops');
      } else {
        // For shop owners, redirect to dashboard since we have all info
        navigate('/shop/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Email/password authentication is not enabled. Please contact support.');
      } else {
        setError(`Signup failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      // This will redirect to Google, then return to this page
      await signInWithGoogle(formData.role);
      // Navigation happens in useEffect after redirect
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Failed to initiate Google signup. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="tagline">Join PrePick and start shopping locally</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
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
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
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
            />
            <p className="help-text">Used for order notifications and communication</p>
          </div>

          <div className="form-group">
            <label htmlFor="role">I am a:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="customer">Customer</option>
              <option value="shop">Shop Owner</option>
            </select>
          </div>

          {formData.role === 'shop' && (
            <>
              <div className="section-title">🏪 Shop Information</div>
              
              <div className="form-group">
                <label htmlFor="shopName">Shop Name *</label>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Enter your shop name"
                />
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
                />
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
                />
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
                />
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
                />
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={handleGoogleSignup} className="google-button" disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;