// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wingx-6fed9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wingx-6fed9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wingx-6fed9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "453960980516",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:453960980516:web:57ae6d4f4eebd69783a0b1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-89LD8KDWB0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ✅ Google Sign-In function
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user; // { displayName, email, photoURL, uid }
};

export { auth, app };