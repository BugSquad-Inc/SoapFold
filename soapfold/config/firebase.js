import { getApp, initializeApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Firebase if it hasn't been initialized
let app;
try {
  app = getApp();
} catch (error) {
  // Firebase hasn't been initialized yet
  app = initializeApp({
    // Your Firebase config here
  });
}

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase services
const initializeFirebase = async () => {
  try {
    console.log('[Firebase] Starting initialization...');
    
    // Enable offline persistence for Firestore
    await firestore.settings({
      persistence: true,
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
    });
    console.log('[Firebase] Firestore persistence enabled');

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

    console.log('[Firebase] All services initialized successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    console.error('[Firebase] Error details:', JSON.stringify(error, null, 2));
    
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
    console.error('[Firebase] Initialization failed');
  }
});

// Function to verify Firebase initialization status
export const verifyFirebaseInitialized = () => {
  try {
    return {
      auth: !!auth,
      firestore: !!firestore,
      storage: !!storage
    };
  } catch (error) {
    console.error('[Firebase] Error verifying initialization:', error);
    return {
      auth: false,
      firestore: false,
      storage: false
    };
  }
};

export default app;

// ====== FIRESTORE ORDERS FUNCTIONS ======

// Create a new order
const createOrder = async (orderData) => {
  try {
    const orderWithTimestamp = {
      ...orderData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      status: orderData.status || 'pending'
    };
    
    const docRef = await firestore().collection('orders').add(orderWithTimestamp);
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
    const orderRef = firestore().collection('orders').doc(orderId);
    
    const updatedData = {
      ...updateData,
      updatedAt: firestore.FieldValue.serverTimestamp()
    };
    
    await orderRef.update(updatedData);
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
    const orderDoc = await firestore().collection('orders').doc(orderId).get();
    
    if (orderDoc.exists) {
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
    const querySnapshot = await firestore()
      .collection('orders')
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .get();
    
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
    await firestore().collection('orders').doc(orderId).delete();
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

    const userRef = firestore().collection('users').doc(userData.uid);
    const userDoc = await userRef.get();

    const userDataToSave = {
      ...userData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      lastLogin: firestore.FieldValue.serverTimestamp(),
      // Ensure these fields are always present
      emailVerified: userData.emailVerified || false,
      phoneNumber: userData.phoneNumber || '',
      photoURL: userData.photoURL || '',
      // Add metadata
      _metadata: {
        lastUpdated: firestore.FieldValue.serverTimestamp(),
        createdBy: 'app_signup',
        version: '1.0'
      }
    };

    if (!userDoc.exists) {
      // Create new user document
      await userRef.set({
        ...userDataToSave,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      console.log('User created in Firestore successfully');
    } else {
      // Update existing user document
      await userRef.update(userDataToSave);
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

    const userRef = firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
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

    const userRef = firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User document does not exist');
    }

    // Prepare update data with metadata
    const dataToUpdate = {
      ...updateData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      _metadata: {
        lastUpdated: firestore.FieldValue.serverTimestamp(),
        updatedBy: 'app_update',
        version: '1.0'
      }
    };

    // Update the document
    await userRef.update(dataToUpdate);
    console.log('User updated in Firestore successfully');

    // Get the updated document
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw new Error(`Failed to update user data: ${error.message}`);
  }
};

// Export all services
export { 
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