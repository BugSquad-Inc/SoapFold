import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, PhoneAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "soapfold.firebaseapp.com",
  projectId: "soapfold",
  storageBucket: "soapfold.appspot.com",
  messagingSenderId: "192181548467",
  appId: "1:192181548467:web:8gek6h4l6na8roqafikh5id12qojo8ii"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Handle initialization error
}

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Enable phone authentication
auth.settings = {
  appVerificationDisabledForTesting: true // Set to false in production
};

export { auth, db, storage, PhoneAuthProvider };