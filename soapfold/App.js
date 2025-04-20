import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { MaterialIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Auth Screens
import OnboardingScreen from './screens/OnboardingScreen';
import CartScreen from './screens/CartScreen';
import EmailSignupScreen from './screens/EmailSignupScreen';
import EmailLoginScreen from './screens/EmailLoginScreen';
import PhoneSignInScreen from './screens/PhoneSignInScreen';
import VerifyCodeScreen from './screens/VerifyCodeScreen';

// Main App Screens
import HomeScreen from './screens/HomeScreen';
import ErrorBoundary from './components/ErrorBoundary';
import CategoryScreen from './screens/CategoryScreen';
import CalendarScreen from './screens/CalendarScreen';

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
      name="HomeScreen" 
      component={HomeScreen}
      options={{ animation: 'fade' }}
    />
    <AppStack.Screen
      name="CategoryScreen"
      component={CategoryScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AppStack.Screen
      name="CalendarScreen"
      component={CalendarScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AppStack.Screen
      name="CartScreen"
      component={CartScreen}
      options={{ 
        animation: 'slide_from_right', 
        headerShown: true, 
        title: 'Your Cart',
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#FFFFFF',
      }}
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
        setUserInfo(user);
        await AsyncStorage.setItem('@user', JSON.stringify(user));
      } else {
        console.log("User is not authenticated");
        setUserInfo(null);
        await AsyncStorage.removeItem('@user');
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
      <SafeAreaProvider>
        <ErrorBoundary>
          <NavigationContainer>
            <RootStack.Navigator
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            >
              {!userInfo ? (
                <RootStack.Screen 
                  name="Auth"
                >
                  {(props) => <AuthNavigator {...props} promptAsync={promptAsync} />}
                </RootStack.Screen>
              ) : (
                <RootStack.Screen 
                  name="App" 
                  component={AppNavigator}
                />
              )}
            </RootStack.Navigator>
            <StatusBar style="light" />
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </Provider>
  );
}
