import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Debug: Print environment variables
console.log('Firebase Config Environment Variables:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
});

const firebaseConfig = {
  apiKey: "AIzaSyAmcHTkXmYZHEKxhhsXT97Vxp2JszxS0as",
  authDomain: "mylibaas-30379.firebaseapp.com",
  projectId: "mylibaas-30379",
  storageBucket: "mylibaas-30379.appspot.com",
  messagingSenderId: "871195372099",
  appId: "1:871195372099:web:1976ce6ae9454686e242f6",
  measurementId: "G-Y55QFC385X"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Add Facebook scopes
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

// Enable session persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

export default app;
