import { auth, db } from '../config/firebase';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';

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
    
    // Try to access Firestore
    if (db) {
      try {
        const testQuery = query(collection(db, 'users'), limit(1));
        await getDocs(testQuery);
        console.log("Firestore access successful");
      } catch (firestoreError) {
        console.error("Firestore access error:", firestoreError);
        return { 
          success: true, 
          message: "Auth connection successful, but Firestore access failed. This might be due to security rules." 
        };
      }
    }
    
    return { 
      success: true, 
      message: "Firebase connection successful." 
    };
    
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return { 
      success: false, 
      message: `Connection error: ${error.code} - ${error.message}` 
    };
  }
};

export default testFirebaseConnection; 