import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useLoadFonts } from './utils/fonts';
import { theme } from './utils/theme';
import { ThemeProvider } from './utils/ThemeContext';
import ThemedStatusBar from './components/ThemedStatusBar';
import { LoadingProvider } from './contexts/LoadingContext';
import React from 'react';
import { auth } from './config/firebase';
import { configureGoogleSignIn } from './config/authService';
import { getCustomerProfile, createCustomer, updateCustomer } from './config/firestore';
import ErrorBoundary from './components/ErrorBoundary';

// Auth Screens
import OnboardingScreen from './screens/Onboarding/OnboardingScreen';
import PhoneSignInScreen from './screens/Authentication/PhoneSignInScreen';
import VerifyCodeScreen from './screens/Authentication/VerifyCodeScreen';
import SignInScreen from './screens/Authentication/SignInScreen';
import SignUpScreen from './screens/Authentication/SignupScreen';
import ForgotPasswordScreen from './screens/Authentication/ForgotPasswordScreen';

// Import BottomTabNavigator
import BottomTabNavigator from './navigation/BottomTabNavigator';

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
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const fontsLoaded = useLoadFonts();

  useEffect(() => {
    // Configure Google Sign-In
    configureGoogleSignIn();
      
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Get or create customer profile
          let customerProfile = await getCustomerProfile(user.uid);
          if (!customerProfile) {
            await createCustomer({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              phoneNumber: user.phoneNumber,
              photoURL: user.photoURL,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error handling user profile:', error);
        }
      }
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Show loading state
  if (!fontsLoaded || initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
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
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
                    <RootStack.Screen name="Main" component={AppNavigator} />
        ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
            </SafeAreaProvider>
          </LoadingProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;