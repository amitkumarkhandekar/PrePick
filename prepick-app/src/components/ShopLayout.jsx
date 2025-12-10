import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/Layout.css';

const ShopLayout = () => {
  const { currentUser, logout, shops } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const userShop = shops.find(s => s.ownerId === currentUser?.id);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar shop-navbar">
        <div className="nav-brand">
          <h1>PrePick</h1>
          <span className="user-role">Shop Owner</span>
        </div>
        
        <div className="nav-links">
          <button
            className={`nav-link ${isActive('/shop/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/shop/dashboard')}
          >
            Dashboard
          </button>
        </div>

        <div className="nav-user">
          <span className="shop-name">{userShop?.name}</span>
          <button 
            className="profile-btn" 
            onClick={() => navigate('/shop/profile')}
            title="Edit Profile"
          >
            👤
          </button>
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

export default ShopLayout;