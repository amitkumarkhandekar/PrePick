import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { useEffect } from 'react';
import { requestNotificationPermission } from './services/notificationService';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ShopSetup from './pages/ShopSetup';
import EditProfile from './pages/EditProfile';
import CustomerLayout from './components/CustomerLayout';
import ShopLayout from './components/ShopLayout';
import CustomerShops from './pages/CustomerShops';
import ShopCatalog from './pages/ShopCatalog';
import Cart from './pages/Cart';
import CustomerOrders from './pages/CustomerOrders';
import ShopDashboard from './pages/ShopDashboard';
import NotificationCenter from './components/NotificationCenter';
import './App.css';
import './styles/components.css';

function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, authLoading } = useApp();
  
  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { currentUser } = useApp();
  
  // Redirect authenticated users to their respective dashboards
  useEffect(() => {
    // This effect runs on component mount and when currentUser changes
  }, [currentUser]);
  
  return (
    <Routes>
      <Route path="/" element={currentUser ? (
        currentUser.role === 'customer' ? 
        <Navigate to="/customer/shops" replace /> : 
        <Navigate to="/shop/dashboard" replace />
      ) : <Login />}>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Customer Routes */}
      <Route path="/customer" element={
        <ProtectedRoute allowedRole="customer">
          <CustomerLayout />
        </ProtectedRoute>
      }>
        <Route path="shops" element={<CustomerShops />} />
        <Route path="shop/:shopId" element={<ShopCatalog />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="profile" element={<EditProfile />} />
      </Route>
      
      {/* Shop Owner Routes */}
      <Route path="/shop" element={
        <ProtectedRoute allowedRole="shop">
          <ShopLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<ShopDashboard />} />
        <Route path="setup" element={<ShopSetup />} />
        <Route path="profile" element={<EditProfile />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <NotificationCenter />
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;