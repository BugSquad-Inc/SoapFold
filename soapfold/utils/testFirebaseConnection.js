import { auth, storage } from '../config/firebase';
import { getAuth, signInAnonymously } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tests Firebase connectivity by attempting an anonymous sign-in
 * @returns {Promise<{success: boolean, message: string}>} Result of the test
 */
export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");
    
    // Check if auth is initialized
    if (!auth) {
      return { 
        success: false, 
        message: "Firebase Auth is not initialized. Check your configuration." 
      };
    }
    
    // Try to sign in anonymously
    await signInAnonymously(auth);
    console.log("Anonymous auth successful");
    
    // Check if storage is initialized
    if (!storage) {
      return {
        success: false,
        message: "Firebase Storage is not initialized. It might not be exported from firebase.js."
      };
    }
    
    // Log what storage actually is to diagnose issues
    console.log("Firebase Storage instance type:", typeof storage);
    
    // Test AsyncStorage
    try {
      console.log("Testing AsyncStorage...");
      const testData = { test: true, timestamp: Date.now() };
      await AsyncStorage.setItem('@testConnection', JSON.stringify(testData));
      
      const retrievedData = await AsyncStorage.getItem('@testConnection');
      if (!retrievedData) {
        return {
          success: false,
          message: "AsyncStorage test failed: Could not retrieve test data"
        };
      }
      
      // Clean up test data
      await AsyncStorage.removeItem('@testConnection');
      
      return { 
        success: true, 
        message: "Firebase connection and AsyncStorage access successful." 
      };
    } catch (storageError) {
      console.error("AsyncStorage access error:", storageError);
      return { 
        success: false, 
        message: `AsyncStorage access failed: ${storageError.message}` 
      };
    }
    
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return { 
      success: false, 
      message: `Connection error: ${error.code} - ${error.message}` 
    };
  }
};

export default testFirebaseConnection; 