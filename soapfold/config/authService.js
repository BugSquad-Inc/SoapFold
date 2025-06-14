import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getUserFromFirestore, createUserInFirestore, updateUserInFirestore } from './firebase';

// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  try {
    console.log('[Google Sign-In] Configuring Google Sign-In...');
    console.log('[Google Sign-In] Web Client ID:', '192181548467-1bv6p70mdajjndfej7miimbri4e7blpr.apps.googleusercontent.com');
    
    GoogleSignin.configure({
      webClientId: '192181548467-1bv6p70mdajjndfej7miimbri4e7blpr.apps.googleusercontent.com', // Your web client ID
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    
    console.log('[Google Sign-In] Configuration completed successfully');
  } catch (error) {
    console.error('[Google Sign-In] Configuration failed:', error);
    throw error;
  }
};

// Google Sign-In function following official documentation
export const signInWithGoogle = async () => {
  try {
    console.log('[Google Sign-In] Starting Google Sign-In process...');
    
    // Check if your device supports Google Play
    console.log('[Google Sign-In] Checking Google Play Services...');
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log('[Google Sign-In] Google Play Services check passed');
    
    // Get the users ID token
    console.log('[Google Sign-In] Requesting Google Sign-In...');
    const signInResult = await GoogleSignin.signIn();
    console.log('[Google Sign-In] Google Sign-In completed, processing result...');

    // Try the new style of google-sign in result, from v13+ of that module
    let idToken = signInResult.data?.idToken;
    if (!idToken) {
      // if you are using older versions of google-signin, try old style result
      idToken = signInResult.idToken;
    }
    if (!idToken) {
      throw new Error('No ID token found');
    }
    
    console.log('[Google Sign-In] ID token obtained successfully');

    // Create a Google credential with the token
    console.log('[Google Sign-In] Creating Firebase credential...');
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    console.log('[Google Sign-In] Signing in to Firebase...');
    const userCredential = await signInWithCredential(getAuth(), googleCredential);
    console.log('[Google Sign-In] Firebase sign-in successful:', userCredential.user.email);
    
    // Handle user data in Firestore
    console.log('[Google Sign-In] Handling user data in Firestore...');
    await handleGoogleUserData(userCredential.user);
    
    console.log('[Google Sign-In] Google Sign-In process completed successfully');
    return userCredential.user;
  } catch (error) {
    console.error('[Google Sign-In] Error during sign-in process:', error);
    throw error;
  }
};

// Handle Google user data in Firestore
const handleGoogleUserData = async (user) => {
  try {
    // Check if user exists in Firestore
    const existingUserData = await getUserFromFirestore(user.uid);
    
    if (!existingUserData) {
      // Create new user in Firestore
      const userData = {
        uid: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        location: 'Default Location',
        authProvider: 'google'
      };
      
      await createUserInFirestore(userData);
      console.log('New Google user created in Firestore:', userData.displayName);
    } else {
      // Update last login for existing user
      await updateUserInFirestore(user.uid, {
        lastLogin: new Date().toISOString(),
        authProvider: 'google'
      });
      console.log('Existing Google user updated in Firestore:', user.displayName);
    }
  } catch (error) {
    console.error('Error handling Google user data:', error);
    // Don't throw error here as the user is already signed in
  }
};

// Sign out function
export const signOut = async () => {
  try {
    // Sign out from Google Sign-In
    await GoogleSignin.signOut();
    
    // Sign out from Firebase
    await getAuth().signOut();
    
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Check if user is signed in
export const isUserSignedIn = () => {
  return getAuth().currentUser !== null;
};

// Get current user
export const getCurrentUser = () => {
  return getAuth().currentUser;
};

// Phone authentication functions
export const signInWithPhoneNumber = async (phoneNumber) => {
  try {
    const confirmation = await getAuth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  } catch (error) {
    console.error('Phone sign-in error:', error);
    throw error;
  }
};

export const confirmPhoneCode = async (confirmation, code) => {
  try {
    const result = await confirmation.confirm(code);
    await handlePhoneUserData(result.user);
    return result.user;
  } catch (error) {
    console.error('Phone code confirmation error:', error);
    throw error;
  }
};

// Handle phone user data in Firestore
const handlePhoneUserData = async (user) => {
  try {
    const existingUserData = await getUserFromFirestore(user.uid);
    
    if (!existingUserData) {
      const userData = {
        uid: user.uid,
        displayName: user.displayName || `User_${user.uid.slice(-6)}`,
        phoneNumber: user.phoneNumber,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        location: 'Default Location',
        authProvider: 'phone'
      };
      
      await createUserInFirestore(userData);
      console.log('New phone user created in Firestore:', userData.displayName);
    } else {
      await updateUserInFirestore(user.uid, {
        lastLogin: new Date().toISOString(),
        authProvider: 'phone'
      });
      console.log('Existing phone user updated in Firestore:', user.displayName);
    }
  } catch (error) {
    console.error('Error handling phone user data:', error);
  }
}; 