// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,  // ✅ Added VITE_ prefix
  authDomain: "wingx-6fed9.firebaseapp.com",
  projectId: "wingx-6fed9",
  storageBucket: "wingx-6fed9.firebasestorage.app",
  messagingSenderId: "453960980516",
  appId: "1:453960980516:web:57ae6d4f4eebd69783a0b1",
  measurementId: "G-89LD8KDWB0"
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