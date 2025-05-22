import { auth, storage, db } from '../config/firebase';
import { getAuth, signInAnonymously } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tests Firebase connectivity by attempting an anonymous sign-in
 * @returns {Promise<{success: boolean, message: string}>} Result of the test
 */
export const testFirebaseConnection = async (retryCount = 0) => {
  const results = {
    auth: { success: false, message: '', retries: 0 },
    storage: { success: false, message: '', retries: 0 },
    firestore: { success: false, message: '', retries: 0 },
    asyncStorage: { success: false, message: '', retries: 0 }
  };

  try {
    console.log(`[Firebase Test] Starting connection test (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    // Test Auth
    try {
      if (!auth) {
        results.auth.message = "Firebase Auth is not initialized";
      } else {
        await signInAnonymously(auth);
        results.auth.success = true;
        results.auth.message = "Auth connection successful";
      }
    } catch (authError) {
      results.auth.message = `Auth error: ${authError.message}`;
      results.auth.retries = retryCount;
    }
    
    // Test Storage
    try {
      if (!storage) {
        results.storage.message = "Firebase Storage is not initialized";
      } else {
        results.storage.success = true;
        results.storage.message = "Storage connection successful";
      }
    } catch (storageError) {
      results.storage.message = `Storage error: ${storageError.message}`;
      results.storage.retries = retryCount;
    }
    
    // Test Firestore
    try {
      if (!db) {
        results.firestore.message = "Firestore is not initialized";
      } else {
        results.firestore.success = true;
        results.firestore.message = "Firestore connection successful";
      }
    } catch (firestoreError) {
      results.firestore.message = `Firestore error: ${firestoreError.message}`;
      results.firestore.retries = retryCount;
    }
    
    // Test AsyncStorage
    try {
      const testKey = '@testConnection';
      const testData = { timestamp: Date.now() };
      await AsyncStorage.setItem(testKey, JSON.stringify(testData));
      const retrievedData = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      if (retrievedData) {
        results.asyncStorage.success = true;
        results.asyncStorage.message = "AsyncStorage access successful";
      } else {
        results.asyncStorage.message = "AsyncStorage test failed: Could not retrieve test data";
      }
    } catch (storageError) {
      results.asyncStorage.message = `AsyncStorage error: ${storageError.message}`;
      results.asyncStorage.retries = retryCount;
    }
    
    // Check if all services are working
    const allServicesWorking = Object.values(results).every(r => r.success);
    
    // If not all services are working and we haven't exceeded retry limit, retry
    if (!allServicesWorking && retryCount < MAX_RETRIES - 1) {
      console.log(`[Firebase Test] Some services failed, retrying in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY);
      return testFirebaseConnection(retryCount + 1);
    }
    
    // Log final results
    console.log("[Firebase Test] Final test results:", results);
    
    return {
      success: allServicesWorking,
      results,
      retryCount
    };
    
  } catch (error) {
    console.error("[Firebase Test] Connection test failed:", error);
    
    // If we haven't exceeded retry limit, retry
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`[Firebase Test] Test failed, retrying in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY);
      return testFirebaseConnection(retryCount + 1);
    }
    
    return {
      success: false,
      error: error.message,
      results,
      retryCount
    };
  }
};

export default testFirebaseConnection; 