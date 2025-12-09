import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, googleProvider, database } from '../config/firebase';

// Sign up with email and password
export const signUpWithEmail = async (email, password, name, role = 'customer') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with name
    await updateProfile(user, { displayName: name });
    
    // Create user profile in database
    await set(ref(database, `users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      name: name,
      role: role,
      createdAt: new Date().toISOString(),
      favorites: []
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign in with Google using redirect (avoids COOP issues)
export const signInWithGoogle = async (role = 'customer') => {
  try {
    // Store role in localStorage to retrieve after redirect
    localStorage.setItem('pendingGoogleSignInRole', role);
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    localStorage.removeItem('pendingGoogleSignInRole');
    throw error;
  }
};

// Handle redirect result after Google sign-in
export const handleGoogleRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    
    if (result && result.user) {
      const user = result.user;
      const role = localStorage.getItem('pendingGoogleSignInRole') || 'customer';
      localStorage.removeItem('pendingGoogleSignInRole');
      
      // Check if user exists in database
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // Create new user profile
        await set(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          role: role,
          createdAt: new Date().toISOString(),
          favorites: []
        });
      }
      
      return user;
    }
    return null;
  } catch (error) {
    localStorage.removeItem('pendingGoogleSignInRole');
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (uid) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    throw error;
  }
};
