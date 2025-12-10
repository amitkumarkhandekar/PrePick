import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logo from '../assets/Logo.png';
import '../styles/Layout.css';

const CustomerLayout = () => {
  const { currentUser, logout, cart } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
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
            <span>🏪</span>
            <span>Shops</span>
          </button>
          <button
            className={`nav-link ${isActive('/customer/orders') ? 'active' : ''}`}
            onClick={() => navigate('/customer/orders')}
          >
            <span>📦</span>
            <span>My Orders</span>
          </button>
          <button
            className={`nav-link cart-link ${isActive('/customer/cart') ? 'active' : ''}`}
            onClick={() => navigate('/customer/cart')}
          >
            <span>🛒</span>
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
            👤
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;