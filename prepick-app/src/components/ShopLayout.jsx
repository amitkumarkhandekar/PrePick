import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logo from '../assets/Logo.png';
import '../styles/Layout.css';

// Helper function to get initials for avatar
const getUserInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names.length > 1 
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : names[0][0].toUpperCase();
};

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
          <img src={logo} alt="PrePick Logo" className="nav-brand-img" />
          <h1>PrePick</h1>
          <span className="user-role">Shop Owner</span>
        </div>
        
        <div className="nav-links">
          <button
            className={`nav-link ${isActive('/shop/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/shop/dashboard')}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </button>
        </div>

        <div className="nav-user">
          <span className="shop-name">{userShop?.name}</span>
          <button 
            className="profile-btn" 
            onClick={() => navigate('/shop/profile')}
            title="Edit Profile"
          >
            {getUserInitials(currentUser?.name)}
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

export default ShopLayout;