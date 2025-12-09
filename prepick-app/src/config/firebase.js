import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration - Your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAc5WUWBr51qfsuX9EJyL38s6ZoJ171ETc",
  authDomain: "prepick-4b9c3.firebaseapp.com",
  projectId: "prepick-4b9c3",
  storageBucket: "prepick-4b9c3.firebasestorage.app",
  messagingSenderId: "883930992814",
  appId: "1:883930992814:web:356fbd1498a13c34281d3f",
  measurementId: "G-L9RNT9SF3C",
  databaseURL: "https://prepick-4b9c3-default-rtdb.firebaseio.com" // Update this with your actual Database URL
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);

export default app;
