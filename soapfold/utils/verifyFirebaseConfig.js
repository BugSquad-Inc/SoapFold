import { auth, firestore, storage } from '../config/firebase';

/**
 * Verifies if the Firebase configuration is valid
 * @returns {Promise<boolean>}
 */
export const verifyFirebaseConfig = async () => {
  try {
    // Test Auth
    const currentUser = auth.currentUser;
    console.log('Auth initialized:', !!currentUser);

    // Test Firestore
    const testDoc = await firestore.collection('test').doc('test').get();
    console.log('Firestore initialized:', !!testDoc);

    // Test Storage
    const testRef = storage.ref('test/test.txt');
    console.log('Storage initialized:', !!testRef);

    return true;
  } catch (error) {
    console.error('Firebase verification failed:', error);
    return false;
  }
};

export default verifyFirebaseConfig; 