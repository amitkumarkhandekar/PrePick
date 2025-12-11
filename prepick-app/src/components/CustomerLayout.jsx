import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logo from '../assets/Logo.png';
import '../styles/Layout.css';
import { useState, useEffect } from 'react';
import { FaStore, FaBox, FaShoppingCart, FaUser, FaSignOutAlt, FaList } from 'react-icons/fa';

// Helper function to get initials for avatar
const getUserInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names.length > 1 
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : names[0][0].toUpperCase();
};

const CustomerLayout = () => {
  const { currentUser, logout, cart } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return (
    <div className={`layout ${isMobile ? 'has-bottom-nav' : ''}`}>
      {/* Top Navbar for Desktop */}
      {!isMobile && (
        <nav className="navbar">
          <div className="nav-brand">
            <img src={logo} alt="PrePick Logo" className="nav-brand-img" />
            <h1>PrePick</h1>
            <span className="user-role">Customer</span>
          </div>
          
          <div className="nav-links">
            <button
              className={`nav-link ${isActive('/customer/shops') ? 'active' : ''}`}
              onClick={() => navigate('/customer/shops')}
            >
              <FaStore />
              <span>Shops</span>
            </button>
            <button
              className={`nav-link ${isActive('/customer/orders') ? 'active' : ''}`}
              onClick={() => navigate('/customer/orders')}
            >
              <FaBox />
              <span>My Orders</span>
            </button>
            <button
              className={`nav-link cart-link ${isActive('/customer/cart') ? 'active' : ''}`}
              onClick={() => navigate('/customer/cart')}
            >
              <FaShoppingCart />
              <span>Cart</span>
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
          </div>

          <div className="nav-user">
            <span className="user-name">{currentUser?.name}</span>
            <button 
              className="profile-btn" 
              onClick={() => navigate('/customer/profile')}
              title="Edit Profile"
            >
              <FaUser />
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom Navbar for Mobile */}
      {isMobile && (
        <nav className="navbar mobile-bottom">
          <div className="nav-links">
            <button
              className={`nav-link ${isActive('/customer/shops') ? 'active' : ''}`}
              onClick={() => navigate('/customer/shops')}
            >
              <FaStore />
              <span>Shops</span>
            </button>
            <button
              className={`nav-link ${isActive('/customer/orders') ? 'active' : ''}`}
              onClick={() => navigate('/customer/orders')}
            >
              <FaList />
              <span>Orders</span>
            </button>
            <button
              className={`nav-link cart-link ${isActive('/customer/cart') ? 'active' : ''}`}
              onClick={() => navigate('/customer/cart')}
            >
              <FaShoppingCart />
              <span>Cart</span>
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
            <button
              className={`nav-link ${isActive('/customer/profile') ? 'active' : ''}`}
              onClick={() => navigate('/customer/profile')}
            >
              <FaUser />
              <span>Profile</span>
            </button>
            <button className="nav-link" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default CustomerLayout;