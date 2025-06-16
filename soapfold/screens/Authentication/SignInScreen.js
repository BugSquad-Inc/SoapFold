import React, { useState, useRef, useEffect, useContext } from 'react';
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
import { theme, getTextStyle } from '../../utils/theme';
import { auth } from '../../config/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { getUserFromFirestore, createUserInFirestore, updateUserInFirestore } from '../../config/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoadingContext } from '../../contexts/LoadingContext';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithGoogle, configureGoogleSignIn } from '../../config/authService';

const SignInScreen = ({ navigation }) => {
  const { setIsLoading } = useContext(LoadingContext);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailOrUsernameFocused, setIsEmailOrUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Animation values
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderScale = useRef(new Animated.Value(0)).current;
  
  // Configure Google Sign-In on component mount
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

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
    if (!emailOrUsername || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setFormLoading(true);
    setIsLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, emailOrUsername, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userData = await getUserFromFirestore(user.uid);
      
      if (userData) {
        // User exists in Firestore, update last login
        await updateUserInFirestore(user.uid, {
          lastLogin: new Date().toISOString(),
          isOnline: true
        });

        // Store user data in AsyncStorage
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
        await AsyncStorage.setItem('@auth_token', user.credential?.accessToken || '');
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        // User doesn't exist in Firestore, create new user
        const newUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isOnline: true,
          authProvider: 'email',
          location: 'Default Location',
          settings: {
            notifications: true,
            darkMode: false,
            language: 'en'
          }
        };

        await createUserInFirestore(user.uid, newUserData);
        
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('@user_data', JSON.stringify(newUserData));
        await AsyncStorage.setItem('@auth_token', user.credential?.accessToken || '');
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setFormLoading(false);
      setIsLoading(false);
    }
  };

  // Function to handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setFormLoading(true);
      setIsLoading(true);
      
      const userData = await signInWithGoogle();
      
      if (userData) {
        try {
          // Store user data in AsyncStorage
          await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
          await AsyncStorage.setItem('@auth_token', userData.uid || '');
          
          // Navigate to main app
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } catch (storageError) {
          console.error('[Auth] Error storing user data:', storageError);
          // Even if storage fails, still navigate to main app
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      }
    } catch (error) {
      console.error('[Auth] Google sign in error:', error);
      
      let errorMessage = 'Failed to sign in with Google';
      if (error.message) {
        if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('canceled')) {
          errorMessage = 'Sign in was canceled.';
        } else if (error.message.includes('play services')) {
          errorMessage = 'Google Play Services is not available.';
        }
      }
      
      // Show error but don't block the user
      Alert.alert(
        'Sign In Notice',
        'There was an issue with your sign in, but you can still proceed. Some features may be limited.',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }
          }
        ]
      );
    } finally {
      setFormLoading(false);
      setIsLoading(false);
    }
  };

  // Function to navigate to phone sign-in screen
  const handlePhoneSignIn = () => {
    navigation.navigate('PhoneSignIn');
  };

  // Add this function to handle scroll failures
  const handleScrollToIndexFailed = (info) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      scrollViewRef.current?.scrollToIndex({ 
        index: info.index, 
        animated: true,
        viewPosition: 0.5
      });
    });
  };

  // Add ref for ScrollView
  const scrollViewRef = useRef(null);

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
            bounces={false}
          >
            <View style={styles.header}>
              {/* Remove back button from header since we'll have it at the bottom */}
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.title}>SOAPFOLD</Text>
              <Text style={styles.subtitle}>Please sign in to continue app</Text>

              <View style={styles.formContainer}>
                {/* Email or Username input */}
                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    isEmailOrUsernameFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={emailInputRef}
                      style={styles.input}
                      placeholder="Email or Username"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={emailOrUsername}
                      onChangeText={setEmailOrUsername}
                      onFocus={() => setIsEmailOrUsernameFocused(true)}
                      onBlur={() => setIsEmailOrUsernameFocused(false)}
                      required={true}
                    />
                    <MaterialIcons 
                      name="person" 
                      size={28} 
                      color={emailOrUsername ? "#000000" : isEmailOrUsernameFocused ? "#000000" : "#DDDDDD"} 
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
                        size={28}
                        color={password ? "#000000" : isPasswordFocused ? "#000000" : "#DDDDDD"}
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
              disabled={formLoading || isPreloading}
            >
              {formLoading ? (
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
    borderColor: '#000000',
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
    color: '#000000', // Change to black
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
    color: '#000000', // Change to black
  },
  bottomButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  actionButtonFullWidth: {
    width: '100%',
    backgroundColor: '#243D6E',
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
