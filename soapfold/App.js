import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { MaterialIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Auth Screens
import OnboardingScreen from './screens/OnboardingScreen';
import EmailSignupScreen from './screens/EmailSignupScreen';
import EmailLoginScreen from './screens/EmailLoginScreen';
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

// Import BottomTabNavigator
import BottomTabNavigator from './navigation/BottomTabNavigator';

WebBrowser.maybeCompleteAuthSession();

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

// Update redirect URI to match your Expo development URL
const redirectUri = 'https://auth.expo.io/@soapfold/soapfold';

const AuthNavigator = ({ promptAsync }) => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: '#000' },
    }}
  >
    <AuthStack.Screen
      name="Onboarding"
      options={{ animation: 'fade' }}
    >
      {(props) => <OnboardingScreen {...props} promptAsync={promptAsync} />}
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
      name="EmailSignup"
      component={EmailSignupScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AuthStack.Screen
      name="EmailLogin"
      component={EmailLoginScreen}
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
      contentStyle: { backgroundColor: '#000' },
    }}
  >
    <AppStack.Screen 
      name="MainTabs" 
      component={BottomTabNavigator}
      options={{ animation: 'fade', headerShown: false }}
    />
    <AppStack.Screen
      name="CategoryScreen"
      component={CategoryScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </AppStack.Navigator>
);

export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    checkLocalUser();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User authenticated:', user.email);
        
        try {
          // Check if user exists in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData;
          
          if (userDoc.exists()) {
            // User exists in Firestore, use that data
            userData = userDoc.data();
            console.log('User data from Firestore:', userData.displayName);
            
            // Update lastLogin
            await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
          } else {
            // User doesn't exist in Firestore yet (might be from Google Sign-In)
            // Create a user document
            userData = {
              displayName: user.displayName || user.email.split('@')[0],
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              location: 'Cembung Dafur, Yogyakarta'
            };
            
            console.log('Creating new user in Firestore:', userData.displayName);
            await setDoc(userDocRef, userData);
          }
          
          // Cache the user data
          await AsyncStorage.setItem('@userData', JSON.stringify({
            ...userData,
            // Convert timestamps for storage
            createdAt: userData.createdAt instanceof Date ? userData.createdAt.toISOString() : new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }));
          
          // Set the authenticated user
          setUserInfo(user);
          await AsyncStorage.setItem('@user', JSON.stringify(user));
        } catch (error) {
          console.error('Error handling user data in auth state change:', error);
          // Still set the user even if there was an error
          setUserInfo(user);
          await AsyncStorage.setItem('@user', JSON.stringify(user));
        }
      } else {
        console.log("User is not authenticated");
        setUserInfo(null);
        await AsyncStorage.removeItem('@user');
        await AsyncStorage.removeItem('@userData');
      }
    });

    return () => unsubscribe();
  }, []);

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
              const userDocRef = doc(db, 'users', result.user.uid);
              const userDoc = await getDoc(userDocRef);
              
              if (!userDoc.exists()) {
                // Create a new user document for Google Sign-In
                const userData = {
                  displayName: result.user.displayName || result.user.email.split('@')[0],
                  email: result.user.email,
                  photoURL: result.user.photoURL,
                  createdAt: serverTimestamp(),
                  lastLogin: serverTimestamp(),
                  location: 'Cembung Dafur, Yogyakarta'
                };
                
                console.log('Creating Google user in Firestore:', userData.displayName);
                await setDoc(userDocRef, userData);
                
                // Cache the user data
                await AsyncStorage.setItem('@userData', JSON.stringify({
                  ...userData,
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString()
                }));
              } else {
                // Update lastLogin for existing user
                await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
              }
            } catch (error) {
              console.error('Error handling Google sign-in user data:', error);
            }
            
            setUserInfo(result.user);
            await AsyncStorage.setItem('@user', JSON.stringify(result.user));
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

  const checkLocalUser = async () => {
    try {
      setLoading(true);
      const userJSON = await AsyncStorage.getItem('@user');
      const userData = userJSON ? JSON.parse(userJSON) : null;
      console.log("Local storage user:", userData?.email);
      setUserInfo(userData);
    } catch (error) {
      console.error('Error checking local user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            
            <RootStack.Navigator
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: '#000' },
              }}
            >
              {loading ? (
                <RootStack.Screen name="Loading">
                  {() => (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                      <ActivityIndicator size="large" color="#FFCA28" />
                    </View>
                  )}
                </RootStack.Screen>
              ) : userInfo ? (
                <RootStack.Screen name="App" component={AppNavigator} />
              ) : (
                <RootStack.Screen name="Auth">
                  {() => <AuthNavigator promptAsync={promptAsync} />}
                </RootStack.Screen>
              )}
            </RootStack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </ErrorBoundary>
    </Provider>
  );
}
