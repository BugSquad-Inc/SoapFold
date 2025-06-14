import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  deleteDoc, 
  orderBy, 
  serverTimestamp, 
  setDoc,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";
import { Alert } from "react-native";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";
import NetInfo from '@react-native-community/netinfo';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.firebaseApiKey || "AIzaSyA25WB_mlRL8tPj-_WD2-ieNkF7NSHRnuI",
  authDomain: "soapfold.firebaseapp.com",
  projectId: "soapfold",
  storageBucket: "soapfold.firebasestorage.app",
  messagingSenderId: "192181548467",
  appId: "1:192181548467:web:f9c4135dcf4b5061a547c6"
};

// Initialize Firebase
let app = null;
let auth = null;
let storage = null;
let db = null;

const initializeFirebase = async () => {
  try {
    console.log("[Firebase] Starting initialization...");
    
    // Check if app is already initialized
    if (!getApps().length) {
      console.log("[Firebase] No existing apps found, initializing new app...");
      app = initializeApp(firebaseConfig);
      console.log("[Firebase] New app initialized successfully");
    } else {
      console.log("[Firebase] Using existing app instance");
      app = getApps()[0];
    }

    // Initialize Auth with persistence
    try {
      console.log("[Firebase] Initializing Auth...");
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log("[Firebase] Auth initialized successfully");
    } catch (authError) {
      console.error("[Firebase] Auth initialization failed:", authError);
      throw new Error(`Auth initialization failed: ${authError.message}`);
    }

    // Initialize Storage
    try {
      console.log("[Firebase] Initializing Storage...");
      storage = getStorage(app);
      console.log("[Firebase] Storage initialized successfully");
    } catch (storageError) {
      console.error("[Firebase] Storage initialization failed:", storageError);
      throw new Error(`Storage initialization failed: ${storageError.message}`);
    }

    // Initialize Firestore with offline persistence
    try {
      console.log("[Firebase] Initializing Firestore...");
      db = getFirestore(app);
      
      // Enable offline persistence
      await enableIndexedDbPersistence(db, {
        synchronizeTabs: true,
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('[Firebase] Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('[Firebase] The current browser does not support persistence.');
        }
      });
      
      console.log("[Firebase] Firestore initialized successfully with offline persistence");
    } catch (firestoreError) {
      console.error("[Firebase] Firestore initialization failed:", firestoreError);
      throw new Error(`Firestore initialization failed: ${firestoreError.message}`);
    }

    // Set up network state monitoring
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('[Firebase] Network connection restored');
      } else {
        console.log('[Firebase] Network connection lost');
        Alert.alert(
          "No Internet Connection",
          "You're currently offline. Some features may be limited until you reconnect.",
          [{ text: "OK" }]
        );
      }
    });

    console.log("[Firebase] All services initialized successfully");
    return true;
  } catch (error) {
    console.error("[Firebase] Initialization error:", error);
    console.error("[Firebase] Error details:", JSON.stringify(error, null, 2));
    
    // Show error alert after a delay to ensure UI is ready
    setTimeout(() => {
      Alert.alert(
        "Firebase Error",
        "There was a problem connecting to our services. Please restart the app or check your internet connection."
      );
    }, 1000);
    
    return false;
  }
};

// Initialize Firebase immediately
initializeFirebase().then(success => {
  if (!success) {
    console.error("[Firebase] Initialization failed");
  }
});

// Function to verify Firebase initialization status
export const verifyFirebaseInitialized = () => {
  try {
    const auth = getAuth();
    const app = auth.app;
    const firestore = getFirestore();
    const storage = getStorage();

    return {
      app: !!app,
      auth: !!auth,
      storage: !!storage,
      firestore: !!firestore
    };
  } catch (error) {
    console.error('Error verifying Firebase initialization:', error);
    return {
      app: false,
      auth: false,
      storage: false,
      firestore: false
    };
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

// Enhanced error handling for Firestore operations
const handleFirestoreError = (error, operation) => {
  console.error(`[Firestore] Error during ${operation}:`, error);
  
  if (error.code === 'failed-precondition') {
    return new Error('The operation failed because the document was modified by another process.');
  } else if (error.code === 'not-found') {
    return new Error('The requested document was not found.');
  } else if (error.code === 'permission-denied') {
    return new Error('You do not have permission to perform this operation.');
  } else if (error.code === 'unavailable') {
    return new Error('The service is currently unavailable. Please check your internet connection.');
  } else {
    return new Error(`An unexpected error occurred: ${error.message}`);
  }
};

// Update the getUserFromFirestore function with better error handling
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
    throw handleFirestoreError(error, 'getUserFromFirestore');
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