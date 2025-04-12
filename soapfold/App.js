import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text , Image} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Auth Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import WelcomeScreen from './screens/WelcomeScreen';

// Main App Screens
import HomeScreen from './screens/HomeScreen';
import ErrorBoundary from './components/ErrorBoundary';
import CategoryScreen from './screens/CategoryScreen';
import CalendarScreen from './screens/CalendarScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('./assets/images/home.png')} 
              style={{ tintColor: color, width: 24, height: 24 }} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Category" 
        component={CategoryScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('./assets/images/order.png')} 
              style={{ tintColor: color, width: 24, height: 24 }} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('./assets/images/calendar.png')} 
              style={{ tintColor: color, width: 24, height: 24 }} 
            />
          )
        }}
      />
    </Tab.Navigator>
  );
};

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
    <Provider store={store}>
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
              initialRouteName={user ? "Home" : "Welcome"}
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
                name="Home" 
                component={HomeScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen 
                name="Signup" 
                component={SignupScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen 
                name="Main" 
                component={MainTabNavigator}
              />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </Provider>
  );
}
