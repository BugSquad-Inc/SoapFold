import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth, storage, db, getUserFromFirestore, createUserInFirestore, updateUserInFirestore, verifyFirebaseInitialized } from './config/firebase';
import { configureGoogleSignIn } from './config/authService';
import { useState, useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import FirebaseVerifier from './components/FirebaseVerifier';
import { useLoadFonts } from './utils/fonts';
import { theme } from './utils/theme';
import { ThemeProvider } from './utils/ThemeContext';
import ThemedStatusBar from './components/ThemedStatusBar';
import { LoadingProvider } from './contexts/LoadingContext';
import React from 'react';
import rnAuth from '@react-native-firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';

// Auth Screens
import OnboardingScreen from './screens/Onboarding/OnboardingScreen';
import PhoneSignInScreen from './screens/Authentication/PhoneSignInScreen';
import VerifyCodeScreen from './screens/Authentication/VerifyCodeScreen';
import SignInScreen from './screens/Authentication/SignInScreen';
import SignUpScreen from './screens/Authentication/SignupScreen';
import ForgotPasswordScreen from './screens/Authentication/ForgotPasswordScreen';

// Main App Screens
import HomeScreen from './screens/Main/HomeScreen';
import SettingsScreen from './screens/Profile/SettingsScreen';
import ErrorBoundary from './components/ErrorBoundary';
import CategoryScreen from './screens/Service/CategoryScreen';
import CalendarScreen from './screens/Booking/CalendarScreen';
import CartScreen from './screens/Order/CartScreen';

// New Screens for the flows
import RedeemScreen from './screens/Payment/RedeemScreen';
import OffersScreen from './screens/Offer/OffersScreen';
import ServiceWithOffersScreen from './screens/Offer/ServiceWithOffersScreen';
import ServiceScreen from './screens/Service/ServiceScreen';
import ClothesScreen from './screens/Profile/ClothesScreen';
// import PaymentScreen from './screens/PaymentScreen';
// import RazorpayScreen from './screens/RazorpayScreen';
import PaymentSuccessScreen from './screens/Payment/PaymentSuccessScreen';
import RecentOrdersScreen from './screens/Order/RecentOrdersScreen';

// New Laundry Service Screens
import ServiceCategoryScreen from './screens/Service/ServiceCategoryScreen';
import ServiceDetailScreen from './screens/Service/ServiceDetailScreen';
import BookingScreen from './screens/Booking/BookingScreen';
import BookingConfirmationScreen from './screens/Booking/BookingConfirmationScreen';
import OrderDetailScreen from './screens/Order/OrderDetailScreen';

// Import BottomTabNavigator
import BottomTabNavigator from './navigation/BottomTabNavigator';
import OrdersNavigator from './navigation/OrdersNavigator';

const RootStack = createNativeStackNavigator();

// Simple SplashScreen component
const SplashScreen = () => (
  <View style={styles.splashContainer}>
    <ActivityIndicator size="large" color="#243D6E" />
  </View>
);

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigationRef = useRef(null);

  useEffect(() => {
    console.log('[App] Setting up auth state listener');
    const unsubscribe = rnAuth().onAuthStateChanged(async (user) => {
      console.log('[App] Auth state changed:', user ? 'User logged in' : 'No user');
      
      if (user) {
        try {
          console.log('[App] Getting user data from Firestore');
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('[App] User data from Firestore:', userData);
            
            // Update last login
            await updateDoc(userDocRef, {
              lastLogin: serverTimestamp()
            });
            
            setUserInfo({
              ...userData,
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            });
          } else {
            console.log('[App] No user document found in Firestore');
            setUserInfo(null);
          }
        } catch (error) {
          console.error('[App] Error getting user data:', error);
          setUserInfo(null);
        }
      } else {
        console.log('[App] No authenticated user');
        setUserInfo(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('[App] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  if (loading) {
    console.log('[App] Loading state, showing splash screen');
    return <SplashScreen />;
  }

  console.log('[App] Rendering with userInfo:', userInfo ? 'User logged in' : 'No user');

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false
        }}
      >
        {userInfo ? (
          <RootStack.Screen 
            name="Main" 
            component={AppNavigator}
            options={{
              animation: 'fade',
              gestureEnabled: false
            }}
          />
        ) : (
          <RootStack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{
              animation: 'fade',
              gestureEnabled: false
            }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8'
  }
});

export default App;