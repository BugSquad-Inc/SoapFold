import { initializeApp } from "firebase/app";
import { getAuth, PhoneAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA25WB_mlRL8tPj-_WD2-ieNkF7NSHRnuI",
  authDomain: "soapfold.firebaseapp.com",
  projectId: "soapfold",
  storageBucket: "soapfold.appspot.com",
  messagingSenderId: "192181548467",
  appId: "1:192181548467:web:8gek6h4l6na8roqafikh5id12qojo8ii"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Handle initialization error
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Enable phone authentication
auth.settings = {
  appVerificationDisabledForTesting: true // Set to false in production
};

export { auth, db, storage, PhoneAuthProvider };