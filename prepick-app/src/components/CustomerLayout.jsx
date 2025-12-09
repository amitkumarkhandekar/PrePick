import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
          <h1>PrePick</h1>
          <span className="user-role">Customer</span>
        </div>
        
        <div className="nav-links">
          <button
            className={`nav-link ${isActive('/customer/shops') ? 'active' : ''}`}
            onClick={() => navigate('/customer/shops')}
          >
            Shops
          </button>
          <button
            className={`nav-link ${isActive('/customer/orders') ? 'active' : ''}`}
            onClick={() => navigate('/customer/orders')}
          >
            My Orders
          </button>
          <button
            className={`nav-link cart-link ${isActive('/customer/cart') ? 'active' : ''}`}
            onClick={() => navigate('/customer/cart')}
          >
            Cart {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
        </div>

        <div className="nav-user">
          <span className="user-name">{currentUser?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
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
