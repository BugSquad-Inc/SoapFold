import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, PhoneAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence } from "@firebase/auth/react-native";
import { Alert } from "react-native";
import Constants from 'expo-constants';

// Your web app's Firebase configuration
const API_KEY = "AIzaSyA25WB_mlRL8tPj-_WD2-ieNkF7NSHRnuI";

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "soapfold-app.firebaseapp.com",
  projectId: "soapfold-app",
  storageBucket: "soapfold-app.appspot.com",
  messagingSenderId: "681509346490",
  appId: "1:681509346490:web:placeholder123456"
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