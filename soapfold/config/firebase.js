import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, collection, addDoc, updateDoc, getDoc, getDocs, query, where, doc, deleteDoc, orderBy, serverTimestamp, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import Constants from 'expo-constants';

// Your web app's Firebase configuration
const API_KEY = "AIzaSyA25WB_mlRL8tPj-_WD2-ieNkF7NSHRnuI";

// Explicitly define which services to use


const firebaseConfig = {
  apiKey: "AIzaSyDzRW7AN0PJOdsx-jw6aHoZZpZl51Ww1pg",
  authDomain: "soapfold.firebaseapp.com",
  projectId: "soapfold",
  storageBucket: "soapfold.firebasestorage.app",
  messagingSenderId: "192181548467",
  appId: "1:192181548467:web:f9c4135dcf4b5061a547c6",
  // measurementId: "G-2ZPC7F57KD"
};

// Initialize Firebase
let app;
let auth = null;
let storage = null;
let db = null;

try {
  console.log("Initializing Firebase with specific services");
  
  // Check if app is already initialized to avoid duplicate initialization
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully");
  } else {
    app = getApps()[0];
    console.log("Using existing Firebase app");
  }
  
  // Initialize services
  auth = getAuth(app);
  console.log("Firebase auth initialized successfully");
  
  storage = getStorage(app);
  console.log("Firebase Storage initialized successfully");
  
  db = getFirestore(app);
  console.log("Firestore initialized successfully");
  
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
    storage: !!storage,
    firestore: !!db
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

// ====== FIRESTORE ORDERS FUNCTIONS ======

// Create a new order
const createOrder = async (orderData) => {
  try {
    const orderWithTimestamp = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: orderData.status || 'pending'
    };
    
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    console.log("Order created with ID:", docRef.id);
    
    return { id: docRef.id, ...orderWithTimestamp };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Update an existing order
const updateOrder = async (orderId, updateData) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(orderRef, updatedData);
    console.log("Order updated successfully:", orderId);
    
    return { id: orderId, ...updatedData };
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// Get a single order by ID
const getOrderById = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() };
    } else {
      console.log("No order found with ID:", orderId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

// Get all orders for a customer
const getCustomerOrders = async (customerId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error;
  }
};

// Delete an order
const deleteOrder = async (orderId) => {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
    console.log("Order deleted successfully:", orderId);
    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// User management functions
const createUserInFirestore = async (userData) => {
  try {
    if (!userData || !userData.uid) {
      throw new Error('Invalid user data: Missing user ID');
    }

    // Validate required fields
    const requiredFields = ['email', 'displayName'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Invalid user data: Missing required fields: ${missingFields.join(', ')}`);
    }

    const userRef = doc(db, 'users', userData.uid);
    const userDoc = await getDoc(userRef);

    const userDataToSave = {
      ...userData,
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      // Ensure these fields are always present
      emailVerified: userData.emailVerified || false,
      phoneNumber: userData.phoneNumber || '',
      photoURL: userData.photoURL || '',
      // Add metadata
      _metadata: {
        lastUpdated: serverTimestamp(),
        createdBy: 'app_signup',
        version: '1.0'
      }
    };

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        ...userDataToSave,
        createdAt: serverTimestamp()
      });
      console.log('User created in Firestore successfully');
    } else {
      // Update existing user document
      await updateDoc(userRef, userDataToSave);
      console.log('User updated in Firestore successfully');
    }

    return userDataToSave;
  } catch (error) {
    console.error('Error managing user in Firestore:', error);
    throw new Error(`Failed to save user data: ${error.message}`);
  }
};

const getUserFromFirestore = async (uid) => {
  try {
    if (!uid) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('No user document found in Firestore');
      return null;
    }

    const userData = userDoc.data();
    
    // Validate required fields
    const requiredFields = ['email', 'displayName'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      console.warn(`User document missing required fields: ${missingFields.join(', ')}`);
      // Don't throw error, just log warning
    }

    // Convert Firestore timestamps to ISO strings
    const processedData = {
      ...userData,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      lastLogin: userData.lastLogin?.toDate?.()?.toISOString() || new Date().toISOString()
    };

    return processedData;
  } catch (error) {
    console.error('Error fetching user from Firestore:', error);
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }
};

const updateUserInFirestore = async (uid, updateData) => {
  try {
    if (!uid) {
      throw new Error('User ID is required');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No update data provided');
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User document does not exist');
    }

    // Prepare update data with metadata
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp(),
      _metadata: {
        lastUpdated: serverTimestamp(),
        updatedBy: 'app_update',
        version: '1.0'
      }
    };

    // Update the document
    await updateDoc(userRef, dataToUpdate);
    console.log('User updated in Firestore successfully');

    // Get the updated document
    const updatedDoc = await getDoc(userRef);
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw new Error(`Failed to update user data: ${error.message}`);
  }
};

// Export all services
export { 
  auth,
  storage,
  db,
  verifyFirebaseInitialized,
  saveUserToLocalStorage,
  saveUserDataToLocalStorage,
  getUserFromLocalStorage,
  getUserDataFromLocalStorage,
  clearUserFromLocalStorage,
  // User management functions
  createUserInFirestore,
  getUserFromFirestore,
  updateUserInFirestore,
  // Order functions
  createOrder,
  updateOrder,
  getOrderById,
  getCustomerOrders,
  deleteOrder
};