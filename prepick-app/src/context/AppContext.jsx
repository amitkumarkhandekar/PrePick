import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { getUserProfile } from '../services/authService';
import { listenToShops, listenToProducts as listenToShopProducts } from '../services/databaseService';
import { createOrder as createOrderInDB, updateOrder as updateOrderInDB } from '../services/databaseService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const previousOrdersRef = useRef([]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      
      if (firebaseUser) {
        // User is signed in, get their profile from database
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setCurrentUser({
              ...userProfile,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName
            });
          } else {
            // Profile doesn't exist, create basic user object
            // This shouldn't happen after signup, but just in case
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: 'customer' // Default to customer if no profile exists
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser(null);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setCart([]);
      }
      
      setAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Listen to shops from Firebase
  useEffect(() => {
    const unsubscribe = listenToShops((shopsData) => {
      console.log('Shops updated from Firebase:', shopsData);
      setShops(shopsData);
    });

    return () => unsubscribe();
  }, []);

  // Listen to customer orders for notifications (only for customers)
  useEffect(() => {
    if (!currentUser?.uid || currentUser.role !== 'customer') return;

    const ordersRef = ref(database, 'orders');
    const ordersQuery = query(ordersRef, orderByChild('customerId'), equalTo(currentUser.uid));

    const unsubscribe = onValue(ordersQuery, (snapshot) => {
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersArray = Object.values(ordersData);

        // Check for status changes and show notifications
        if (previousOrdersRef.current.length > 0) {
          ordersArray.forEach(order => {
            const previousOrder = previousOrdersRef.current.find(o => o.id === order.id);

            if (previousOrder && previousOrder.orderStatus !== order.orderStatus) {
              console.log('Order status changed (AppContext):', previousOrder.orderStatus, '->', order.orderStatus);

              // Show notification
              if (window.showNotification) {
                let notificationType = 'confirmed';
                let title = '';
                let message = '';

                if (order.orderStatus === 'confirmed') {
                  notificationType = 'confirmed';
                  title = 'Order Confirmed! 👍';
                  message = `Your order will be ready by ${order.readyBy || 'soon'}`;
                } else if (order.orderStatus === 'ready') {
                  notificationType = 'ready';
                  title = 'Order Ready for Pickup! ✅';
                  message = `Your order is ready at ${order.shopName || 'the shop'}!`;
                } else if (order.orderStatus === 'completed') {
                  notificationType = 'completed';
                  title = 'Order Completed! 🎉';
                  message = 'Thank you for your purchase!';
                }

                window.showNotification({
                  type: notificationType,
                  title: title,
                  message: message
                });
              }
            }
          });
        }

        previousOrdersRef.current = ordersArray;
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Function to listen to products for a specific shop
  const listenToProducts = (shopId, callback) => {
    return listenToShopProducts(shopId, callback);
  };

  // Logout function - now handled by Firebase
  const logout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setCart([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Cart functions
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order functions - now use Firebase
  const createOrder = async (orderData) => {
    try {
      const orderId = await createOrderInDB(orderData);
      console.log('Order created:', orderId);
      clearCart();
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrder = async (orderId, updates) => {
    try {
      await updateOrderInDB(orderId, updates);
      console.log('Order updated:', orderId);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  // Favorites functions
  const toggleFavorite = (shopId) => {
    if (!currentUser || currentUser.role !== 'customer') return;
    
    const favorites = currentUser.favorites || [];
    const isFavorite = favorites.includes(shopId);
    
    const updatedFavorites = isFavorite
      ? favorites.filter(id => id !== shopId)
      : [...favorites, shopId];
    
    const updatedUser = { ...currentUser, favorites: updatedFavorites };
    setCurrentUser(updatedUser);
    
    // TODO: Update favorites in Firebase database
  };

  const value = {
    currentUser,
    authLoading,
    logout,
    shops,
    products,
    orders,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    createOrder,
    updateOrder,
    toggleFavorite,
    setCurrentUser,
    listenToProducts // Add the listenToProducts function to the context
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};