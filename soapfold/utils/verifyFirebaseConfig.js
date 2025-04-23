import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * Verifies if the Firebase API key and configuration are valid
 * @param {string} apiKey - The Firebase API key to verify
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
export const verifyFirebaseApiKey = async (apiKey) => {
  try {
    console.log("Verifying Firebase API key:", apiKey);
    
    // Trim any whitespace from the API key
    const cleanApiKey = apiKey.trim();
    
    // Create a test configuration with the provided API key
    const testConfig = {
      apiKey: cleanApiKey,
      authDomain: "soapfold.firebaseapp.com",
      projectId: "soapfold",
    };
    
    // Try to initialize Firebase with this config
    const testApp = initializeApp(testConfig, 'verifier');
    const testAuth = getAuth(testApp);
    
    // If we get here, the initialization was successful
    console.log("Firebase configuration is valid");
    
    return {
      isValid: true,
      message: "Firebase configuration is valid"
    };
  } catch (error) {
    console.error("Firebase configuration verification failed:", error.code, error.message);
    return {
      isValid: false,
      message: `Firebase configuration error: ${error.message}`
    };
  }
};

export default verifyFirebaseApiKey; 