import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, getUserFromFirestore, createUserInFirestore, updateUserInFirestore } from '../config/firebase';

// Configure Google Sign-in
export const configureGoogleSignIn = () => {
  try {
    GoogleSignin.configure({
      // Use the web client ID from google-services.json
      webClientId: '192181548467-1bv6p70mdajjndfej7miimbri4e7blpr.apps.googleusercontent.com',
      offlineAccess: true,
      // Add scopes if needed
      scopes: ['profile', 'email'],
      // Add forceCodeForRefreshToken for better token handling
      forceCodeForRefreshToken: true,
    });
    console.log('[Google Sign-in] Configuration successful');
  } catch (error) {
    console.error('[Google Sign-in] Configuration error:', error);
    throw error;
  }
};

// Handle Google Sign-in
export const handleGoogleSignIn = async () => {
  try {
    console.log('[Google Sign-in] Starting sign-in process...');
    
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log('[Google Sign-in] Play Services check passed');
    
    // Sign in with Google
    const userInfo = await GoogleSignin.signIn();
    console.log('[Google Sign-in] Raw user info:', userInfo);

    if (!userInfo) {
      throw new Error('No user info received from Google Sign-in');
    }

    // Get the ID token
    const { idToken } = await GoogleSignin.getTokens();
    console.log('[Google Sign-in] ID token received');

    if (!idToken) {
      throw new Error('No ID token received from Google Sign-in');
    }

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);
    console.log('[Google Sign-in] Created Google credential');

    // Sign-in the user with the credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    console.log('[Google Sign-in] Firebase auth successful');
    
    // Check if user exists in Firestore
    const existingUserData = await getUserFromFirestore(userCredential.user.uid);
    
    if (!existingUserData) {
      console.log('[Google Sign-in] Creating new user in Firestore');
      // Create a new user record for Google Sign-In
      const userData = {
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName || userInfo.name || userCredential.user.email.split('@')[0],
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL || userInfo.photo,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        location: 'Default Location',
        provider: 'google.com'
      };
      
      await createUserInFirestore(userData);
      console.log('[Google Sign-in] New user created in Firestore');
    } else {
      console.log('[Google Sign-in] Updating existing user in Firestore');
      // Update lastLogin for existing user
      await updateUserInFirestore(userCredential.user.uid, {
        lastLogin: new Date().toISOString(),
        displayName: userCredential.user.displayName || userInfo.name || existingUserData.displayName,
        photoURL: userCredential.user.photoURL || userInfo.photo || existingUserData.photoURL
      });
    }

    return userCredential.user;
  } catch (error) {
    console.error('[Google Sign-in] Error details:', {
      code: error.code,
      message: error.message,
      name: error.name,
      stack: error.stack,
      userInfo: error.userInfo
    });

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('User cancelled the login flow');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Sign in is in progress already');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Play services not available or outdated');
    } else if (error.code === 'auth/argument-error') {
      throw new Error('Google Sign-in configuration error. Please check your Firebase configuration.');
    } else {
      throw error;
    }
  }
};

// Sign out from Google
export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    console.log('[Google Sign-in] Signed out successfully');
  } catch (error) {
    console.error('[Google Sign-in] Error signing out:', error);
    throw error;
  }
}; 