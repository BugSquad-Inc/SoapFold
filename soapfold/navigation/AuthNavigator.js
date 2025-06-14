import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import SignInScreen from '../screens/Authentication/SignInScreen';
import SignUpScreen from '../screens/Authentication/SignupScreen';
import ForgotPasswordScreen from '../screens/Authentication/ForgotPasswordScreen';
import PhoneSignInScreen from '../screens/Authentication/PhoneSignInScreen';
import VerifyCodeScreen from '../screens/Authentication/VerifyCodeScreen';

const AuthStack = createNativeStackNavigator();

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

export default AuthNavigator; 