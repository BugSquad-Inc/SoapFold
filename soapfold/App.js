import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useState, useEffect } from 'react';

// Auth Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import ErrorBoundary from './components/ErrorBoundary';

// We'll add Redux later after resolving the module issues
// import { Provider } from 'react-redux';
// import { store } from './store';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    // We'll add the Provider component later after resolving the dependency issues
    // <Provider store={store}>
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer
          fallback={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          }
        >
          <Stack.Navigator
            initialRouteName={user ? "Dashboard" : "Welcome"}
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: '#fff' },
            }}
          >
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ animation: 'fade' }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
    // </Provider>
  );
}
