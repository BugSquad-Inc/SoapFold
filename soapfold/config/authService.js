import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getUserFromFirestore, createUserInFirestore, updateUserInFirestore } from './firebase';
import Constants from 'expo-constants';
import { auth } from './firebase';

// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  try {
    console.log('[Google Sign-In] Configuring Google Sign-In...');
    const webClientId = Constants.expoConfig.extra.googleWebClientId || '192181548467-1bv6p70mdajjndfej7miimbri4e7blpr.apps.googleusercontent.com';
    console.log('[Google Sign-In] Web Client ID:', webClientId);
    
    GoogleSignin.configure({
      webClientId: webClientId,
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
    console.log('[AuthService] Starting Google Sign-In process...');
    
    // Check if your device supports Google Play
    console.log('[AuthService] Checking Google Play Services...');
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log('[AuthService] Google Play Services check passed');
    
    // Get the users ID token
    console.log('[AuthService] Requesting Google Sign-In...');
    const { idToken } = await GoogleSignin.signIn();
    console.log('[AuthService] Google Sign-In completed, processing result...');

    if (!idToken) {
      throw new Error('No ID token found');
    }
    
    console.log('[AuthService] ID token obtained successfully');

    // Create a Google credential with the token
    console.log('[AuthService] Creating Firebase credential...');
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    console.log('[AuthService] Signing in to Firebase...');
    const userCredential = await signInWithCredential(auth, googleCredential);
    console.log('[AuthService] Firebase sign-in successful:', userCredential.user.email);
    
    // Handle user data in Firestore
    console.log('[AuthService] Handling user data in Firestore...');
    await handleGoogleUserData(userCredential.user);
    
    console.log('[AuthService] Google Sign-In process completed successfully');
    return userCredential.user;
  } catch (error) {
    console.error('[AuthService] Error during sign-in process:', error);
    if (error.code) {
      console.error('[AuthService] Error code:', error.code);
    }
    if (error.message) {
      console.error('[AuthService] Error message:', error.message);
    }
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
    await auth.signOut();
    
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Check if user is signed in
export const isUserSignedIn = () => {
  return auth.currentUser !== null;
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Phone authentication functions
export const signInWithPhoneNumber = async (phoneNumber) => {
  try {
    console.log('[AuthService] Starting phone sign-in for:', phoneNumber);
    const confirmation = await getAuth().signInWithPhoneNumber(phoneNumber);
    console.log('[AuthService] Phone confirmation received:', confirmation);
    return confirmation;
  } catch (error) {
    console.error('[AuthService] Phone sign-in error:', error);
    console.error('[AuthService] Phone sign-in error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const confirmPhoneCode = async (confirmation, code) => {
  try {
    console.log('[AuthService] Confirming phone code:', code);
    const result = await confirmation.confirm(code);
    console.log('[AuthService] Phone confirmation successful:', JSON.stringify(result, null, 2));
    await handlePhoneUserData(result.user);
    console.log('[AuthService] Phone user data handled, returning user');
    return result.user;
  } catch (error) {
    console.error('[AuthService] Phone code confirmation error:', error);
    console.error('[AuthService] Phone confirmation error details:', JSON.stringify(error, null, 2));
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