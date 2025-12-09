import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { useEffect } from 'react';
import { requestNotificationPermission } from './services/notificationService';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ShopSetup from './pages/ShopSetup';
import CustomerLayout from './components/CustomerLayout';
import ShopLayout from './components/ShopLayout';
import CustomerShops from './pages/CustomerShops';
import ShopCatalog from './pages/ShopCatalog';
import Cart from './pages/Cart';
import CustomerOrders from './pages/CustomerOrders';
import ShopDashboard from './pages/ShopDashboard';
import NotificationCenter from './components/NotificationCenter';
import './App.css';

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
  const { currentUser, authLoading } = useApp();
  
  // Request notification permission when user logs in
  useEffect(() => {
    if (currentUser && 'Notification' in window) {
      requestNotificationPermission();
    }
  }, [currentUser]);
  
  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Loading PrePick...
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={
        currentUser ? (
          currentUser.role === 'customer' ? 
            <Navigate to="/customer/shops" replace /> : 
            <Navigate to="/shop/dashboard" replace />
        ) : (
          <Login />
        )
      } />
      
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/shop/setup" element={<ShopSetup />} />
      
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
      </Route>
      
      {/* Shop Owner Routes */}
      <Route path="/shop" element={
        <ProtectedRoute allowedRole="shop">
          <ShopLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<ShopDashboard />} />
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

export default App
