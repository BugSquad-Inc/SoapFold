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

const Stack = createNativeStackNavigator();

// Helper function for logging initialization
const logInit = (message, ...args) => {
  console.log('[App Init]', message, ...args);
};

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
    initialRouteName="SignIn"
  >
    <Stack.Screen 
      name="SignIn" 
      component={SignInScreen}
      options={{
        animation: 'fade',
      }}
    />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="PhoneSignIn" component={PhoneSignInScreen} />
    <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Main App Stack
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen 
      name="Main" 
      component={BottomTabNavigator}
      options={{
        animation: 'fade',
      }}
    />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="ServiceCategoryScreen" component={CategoryScreen} />
    <Stack.Screen name="Calendar" component={CalendarScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Redeem" component={RedeemScreen} />
    <Stack.Screen name="Offers" component={OffersScreen} />
    <Stack.Screen name="ServiceWithOffers" component={ServiceWithOffersScreen} />
    <Stack.Screen name="Service" component={ServiceScreen} />
    <Stack.Screen name="Clothes" component={ClothesScreen} />
    <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    <Stack.Screen name="RecentOrders" component={RecentOrdersScreen} />
    <Stack.Screen name="ServiceCategory" component={ServiceCategoryScreen} />
    <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);

// Root Navigator
const RootNavigator = ({ userInfo, hasSeenOnboarding, onOnboardingComplete }) => {
  console.log('RootNavigator render - hasSeenOnboarding:', hasSeenOnboarding);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!hasSeenOnboarding ? (
        <Stack.Screen 
          name="Onboarding"
          options={{
            animation: 'fade',
          }}
        >
          {(props) => (
            <OnboardingScreen 
              {...props}
              markOnboardingAsSeen={onOnboardingComplete}
            />
          )}
        </Stack.Screen>
      ) : !userInfo ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthStack}
          options={{
            animation: 'fade',
            gestureEnabled: false, // Prevent going back to onboarding
          }}
        />
      ) : (
        <Stack.Screen 
          name="MainApp" 
          component={MainStack}
          options={{
            animation: 'fade',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

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

        // Configure Google Sign-in first
        try {
          configureGoogleSignIn();
          logInit('Google Sign-in configured successfully');
        } catch (error) {
          console.error('Google Sign-in configuration error:', error);
          throw new Error('Failed to configure Google Sign-in: ' + error.message);
        }

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
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [fontsLoaded]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userData = await getUserFromFirestore(user.uid);
          setUserInfo(userData || user);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserInfo(user);
        }
      } else {
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    console.log('handleOnboardingComplete called, current hasSeenOnboarding:', hasSeenOnboarding);
    if (!hasSeenOnboarding) {
      setHasSeenOnboarding(true);
      console.log('hasSeenOnboarding set to true');
    }
  };

  // Add effect to monitor hasSeenOnboarding changes
  useEffect(() => {
    console.log('hasSeenOnboarding changed:', hasSeenOnboarding);
  }, [hasSeenOnboarding]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialIcons name="error-outline" size={48} color="red" />
        <Text style={{ marginTop: 16, textAlign: 'center', color: 'red' }}>
          {initError}
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
          }}
          onPress={() => window.location.reload()}
        >
          <Text style={{ color: 'white' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <LoadingProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <ThemedStatusBar />
                <RootNavigator 
                  userInfo={userInfo} 
                  hasSeenOnboarding={hasSeenOnboarding}
                  onOnboardingComplete={handleOnboardingComplete}
                />
              </NavigationContainer>
            </SafeAreaProvider>
          </LoadingProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
