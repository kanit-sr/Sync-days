import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8wAwfKOJO8-JVRUCQf_AXrJ-Lwi5A4GA",
  authDomain: "sync-days.firebaseapp.com",
  projectId: "sync-days",
  storageBucket: "sync-days.appspot.com",
  messagingSenderId: "911851358149",
  appId: "1:911851358149:web:4369264f663417c1102dac",
  measurementId: "G-KEEXJ7PGJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
try {
  if (typeof window !== 'undefined' && typeof getAnalytics === 'function') {
    analytics = getAnalytics(app);
  }
} catch (err) {
  // Analytics may error if measurementId is invalid or blocked; ignore safely
  console.warn('Firebase analytics init failed:', err && err.message);
}

export { analytics };

export default app;
