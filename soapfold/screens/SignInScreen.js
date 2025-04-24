import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  Easing,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { theme, getTextStyle } from '../utils/theme';

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Google Sign-in configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '391415088926-02i9hua9l1q05c1pm8ejvkc1i98e2ot9.apps.googleusercontent.com',
    androidClientId: '391415088926-02i9hua9l1q05c1pm8ejvkc1i98e2ot9.apps.googleusercontent.com',
    webClientId: '391415088926-02i9hua9l1q05c1pm8ejvkc1i98e2ot9.apps.googleusercontent.com',
  });

  // Animation values
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderScale = useRef(new Animated.Value(0)).current;
  
  // Function to start preloading animation
  const startPreloadingAnimation = () => {
    setIsPreloading(true);
    
    // Fade in and scale up animation
    Animated.parallel([
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(loaderScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  };

  // Function to handle email sign-in
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Start preloading animation immediately
    startPreloadingAnimation();
    setIsLoading(true);
    
    try {
      console.log(`Attempting to sign in with email: ${email}`);
      
      // Check if Firebase auth is initialized
      if (!auth) {
        throw new Error('Firebase Authentication is not initialized');
      }
      
      // Simulate preloading resources (remove this in production)
      // In a real app, you would preload images, data, etc. here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Attempt to sign in
      await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('Sign-in successful');
      
      // Keep loading animation while we transition to home screen
      // (don't reset isLoading or isPreloading as we're leaving this screen)
      
      // Navigation is handled by authStateChanged listener in App.js
    } catch (error) {
      setIsLoading(false);
      setIsPreloading(false);
      console.error('Sign-in error:', error.code, error.message);
      console.error('Error details:', error);
      
      // Provide more user-friendly error messages
      switch(error.code) {
        case 'auth/invalid-email':
          Alert.alert('Error', 'The email address is not valid.');
          break;
        case 'auth/user-disabled':
          Alert.alert('Error', 'This user account has been disabled.');
          break;
        case 'auth/user-not-found':
          Alert.alert('Error', 'No account found with this email address.');
          break;
        case 'auth/wrong-password':
          Alert.alert('Error', 'Incorrect password. Please try again.');
          break;
        case 'auth/network-request-failed':
          Alert.alert('Error', 'Network error. Please check your internet connection.');
          break;
        case 'auth/too-many-requests':
          Alert.alert('Error', 'Too many unsuccessful login attempts. Please try again later.');
          break;
        case 'auth/api-key-not-valid-please-pass-a-valid-api-key':
          Alert.alert(
            'Configuration Error', 
            'There is an issue with the app configuration. Please contact support.'
          );
          console.error('Invalid API key error - check your Firebase configuration');
          break;
        case 'auth/admin-restricted-operation':
          Alert.alert(
            'Authentication Error', 
            'This authentication method has been disabled. Please try a different sign-in method or contact support.'
          );
          break;
        default:
          Alert.alert('Error', error.message);
      }
    }
  };

  // Function to handle Google sign-in
  const handleGoogleSignIn = async () => {
    // Start preloading animation immediately
    startPreloadingAnimation();
    setIsLoading(true);
    
    try {
      const result = await promptAsync();
      
      if (result.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        
        // Simulate preloading resources (remove this in production)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await signInWithCredential(auth, credential);
        
        // Keep loading animation while we transition to home screen
        // (don't reset isLoading or isPreloading as we're leaving this screen)
      } else {
        setIsLoading(false);
        setIsPreloading(false);
      }
    } catch (error) {
      setIsLoading(false);
      setIsPreloading(false);
      Alert.alert('Error', error.message);
    }
  };

  // Function to navigate to phone sign-in screen
  const handlePhoneSignIn = () => {
    navigation.navigate('PhoneSignIn');
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f8f8f8'}}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              {/* Remove back button from header since we'll have it at the bottom */}
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.title}>SOAPFOLD</Text>
              <Text style={styles.subtitle}>Please sign in to continue app</Text>

              <View style={styles.formContainer}>
                {/* Email input */}
                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    isEmailFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={emailInputRef}
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      required={true}
                    />
                    <MaterialIcons 
                      name="email" 
                      size={30} 
                      color={email ? "#000000" : isEmailFocused ? "#FF0000" : "#DDDDDD"} 
                      style={styles.inputIcon} 
                    />
                  </View>
                </View>

                {/* Password input */}
                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    isPasswordFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.input}
                      placeholder="password"
                      placeholderTextColor="#888888"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      required={true}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={30}
                        color={password ? "#000000" : isPasswordFocused ? "#FF0000" : "#DDDDDD"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Remember Me and Forgot Password */}
                <View style={styles.rememberForgotContainer}>
                  <View style={{flex: 1}}></View>

                  <TouchableOpacity 
                    style={styles.forgotPasswordContainer} 
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Remove divider line above buttons as requested */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>----or----</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Auth option buttons */}
                <View style={styles.authOptionsContainer}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleGoogleSignIn}
                  >
                    <AntDesign name="google" size={18} color="#000000" />
                    <Text style={styles.socialButtonText}>Google Sign In</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handlePhoneSignIn}
                  >
                    <MaterialIcons name="phone" size={18} color="#000000" />
                    <Text style={styles.socialButtonText}>Phone Sign In</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an Account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signupButtonText}>SIGN UP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
          
          {/* Bottom button container */}
          <View style={styles.bottomButtonContainer}>
            {/* Login button - now full width */}
            <TouchableOpacity
              style={styles.actionButtonFullWidth}
              onPress={handleSignIn}
              disabled={isLoading || isPreloading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Preloading overlay */}
          {isPreloading && (
            <Animated.View 
              style={[
                styles.preloaderContainer,
                {
                  opacity: loaderOpacity,
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.loaderContent,
                  {
                    transform: [{ scale: loaderScale }]
                  }
                ]}
              >
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.preloaderText}>Loading your account...</Text>
              </Animated.View>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 16,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 0,
  },
  title: {
    ...getTextStyle('bold', 'xxxl'),
    fontSize: 34,
    marginBottom: 6,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    ...getTextStyle('regular', 'sm', theme.colors.lightText),
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    ...getTextStyle('regular', 'sm', theme.colors.lightText),
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12, // Increased border radius for rounded corners
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
  },
  inputContainerFocused: {
    borderColor: theme.colors.secondary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    height: 38,
    paddingVertical: 8,
  },
  inputIcon: {
    marginLeft: 10,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 3,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  rememberMeText: {
    ...getTextStyle('regular', 'sm'),
    fontSize: 14, // Slightly larger text
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    ...getTextStyle('medium', 'sm', theme.colors.secondary),
    fontSize: 14, // Slightly larger text
    fontWeight: 'bold', // Make it bold as requested
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    ...getTextStyle('regular', 'sm', '#888888'),
    marginHorizontal: 10,
  },
  authOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    width: '48%',
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  socialButtonText: {
    ...getTextStyle('medium', 'sm'),
    marginLeft: 8,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    ...getTextStyle('regular', 'sm', theme.colors.lightText),
    marginRight: 5,
    fontSize: 14,
  },
  signupButtonText: {
    ...getTextStyle('medium', 'sm', theme.colors.secondary),
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  actionButtonFullWidth: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    ...getTextStyle('bold', 'md', '#FFFFFF'),
    fontSize: 16,
  },
  preloaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 15,
  },
  preloaderText: {
    ...getTextStyle('medium', 'md', theme.colors.primary),
    marginTop: 20,
  },
});

export default SignInScreen; 