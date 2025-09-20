// Debug utilities for SyncDays
export const debugFirebase = () => {
  console.log('=== Firebase Debug Info ===');
  
  // Check if Firebase is initialized
  try {
    const { auth, db } = require('../services/firebase');
    console.log('✅ Firebase services loaded');
    console.log('Auth:', auth);
    console.log('Database:', db);
    
    // Check current user
    if (auth.currentUser) {
      console.log('✅ User authenticated:', auth.currentUser.uid);
    } else {
      console.log('❌ No user authenticated');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
  
  console.log('=== End Debug Info ===');
};

export const testFirestoreConnection = async () => {
  try {
    const { db } = require('../services/firebase');
    const { collection, getDocs } = require('firebase/firestore');
    
    console.log('Testing Firestore connection...');
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    console.log('✅ Firestore connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
};

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  window.debugFirebase = debugFirebase;
  window.testFirestoreConnection = testFirestoreConnection;
}
