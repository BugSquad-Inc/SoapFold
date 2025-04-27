import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform, Text, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth, storage, saveUserToLocalStorage, saveUserDataToLocalStorage, getUserFromLocalStorage, getUserDataFromLocalStorage, clearUserFromLocalStorage } from './config/firebase';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { MaterialIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import FirebaseVerifier from './components/FirebaseVerifier';
import { useLoadFonts } from './utils/fonts';
import { theme } from './utils/theme';
import { ThemeProvider } from './utils/ThemeContext';
import ThemedStatusBar from './components/ThemedStatusBar';

// Auth Screens
import OnboardingScreen from './screens/OnboardingScreen';
import PhoneSignInScreen from './screens/PhoneSignInScreen';
import VerifyCodeScreen from './screens/VerifyCodeScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// Main App Screens
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
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
import PaymentScreen from './screens/PaymentScreen';
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

const AuthNavigator = ({ promptAsync, hasSeenOnboarding, markOnboardingAsSeen }) => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: '#FFFFFF' },
    }}
    // Only show onboarding for fresh installs, otherwise go straight to SignIn
    initialRouteName={hasSeenOnboarding ? "SignIn" : "Onboarding"}
  >
    <AuthStack.Screen
      name="Onboarding"
      options={{ animation: 'fade' }}
    >
      {(props) => <OnboardingScreen {...props} promptAsync={promptAsync} markOnboardingAsSeen={markOnboardingAsSeen} />}
    </AuthStack.Screen>
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

const AppNavigator = () => (
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
      options={{ animation: 'fade', headerShown: false }}
    />
    
    {/* Payment screen is separate - no bottom navigation */}
    <AppStack.Screen
      name="PaymentScreen"
      component={PaymentScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </AppStack.Navigator>
);

export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFirebaseVerifier, setShowFirebaseVerifier] = useState(__DEV__); // Only show in development
  const [authInitialized, setAuthInitialized] = useState(false);
  const fontsLoaded = useLoadFonts();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "192181548467-18ddv39f0qtr6avibrqo9dna2atrvfb7.apps.googleusercontent.com",
    iosClientId: "681509346490-8gek6h4l6na8roqafikh5id12qojo8ii.apps.googleusercontent.com",
    webClientId: "192181548467-18ddv39f0qtr6avibrqo9dna2atrvfb7.apps.googleusercontent.com",
    scopes: ['profile', 'email'],
    responseType: "id_token",
    extraParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  });

  // Add logging to debug redirect URI
  useEffect(() => {
    console.log('Redirect URI:', 'https://auth.expo.io/@soapfold/soapfold');
  }, []);

  // Check if Firebase auth is initialized
  useEffect(() => {
    const checkFirebaseAuth = async () => {
      try {
        console.log("Checking Firebase auth initialization...");
        console.log("Auth object type:", typeof auth);
        console.log("Auth object available:", !!auth);
        
        if (auth) {
          console.log("Firebase auth is initialized");
          console.log("Current auth implementation:", auth.name || "Unknown");
          setAuthInitialized(true);
        } else {
          console.error("Firebase auth is not initialized");
          console.error("Firebase import status:", JSON.stringify(require('./config/firebase')));
          Alert.alert(
            "Initialization Error",
            "There was a problem setting up the app. Please restart the app."
          );
        }
      } catch (error) {
        console.error("Error checking Firebase auth:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
      } finally {
        // Even if auth failed, we'll move forward and handle errors later
        setAuthInitialized(true);
      }
    };
    
    checkFirebaseAuth();
  }, []);

  // Only set up auth listener if Firebase is initialized
  useEffect(() => {
    let unsubscribe = () => {};
    
    const setupAuthListener = async () => {
      if (!authInitialized) return;
      
      try {
        if (!auth) {
          console.error("Auth is undefined, cannot set up listener");
          setLoading(false);
          return;
        }
        
        // Make sure we're using the initialized auth with persistence
        console.log("Setting up auth state listener with persistence-enabled auth");
        
        // Try to get the current user first to test auth
        const currentUser = auth.currentUser;
        console.log("Current user before listener:", currentUser ? "Signed in" : "Not signed in");
        
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log("Auth state changed:", user ? "User is signed in" : "User is signed out");
          
          if (user) {
            try {
              // Check if user exists in AsyncStorage
              const existingUserData = await getUserDataFromLocalStorage();
              
              let userData;
              
              if (existingUserData && existingUserData.uid === user.uid) {
                // User exists in AsyncStorage, update lastLogin
                userData = {
                  ...existingUserData,
                  lastLogin: new Date().toISOString()
                };
                console.log('User data from AsyncStorage:', userData.displayName);
              } else {
                // User doesn't exist in AsyncStorage yet (might be from Google Sign-In)
                // Create a new user record
                userData = {
                  uid: user.uid,
                  displayName: user.displayName || user.email.split('@')[0],
                  email: user.email,
                  photoURL: user.photoURL,
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                  location: 'Default Location'
                };
                
                console.log('Creating new user in AsyncStorage:', userData.displayName);
              }
              
              // Save the user data
              await saveUserDataToLocalStorage(userData);
              
              // Also save the user auth object for persistence
              await saveUserToLocalStorage(user);
              
              // Set the authenticated user
              setUserInfo(user);
            } catch (error) {
              console.error('Error handling user data in auth state change:', error);
              // Still set the user even if there was an error
              setUserInfo(user);
            }
          } else {
            // User is signed out
            setUserInfo(null);
            await clearUserFromLocalStorage();
            
            // Keep onboarding as seen after logout, don't clear this value
            // This ensures users who have seen onboarding won't see it again after logout
            console.log('User signed out: Keeping onboarding status as seen');
          }
          
          setLoading(false);
        });
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        setLoading(false);
      }
    };

    setupAuthListener();
    
    // Clean up the listener
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [authInitialized]);

  // Check for local user and onboarding status on startup
  useEffect(() => {
    const initApp = async () => {
      console.log('Initializing app...');
      try {
        // This determines when to show the onboarding screen:
        // 1. In development mode: Show onboarding screens when dev server restarts (simulating fresh install)
        // 2. For real devices: Only show onboarding on fresh installs (first app launch)
        // 3. After logout or app reload: Never show onboarding again once user has seen it
        
        // Check if this is a development server restart
        const devServerRestarted = __DEV__ && !await AsyncStorage.getItem('@devServerSession');
        if (devServerRestarted) {
          console.log('Development server restart detected - marking new dev session');
          // Create a session marker for this dev server session
          await AsyncStorage.setItem('@devServerSession', Date.now().toString());
          
          // Check if we should explicitly reset onboarding for this dev session
          const devResetRequested = await AsyncStorage.getItem('@devResetOnboarding') === 'true';
          if (devResetRequested) {
            console.log('Development mode: Explicit onboarding reset requested');
            await AsyncStorage.removeItem('@devResetOnboarding');
            await AsyncStorage.removeItem('@hasSeenOnboarding');
          }
        }
        
        // Now run the normal initialization
        await Promise.all([
          checkLocalUser(),
          checkOnboardingStatus(),
        ]);
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };
    
    initApp();
  }, []);

  const checkLocalUser = async () => {
    try {
      const user = await AsyncStorage.getItem('@user');
      if (user) {
        // If we have a cached user, use it temporarily until Firebase auth state updates
        console.log("Found user in local storage");
        setUserInfo(JSON.parse(user));
      }
    } catch (error) {
      console.error('Error checking local user:', error);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      // In development mode, we can check for a parameter in AsyncStorage
      // that indicates whether we should reset onboarding
      if (__DEV__) {
        const resetOnboarding = await AsyncStorage.getItem('@devResetOnboarding');
        if (resetOnboarding === 'true') {
          // Reset the flag
          await AsyncStorage.removeItem('@devResetOnboarding');
          // Reset the onboarding status
          await AsyncStorage.removeItem('@hasSeenOnboarding');
          setHasSeenOnboarding(false);
          return;
        }
      }
      
      const hasSeenOnboarding = await AsyncStorage.getItem('@hasSeenOnboarding');
      // For fresh installs, this will be null, and we should show onboarding
      // Otherwise, mark as seen so it doesn't show on logout or reload
      const hasSeen = hasSeenOnboarding === 'true';
      setHasSeenOnboarding(hasSeen);
      
      // If value was null (fresh install) and this isn't triggered by a logout,
      // set the value to false to ensure it doesn't repeatedly trigger
      if (!hasSeen && hasSeenOnboarding === null) {
        console.log('First time app launch detected - showing onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to true (don't show onboarding) if there's an error
      setHasSeenOnboarding(true);
    }
  };
  
  // Function to mark onboarding as seen
  const markOnboardingAsSeen = async () => {
    try {
      // Permanently mark onboarding as seen for this app installation
      // This ensures onboarding won't show again on logout or app reload
      await AsyncStorage.setItem('@hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
      
      console.log('User has completed onboarding - permanently marked as seen');
      
      // In development mode, we also note that this session has seen onboarding
      if (__DEV__) {
        await AsyncStorage.setItem('@devSeenOnboarding', 'true');
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

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
              // Check if user exists in AsyncStorage
              const existingUserData = await getUserDataFromLocalStorage();
              
              if (!existingUserData || existingUserData.uid !== result.user.uid) {
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
                
                console.log('Creating Google user in AsyncStorage:', userData.displayName);
                await saveUserDataToLocalStorage(userData);
              } else {
                // Update lastLogin for existing user
                const updatedUserData = {
                  ...existingUserData,
                  lastLogin: new Date().toISOString()
                };
                await saveUserDataToLocalStorage(updatedUserData);
              }
            } catch (error) {
              console.error('Error handling Google sign-in user data:', error);
            }
            
            setUserInfo(result.user);
            await saveUserToLocalStorage(result.user);
          })
          .catch((error) => {
            console.error('Error signing in with Google:', error.message);
          });
      } else {
        console.error('No ID token received in response');
      }
    } else if (response?.type === "error") {
      console.error('Google Sign In Error:', response.error);
    }
  }, [response]);

  if (!authInitialized || !fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#8E44AD" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemedStatusBar />
          <Provider store={store}>
            <NavigationContainer>
              {showFirebaseVerifier && <FirebaseVerifier onDismiss={() => setShowFirebaseVerifier(false)} />}
              <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {userInfo ? (
                  // User is signed in
                  <RootStack.Screen name="App" component={AppNavigator} />
                ) : (
                  // No user is signed in
                  <RootStack.Screen name="Auth">
                    {(props) => (
                      <AuthNavigator 
                        {...props} 
                        promptAsync={promptAsync} 
                        hasSeenOnboarding={hasSeenOnboarding}
                        markOnboardingAsSeen={markOnboardingAsSeen}
                      />
                    )}
                  </RootStack.Screen>
                )}
              </RootStack.Navigator>
            </NavigationContainer>
          </Provider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}