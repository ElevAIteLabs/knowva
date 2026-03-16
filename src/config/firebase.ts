
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzwzzB7Qk8Q1xqW89KUI0i5_HJI2iT6q4",
  authDomain: "knowva-54c6c.firebaseapp.com",
  projectId: "knowva-54c6c",
  storageBucket: "knowva-54c6c.firebasestorage.app",
  messagingSenderId: "1058812428812",
  appId: "1:1058812428812:web:2295648ffdd5190a87e429",
  measurementId: "G-C18NHGY3CX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
auth.languageCode = "en";
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
