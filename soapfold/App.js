import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform, Text, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth, storage, db, getUserFromFirestore, createUserInFirestore, updateUserInFirestore } from './config/firebase';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { MaterialIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import Constants from 'expo-constants';
import FirebaseVerifier from './components/FirebaseVerifier';
import { useLoadFonts } from './utils/fonts';
import { theme } from './utils/theme';
import { ThemeProvider } from './utils/ThemeContext';
import ThemedStatusBar from './components/ThemedStatusBar';
import { LoadingProvider } from './contexts/LoadingContext';
import React from 'react';

// Auth Screens
import OnboardingScreen from './screens/OnboardingScreen';
import PhoneSignInScreen from './screens/PhoneSignInScreen';
import VerifyCodeScreen from './screens/VerifyCodeScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// Main App Screens
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import ErrorBoundary from './components/ErrorBoundary';
import CategoryScreen from './screens/CategoryScreen';
import CalendarScreen from './screens/CalendarScreen';
import CartScreen from './screens/CartScreen';

// New Screens for the flows
import RedeemScreen from './screens/RedeemScreen';
import OffersScreen from './screens/OffersScreen';
import ServiceWithOffersScreen from './screens/ServiceWithOffersScreen';
import ServiceScreen from './screens/ServiceScreen';
import ClothesScreen from './screens/ClothesScreen';
// import PaymentScreen from './screens/PaymentScreen';
// import RazorpayScreen from './screens/RazorpayScreen';
import PaymentSuccessScreen from './screens/PaymentSuccessScreen';
import RecentOrdersScreen from './screens/RecentOrdersScreen';

// New Laundry Service Screens
import ServiceCategoryScreen from './screens/ServiceCategoryScreen';
import ServiceDetailScreen from './screens/ServiceDetailScreen';
import BookingScreen from './screens/BookingScreen';
import BookingConfirmationScreen from './screens/BookingConfirmationScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';

// Import BottomTabNavigator
import BottomTabNavigator from './navigation/BottomTabNavigator';
import OrdersNavigator from './navigation/OrdersNavigator';

WebBrowser.maybeCompleteAuthSession();

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

// Update redirect URI to match your Expo development URL
const redirectUri = 'https://auth.expo.io/@soapfold/soapfold';

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
      <AppStack.Screen 
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

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fontsLoaded = useLoadFonts();

  // Google Sign-in configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '391415088926-02i9hua9l1q05c1pm8ejvkc1i98e2ot9.apps.googleusercontent.com',
    androidClientId: '391415088926-02i9hua9l1q05c1pm8ejvkc1i98e2ot9.apps.googleusercontent.com',
    webClientId: '391415088926-02i9hua9l1q05c1pm8ejvkc1i98e2ot9.apps.googleusercontent.com',
  });

  useEffect(() => {
    const setupAuthListener = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Get user data from Firestore
            const firestoreUserData = await getUserFromFirestore(user.uid);
            
            let userData;
            
            if (firestoreUserData) {
              // Update lastLogin in Firestore
              userData = {
                ...firestoreUserData,
                lastLogin: new Date().toISOString()
              };
              await updateUserInFirestore(user.uid, { lastLogin: new Date().toISOString() });
              console.log('User data from Firestore:', userData.displayName);
            } else {
              // Create new user in Firestore
              userData = {
                uid: user.uid,
                displayName: user.displayName || user.email.split('@')[0],
                email: user.email,
                photoURL: user.photoURL,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                location: 'Default Location'
              };
              
              console.log('Creating new user in Firestore:', userData.displayName);
              await createUserInFirestore(userData);
            }
            
            // Set the authenticated user
            setUserInfo(user);
          } catch (error) {
            console.error('Error handling user data in auth state change:', error);
            // Still set the user even if there was an error
            setUserInfo(user);
          }
        } else {
          setUserInfo(null);
        }
        setIsLoading(false);
      });

      return unsubscribe;
    };

    setupAuthListener();
  }, []);

  // Handle Google Sign-in
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      console.log("Got ID token:", id_token ? "Yes" : "No");
      
      if (id_token) {
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential)
          .then(async (result) => {
            console.log('Google sign in successful:', result.user.email);
            
            try {
              // Check if user exists in Firestore
              const existingUserData = await getUserFromFirestore(result.user.uid);
              
              if (!existingUserData) {
                // Create a new user record for Google Sign-In
                const userData = {
                  uid: result.user.uid,
                  displayName: result.user.displayName || result.user.email.split('@')[0],
                  email: result.user.email,
                  photoURL: result.user.photoURL,
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                  location: 'Default Location'
                };
                
                console.log('Creating Google user in Firestore:', userData.displayName);
                await createUserInFirestore(userData);
              } else {
                // Update lastLogin for existing user
                await updateUserInFirestore(result.user.uid, {
                  lastLogin: new Date().toISOString()
                });
              }
            } catch (error) {
              console.error('Error handling Google sign-in user data:', error);
            }
            
            setUserInfo(result.user);
          })
          .catch((error) => {
            console.error('Error signing in with Google:', error.message);
          });
      } else {
        console.error('No ID token received in response');
      }
    }
  }, [response]);

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#8E44AD" />
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
                {isLoading ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                  </View>
                ) : (
                  <RootStack.Navigator screenOptions={{ headerShown: false }}>
                    {userInfo ? (
                      <RootStack.Screen name="Main" component={AppNavigator} />
                    ) : (
                      <RootStack.Screen name="Auth" component={AuthNavigator} />
                    )}
                  </RootStack.Navigator>
                )}
              </NavigationContainer>
            </ErrorBoundary>
          </SafeAreaProvider>
        </LoadingProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;