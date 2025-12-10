import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import '../styles/CustomerShops.css';

const CustomerShops = () => {
  const { shops, currentUser, toggleFavorite } = useApp();
  const navigate = useNavigate();

  // Filter only verified shops
  const verifiedShops = shops.filter(shop => shop.verified);

  const isFavorite = (shopId) => {
    return currentUser?.favorites?.includes(shopId) || false;
  };

  const handleShopClick = (shopId) => {
    navigate(`/customer/shop/${shopId}`);
  };

  const handleCallShop = (e, phone) => {
    e.stopPropagation();
    window.open(`tel:${phone}`);
  };

  const handleToggleFavorite = (e, shopId) => {
    e.stopPropagation();
    toggleFavorite(shopId);
  };

  return (
    <div className="customer-shops">
      <h2>Nearby Shops</h2>
      <p className="subtitle">Browse verified local shops in your area</p>

      <div className="shops-grid">
        {verifiedShops.map(shop => (
          <div
            key={shop.id}
            className="shop-card"
            onClick={() => handleShopClick(shop.id)}
          >
            <div className="shop-header">
              <div>
                <h3>{shop.name}</h3>
                <span className="shop-category">{shop.category}</span>
              </div>
              <button
                className={`favorite-btn ${isFavorite(shop.id) ? 'active' : ''}`}
                onClick={(e) => handleToggleFavorite(e, shop.id)}
              >
                {isFavorite(shop.id) ? '★' : '☆'}
              </button>
            </div>

            <div className="shop-details">
              <p className="shop-address">📍 {shop.address}</p>
              <p className="shop-hours">🕒 {shop.openingHours}</p>
            </div>

            <div className="shop-actions">
              <button
                className="call-btn"
                onClick={(e) => handleCallShop(e, shop.phone)}
              >
                📞 Call Shop
              </button>
              <button className="browse-btn">
                Browse Catalog →
              </button>
            </div>
          </div>
        ))}
      </div>

      {verifiedShops.length === 0 && (
        <div className="no-shops">
          <p>No verified shops found in your area.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerShops;