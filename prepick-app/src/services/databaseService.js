import { ref, set, get, push, update, remove, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { database } from '../config/firebase';

// ============ SHOPS ============

export const createShop = async (shopData) => {
  try {
    const shopRef = push(ref(database, 'shops'));
    await set(shopRef, {
      ...shopData,
      id: shopRef.key,
      createdAt: new Date().toISOString(),
      verified: false
    });
    return shopRef.key;
  } catch (error) {
    throw error;
  }
};

export const getShops = async () => {
  try {
    const shopsRef = ref(database, 'shops');
    const snapshot = await get(shopsRef);
    
    if (snapshot.exists()) {
      const shopsData = snapshot.val();
      return Object.values(shopsData);
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const getShopById = async (shopId) => {
  try {
    const shopRef = ref(database, `shops/${shopId}`);
    const snapshot = await get(shopRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const getShopsByOwner = async (ownerId) => {
  try {
    const shopsRef = ref(database, 'shops');
    const shopsQuery = query(shopsRef, orderByChild('ownerId'), equalTo(ownerId));
    const snapshot = await get(shopsQuery);
    
    if (snapshot.exists()) {
      const shopsData = snapshot.val();
      return Object.values(shopsData);
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const updateShop = async (shopId, updates) => {
  try {
    const shopRef = ref(database, `shops/${shopId}`);
    await update(shopRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

// ============ PRODUCTS ============

export const addProduct = async (shopId, productData) => {
  try {
    const productRef = push(ref(database, `products/${shopId}`));
    await set(productRef, {
      ...productData,
      id: productRef.key,
      shopId: shopId,
      createdAt: new Date().toISOString(),
      inStock: true
    });
    return productRef.key;
  } catch (error) {
    throw error;
  }
};

export const addBulkProducts = async (shopId, productsArray) => {
  try {
    const updates = {};
    productsArray.forEach(product => {
      const productRef = push(ref(database, `products/${shopId}`));
      updates[`products/${shopId}/${productRef.key}`] = {
        ...product,
        id: productRef.key,
        shopId: shopId,
        createdAt: new Date().toISOString(),
        inStock: true
      };
    });
    
    await update(ref(database), updates);
    return true;
  } catch (error) {
    throw error;
  }
};

export const getProductsByShop = async (shopId) => {
  try {
    const productsRef = ref(database, `products/${shopId}`);
    const snapshot = await get(productsRef);
    
    if (snapshot.exists()) {
      const productsData = snapshot.val();
      return Object.values(productsData);
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (shopId, productId, updates) => {
  try {
    const productRef = ref(database, `products/${shopId}/${productId}`);
    await update(productRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (shopId, productId) => {
  try {
    const productRef = ref(database, `products/${shopId}/${productId}`);
    await remove(productRef);
  } catch (error) {
    throw error;
  }
};

// ============ ORDERS ============

export const createOrder = async (orderData) => {
  try {
    const orderRef = push(ref(database, 'orders'));
    const orderId = orderRef.key;
    
    await set(orderRef, {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return orderId;
  } catch (error) {
    throw error;
  }
};

export const getOrdersByCustomer = async (customerId) => {
  try {
    const ordersRef = ref(database, 'orders');
    const ordersQuery = query(ordersRef, orderByChild('customerId'), equalTo(customerId));
    const snapshot = await get(ordersQuery);
    
    if (snapshot.exists()) {
      const ordersData = snapshot.val();
      return Object.values(ordersData);
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const getOrdersByShop = async (shopId) => {
  try {
    const ordersRef = ref(database, 'orders');
    const ordersQuery = query(ordersRef, orderByChild('shopId'), equalTo(shopId));
    const snapshot = await get(ordersQuery);
    
    if (snapshot.exists()) {
      const ordersData = snapshot.val();
      return Object.values(ordersData);
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const updateOrder = async (orderId, updates) => {
  try {
    const orderRef = ref(database, `orders/${orderId}`);
    await update(orderRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

// ============ FAVORITES ============

export const toggleFavorite = async (userId, shopId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const favorites = userData.favorites || [];
      const isFavorite = favorites.includes(shopId);
      
      const updatedFavorites = isFavorite
        ? favorites.filter(id => id !== shopId)
        : [...favorites, shopId];
      
      await update(userRef, { favorites: updatedFavorites });
      return updatedFavorites;
    }
  } catch (error) {
    throw error;
  }
};

// ============ REAL-TIME LISTENERS ============

export const listenToShops = (callback) => {
  const shopsRef = ref(database, 'shops');
  return onValue(shopsRef, (snapshot) => {
    if (snapshot.exists()) {
      const shopsData = snapshot.val();
      callback(Object.values(shopsData));
    } else {
      callback([]);
    }
  });
};

export const listenToProducts = (shopId, callback) => {
  const productsRef = ref(database, `products/${shopId}`);
  return onValue(productsRef, (snapshot) => {
    if (snapshot.exists()) {
      const productsData = snapshot.val();
      callback(Object.values(productsData));
    } else {
      callback([]);
    }
  });
};

export const listenToOrders = (shopId, callback) => {
  const ordersRef = ref(database, 'orders');
  const ordersQuery = query(ordersRef, orderByChild('shopId'), equalTo(shopId));
  
  return onValue(ordersQuery, (snapshot) => {
    if (snapshot.exists()) {
      const ordersData = snapshot.val();
      callback(Object.values(ordersData));
    } else {
      callback([]);
    }
  });
};
