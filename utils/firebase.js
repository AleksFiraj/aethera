import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';

// Control flag for using mock Firebase authentication (demo mode) vs. real Firebase
const USE_MOCK_FIREBASE = true;

// Firebase configuration
const firebaseConfig = {
  apiKey: "xx",
  authDomain: "xx",
  projectId: "xx",
  storageBucket: "xx",
  messagingSenderId: "xx",
  appId: "xx",
  measurementId: "xx"
};

// Initialize Firebase with error handling
let firestore;
let auth;
let storage;

try {
  // Only initialize Firebase if we're not in mock mode or if Firebase is needed for other features
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  firestore = firebase.firestore();
  auth = firebase.auth();
  storage = firebase.storage();
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  
  // Provide mock objects if Firebase initialization fails
  if (USE_MOCK_FIREBASE) {
    console.log('Using mock Firebase implementation');
  }
}

export default firebase;
export { firestore, auth, storage, USE_MOCK_FIREBASE };
