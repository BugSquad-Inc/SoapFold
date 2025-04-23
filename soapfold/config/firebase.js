import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, PhoneAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const API_KEY = "AIzaSyA25WB_mlRL8tPj-_WD2-ieNkF7NSHRnuI".trim(); // Ensure no trailing spaces

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "soapfold.firebaseapp.com",
  projectId: "soapfold",
  storageBucket: "soapfold.appspot.com",
  messagingSenderId: "192181548467",
  appId: "1:192181548467:web:8gek6h4l6na8roqafikh5id12qojo8ii"
};

// Initialize Firebase
let app;
let auth = null;
let db = null;
let storage = null;

try {
  console.log("Initializing Firebase with API key:", API_KEY);
  console.log("Firebase config:", JSON.stringify(firebaseConfig));
  
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");
  
  try {
    // Initialize Auth with AsyncStorage persistence
    console.log("Attempting to initialize Firebase Auth with AsyncStorage persistence");
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log("Firebase auth initialized successfully with persistence");
    
    // Verify auth was initialized properly
    if (!auth) {
      throw new Error("Auth object is null after initialization");
    }
  } catch (authError) {
    console.error('Firebase auth initialization error:', authError);
    console.error('Error name:', authError.name);
    console.error('Error message:', authError.message);
    console.error('Error code:', authError.code);
    console.error('Error stack:', authError.stack);
    
    // Fallback to regular auth without persistence if there's an issue
    try {
      console.log("Attempting fallback to default auth initialization");
      auth = getAuth(app);
      console.log("Firebase auth initialized with default settings (memory persistence)");
    } catch (fallbackError) {
      console.error('Firebase fallback auth initialization error:', fallbackError);
    }
  }
  
  try {
    // Initialize Firestore
    db = getFirestore(app);
    console.log("Firebase Firestore initialized successfully");
  } catch (dbError) {
    console.error('Firebase Firestore initialization error:', dbError);
  }
  
  try {
    // Initialize Storage
    storage = getStorage(app);
    console.log("Firebase Storage initialized successfully");
  } catch (storageError) {
    console.error('Firebase Storage initialization error:', storageError);
  }
  
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // We'll handle this error in the app component
  setTimeout(() => {
    Alert.alert(
      "Firebase Error",
      "There was a problem connecting to our services. Please restart the app or check your internet connection."
    );
  }, 1000);
}

// Export with defaults in case initialization failed
export { 
  auth, 
  db, 
  storage, 
  PhoneAuthProvider,
  firebaseConfig
};