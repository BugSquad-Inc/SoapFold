import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import Constants from 'expo-constants';

// Your web app's Firebase configuration
const API_KEY = "AIzaSyA25WB_mlRL8tPj-_WD2-ieNkF7NSHRnuI";

// Explicitly define which services to use
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "soapfold-app.firebaseapp.com",
  projectId: "soapfold-app",
  storageBucket: "soapfold-app.appspot.com",
  messagingSenderId: "681509346490",
  appId: "1:681509346490:web:placeholder123456",
  // Explicitly disable Firestore
  databaseURL: "none", // Force no database initialization
  useFirestore: false // Custom flag to ensure we don't use Firestore 
};

// Initialize Firebase
let app;
let auth = null;
let storage = null;

try {
  console.log("Initializing Firebase with specific services only");
  
  // Check if app is already initialized to avoid duplicate initialization
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully");
  } else {
    app = getApps()[0];
    console.log("Using existing Firebase app");
  }
  
  // Initialize only the services we need
  auth = getAuth(app);
  console.log("Firebase auth initialized successfully");
  
  storage = getStorage(app);
  console.log("Firebase Storage initialized successfully");
  
  // Explicitly log that we're not using Firestore
  console.log("IMPORTANT: Firestore is NOT being initialized - using AsyncStorage instead");
  
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.error('Error details:', JSON.stringify(error, null, 2));
  
  setTimeout(() => {
    Alert.alert(
      "Firebase Error",
      "There was a problem connecting to our services. Please restart the app or check your internet connection."
    );
  }, 1000);
}

// Function to verify Firebase is initialized
const verifyFirebaseInitialized = () => {
  const isInitialized = {
    app: !!app,
    auth: !!auth,
    storage: !!storage
  };
  
  console.log('Firebase initialization status:', isInitialized);
  return isInitialized;
};

// Save user data to AsyncStorage
const saveUserToLocalStorage = async (user) => {
  if (!user) return;
  
  try {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
      photoURL: user.photoURL,
      lastUpdated: Date.now()
    };
    
    await AsyncStorage.setItem('@user', JSON.stringify(userData));
    console.log('User data saved to AsyncStorage successfully');
    return userData;
  } catch (error) {
    console.error('Error saving user to AsyncStorage:', error);
    return null;
  }
};

// Save additional user information to AsyncStorage
const saveUserDataToLocalStorage = async (userData) => {
  if (!userData || !userData.uid) return null;
  
  try {
    await AsyncStorage.setItem('@userData', JSON.stringify({
      ...userData,
      lastUpdated: Date.now()
    }));
    console.log('Additional user data saved to AsyncStorage');
    return userData;
  } catch (error) {
    console.error('Error saving additional user data to AsyncStorage:', error);
    return null;
  }
};

// Get user from AsyncStorage
const getUserFromLocalStorage = async () => {
  try {
    const userJson = await AsyncStorage.getItem('@user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting user from AsyncStorage:', error);
    return null;
  }
};

// Get full user data from AsyncStorage
const getUserDataFromLocalStorage = async () => {
  try {
    const userDataJson = await AsyncStorage.getItem('@userData');
    return userDataJson ? JSON.parse(userDataJson) : null;
  } catch (error) {
    console.error('Error getting user data from AsyncStorage:', error);
    return null;
  }
};

// Clear user from AsyncStorage on logout
const clearUserFromLocalStorage = async () => {
  try {
    const keys = ['@user', '@userData'];
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
    console.log('User data cleared from AsyncStorage');
  } catch (error) {
    console.error('Error clearing user from AsyncStorage:', error);
  }
};

// Export all services
export { 
  auth,
  storage,
  verifyFirebaseInitialized,
  saveUserToLocalStorage,
  saveUserDataToLocalStorage,
  getUserFromLocalStorage,
  getUserDataFromLocalStorage,
  clearUserFromLocalStorage
};