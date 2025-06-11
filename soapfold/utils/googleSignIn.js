import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, getUserFromFirestore, createUserInFirestore, updateUserInFirestore } from '../config/firebase';

// Configure Google Sign-in
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '192181548467-1bv6p70mdajjndfej7miimbri4e7blpr.apps.googleusercontent.com', // Get this from your Google Cloud Console
    offlineAccess: true,
  });
};

// Handle Google Sign-in
export const handleGoogleSignIn = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices();
    
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    
    // Check if user exists in Firestore
    const existingUserData = await getUserFromFirestore(userCredential.user.uid);
    
    if (!existingUserData) {
      // Create a new user record for Google Sign-In
      const userData = {
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName || userCredential.user.email.split('@')[0],
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        location: 'Default Location'
      };
      
      await createUserInFirestore(userData);
    } else {
      // Update lastLogin for existing user
      await updateUserInFirestore(userCredential.user.uid, {
        lastLogin: new Date().toISOString()
      });
    }

    return userCredential.user;
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('User cancelled the login flow');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Sign in is in progress already');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Play services not available or outdated');
    } else {
      throw error;
    }
  }
};

// Sign out from Google
export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Error signing out from Google:', error);
  }
}; 