import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform, Text, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth, storage, db, getUserFromFirestore, createUserInFirestore, updateUserInFirestore, verifyFirebaseInitialized } from './config/firebase';
import { useState, useEffect } from 'react';
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
import { configureGoogleSignIn } from './utils/googleSignIn';
import React from 'react';

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
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: '#FFFFFF' },
    }}
    initialRouteName="SignIn"
  >
    <AuthStack.Screen
      name="Onboarding"
      options={{ animation: 'fade' }}
      component={OnboardingScreen}
    />
    <AuthStack.Screen
      name="SignIn"
      component={SignInScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AuthStack.Screen
      name="SignUp"
      component={SignUpScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AuthStack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AuthStack.Screen
      name="PhoneSignIn"
      component={PhoneSignInScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AuthStack.Screen
      name="VerifyCode"
      component={VerifyCodeScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </AuthStack.Navigator>
);

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#f8f8f8' },
        animationEnabled: true,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
      }}
    >
      <AppStack.Navigator.Screen 
        name="MainTabs" 
        component={BottomTabNavigator}
        options={{ 
          animation: 'fade', 
          headerShown: false,
          tabBarStyle: { display: isLoading ? 'none' : 'flex' }
        }}
      />
    </AppStack.Navigator>
  );
};

// Add diagnostic logging
const logInit = (message) => {
  console.log(`[App Init] ${message}`);
};

// const App = () => {
//   return <Text>Hello World</Text>;
// };


const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const fontsLoaded = useLoadFonts();

  // Initialize app
  useEffect(() => {
    console.log('useEffect running, fontsLoaded:', fontsLoaded);
    const initializeApp = async () => {
      try {
        logInit('Starting app initialization...');
        
        // Wait for fonts to load
        if (!fontsLoaded) {
          logInit('Waiting for fonts to load...');
          return;
        }
        logInit('Fonts loaded successfully');

        // Configure Google Sign-in
        configureGoogleSignIn();
        logInit('Google Sign-in configured');

        // Check Firebase initialization
        const firebaseStatus = verifyFirebaseInitialized();
        logInit('Firebase status:', firebaseStatus);

        if (!firebaseStatus.app || !firebaseStatus.auth || !firebaseStatus.storage || !firebaseStatus.firestore) {
          throw new Error('Firebase services not properly initialized');
        }
        logInit('Firebase services verified');
        
        setIsInitialized(true);
        logInit('App initialization completed successfully');
      } catch (error) {
        console.error('App initialization error:', error);
        setInitError(error.message);
      }
    };

    initializeApp();
  }, [fontsLoaded]);

  // Auth state listener
  useEffect(() => {
    let unsubscribe;
    
    const setupAuthListener = async () => {
      try {
        logInit('Setting up auth state listener...');
        
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('Auth state changed:', user);
          logInit('Auth state changed:', user ? 'User logged in' : 'No user');
          
          if (user) {
            try {
              // Get user data from Firestore
              const firestoreUserData = await getUserFromFirestore(user.uid);
              
              if (firestoreUserData) {
                // Update lastLogin
                await updateUserInFirestore(user.uid, { 
                  lastLogin: new Date().toISOString() 
                });
                logInit('User data updated in Firestore');
              } else {
                // Create new user
                const userData = {
                  uid: user.uid,
                  displayName: user.displayName || user.email.split('@')[0],
                  email: user.email,
                  photoURL: user.photoURL,
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                  location: 'Default Location'
                };
                
                await createUserInFirestore(userData);
                logInit('New user created in Firestore');
              }
              
              setUserInfo(user);
            } catch (error) {
              console.error('Error handling user data:', error);
              setUserInfo(user); // Still set user even if Firestore operations fail
            }
          } else {
            setUserInfo(null);
          }
          setIsLoading(false);
        });
        
        logInit('Auth state listener setup complete');
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setIsLoading(false);
      }
    };

    setupAuthListener();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Show initialization error
  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 16, marginBottom: 10 }}>
          Initialization Error:
        </Text>
        <Text style={{ color: 'red', fontSize: 14 }}>
          {initError}
        </Text>
        <TouchableOpacity 
          style={{ 
            marginTop: 20, 
            padding: 10, 
            backgroundColor: theme.colors.primary,
            borderRadius: 5
          }}
          onPress={() => {
            setInitError(null);
            setIsInitialized(false);
          }}
        >
          <Text style={{ color: 'white' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading state
  if (!isInitialized || !fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10 }}>Initializing app...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <LoadingProvider>
          <SafeAreaProvider>
            <ErrorBoundary>
              <NavigationContainer>
                <ThemedStatusBar />
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
                  {userInfo ? (
                    <>
                      <RootStack.Screen name="Main" component={AppNavigator} />
                    </>
                  ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                  )}
                </RootStack.Navigator>
              </NavigationContainer>
            </ErrorBoundary>
          </SafeAreaProvider>
        </LoadingProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
