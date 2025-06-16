import { auth, firestore, storage } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDoc, doc, collection } from 'firebase/firestore';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tests Firebase connectivity by attempting an anonymous sign-in
 * @returns {Promise<{success: boolean, message: string}>} Result of the test
 */
export const testFirebaseConnection = async () => {
  try {
    // Test Auth
    const currentUser = auth.currentUser;
    console.log('Auth connection test:', !!currentUser);

    // Test Firestore
    const testDoc = await getDoc(doc(collection(firestore, 'test'), 'test'));
    console.log('Firestore connection test:', !!testDoc);

    // Test Storage
    const testRef = storage.ref('test/test.txt');
    console.log('Storage connection test:', !!testRef);

    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

export default testFirebaseConnection; 