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
  FlatList,
  Dimensions,
  Image,
  Animated,
  Easing,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import { createUserInFirestore } from '../../config/firestore';
import { signInWithGoogle } from '../../config/authService';
import * as ImagePicker from 'expo-image-picker';
import { theme, getTextStyle } from '../../utils/theme';
import { uploadToCloudinary } from '../../utils/imageUpload';
import { LoadingContext } from '../../contexts/LoadingContext';
import { CommonActions } from '@react-navigation/native';
import { auth } from '../../config/firebase';

const { width } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const { setIsLoading } = useContext(LoadingContext);
  // User data state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  
  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloaderText, setPreloaderText] = useState('Creating your account...');
  
  // Refs
  const flatListRef = useRef(null);
  const firstNameInputRef = useRef(null);
  const lastNameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const usernameInputRef = useRef(null);

  // Animation values for progress indicator and preloader
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderScale = useRef(new Animated.Value(0)).current;
  
  // Animate progress when step changes
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: currentStep,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

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

  // Validation functions
  const validateFirstPage = () => {
    if (!firstName || !lastName || !username) {
      return false;
    }
    return true;
  };

  const validateSecondPage = () => {
    if (!password || !confirmPassword || !email) {
      return false;
    }
    
    if (password !== confirmPassword) {
      // No Alert.alert - using required attribute instead
      return false;
    }
    
    return true;
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep === 0 && !validateFirstPage()) {
      // Focus on the first empty field
      if (!firstName.trim()) {
        firstNameInputRef.current?.focus();
      } else if (!lastName.trim()) {
        lastNameInputRef.current?.focus();
      } else if (!username.trim()) {
        usernameInputRef.current?.focus();
      }
      return;
    }
    
    if (currentStep === 1 && !validateSecondPage()) {
      // Focus on the first empty field
      if (!email.trim()) {
        emailInputRef.current?.focus();
      } else if (!password) {
        passwordInputRef.current?.focus();
      } else if (!confirmPassword) {
        confirmPasswordInputRef.current?.focus();
      } else if (password !== confirmPassword) {
        confirmPasswordInputRef.current?.focus();
      }
      return;
    }

    const nextIndex = currentStep + 1;
    setCurrentStep(nextIndex);
    flatListRef.current.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };

  const prevStep = () => {
    if (currentStep === 0) {
      navigation.goBack();
      return;
    }

    const prevIndex = currentStep - 1;
    setCurrentStep(prevIndex);
    flatListRef.current.scrollToIndex({
      index: prevIndex,
      animated: true,
    });
  };

  // Image picker function
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'You need to grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Handle Google sign-in with preloading
  const handleGoogleSignIn = async () => {
    try {
      console.log('[SignUpScreen] Starting Google sign-in process...');
      setFormLoading(true);
      setIsLoading(true);
      
      // Use React Native Firebase Google Sign-In
      console.log('[SignUpScreen] Calling signInWithGoogle()...');
      const user = await signInWithGoogle();
      
      console.log('[SignUpScreen] Google sign-in successful:', user.email);
      console.log('[SignUpScreen] User object:', JSON.stringify(user, null, 2));
      
      // Let the auth state change in App.js handle navigation automatically
      console.log('[SignUpScreen] Google sign-in completed, auth state should trigger navigation');
      console.log('[SignUpScreen] No manual navigation needed - App.js will handle it');
      
    } catch (error) {
      console.error('[SignUpScreen] Google Sign-In Error:', error);
      console.error('[SignUpScreen] Error details:', JSON.stringify(error, null, 2));
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services is not available on this device.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Google Sign-In Error', errorMessage);
    } finally {
      console.log('[SignUpScreen] Google sign-in process completed');
      setFormLoading(false);
      setIsLoading(false);
    }
  };

  // Handle phone sign-in
  const handlePhoneSignIn = () => {
    navigation.navigate('PhoneSignIn');
  };

  // Complete registration function
  const completeRegistration = async () => {
    // Start preloading animation immediately
    startPreloadingAnimation();
    setIsLoading(true);
    setFormLoading(true);
    setPreloaderText('Creating your account...');
    
    try {
      // Animate to completed state (all dots filled)
      Animated.timing(progressAnimation, {
        toValue: 3,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      console.log(`Creating account for: ${firstName} ${lastName} (${email}) with username: ${username}`);
      
      // Create user with email and password using React Native Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      console.log('User created successfully:', user.uid);
      
      // Upload profile image if available
      let photoURL = null;
      if (profileImage) {
        setPreloaderText('Uploading profile picture...');
        photoURL = await uploadToCloudinary(profileImage);
      }
      
      // Update user profile
      setPreloaderText('Setting up your profile...');
      await user.updateProfile({
        displayName: `${firstName} ${lastName}`,
        photoURL: photoURL || '',
      });
      console.log('User profile updated successfully');
      
      // Prepare user data for Firestore
      const userData = {
        uid: user.uid,
        firstName: firstName,
        lastName: lastName,
        username: username,
        displayName: `${firstName} ${lastName}`,
        email: email,
        photoURL: photoURL || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        phoneNumber: user.phoneNumber || '',
        emailVerified: true
      };
      
      // Save user data to Firestore
      setPreloaderText('Saving your information...');
      await createUserInFirestore(userData);
      
      console.log('User data saved successfully');
      
      // Navigate to home screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
    } catch (error) {
      // Reset animation if error
      Animated.timing(progressAnimation, {
        toValue: 2,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      setIsLoading(false);
      setFormLoading(false);
      setIsPreloading(false);
      console.error('Sign-up error:', error.code, error.message);
      
      switch(error.code) {
        case 'auth/email-already-in-use':
          Alert.alert('Error', 'This email is already in use. Try signing in instead.');
          break;
        case 'auth/invalid-email':
          Alert.alert('Error', 'The email address is not valid.');
          break;
        case 'auth/weak-password':
          Alert.alert('Error', 'The password is too weak. Please use a stronger password.');
          break;
        case 'auth/network-request-failed':
          Alert.alert('Error', 'Network error. Please check your internet connection.');
          break;
        default:
          Alert.alert('Error', error.message);
      }
    }
  };

  // Render simple dots progress indicator
  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((step) => (
            <Animated.View 
              key={step}
              style={[
                styles.dot,
                currentStep >= step && styles.activeDot,
                step === currentStep && {
                  transform: [
                    {
                      scale: progressAnimation.interpolate({
                        inputRange: [step - 0.5, step, step + 0.5],
                        outputRange: [1, 1.2, 1],
                        extrapolate: 'clamp',
                      })
                    }
                  ]
                }
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  // Render individual step form
  const renderStep = ({ item, index }) => {
    switch (index) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Please enter your details</Text>

              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    isFirstNameFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={firstNameInputRef}
                      style={styles.input}
                      placeholder="First Name"
                      placeholderTextColor="#AAAAAA"
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setIsFirstNameFocused(true)}
                      onBlur={() => setIsFirstNameFocused(false)}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => lastNameInputRef.current?.focus()}
                      required
                    />
                    <MaterialIcons 
                      name="person" 
                      size={28} 
                      color={firstName ? "#000000" : isFirstNameFocused ? "#000000" : "#DDDDDD"} 
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    isLastNameFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={lastNameInputRef}
                      style={styles.input}
                      placeholder="Last Name"
                      placeholderTextColor="#AAAAAA"
                      value={lastName}
                      onChangeText={setLastName}
                      onFocus={() => setIsLastNameFocused(true)}
                      onBlur={() => setIsLastNameFocused(false)}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => usernameInputRef.current?.focus()}
                      required
                    />
                    <MaterialIcons 
                      name="person" 
                      size={28} 
                      color={lastName ? "#000000" : isLastNameFocused ? "#000000" : "#DDDDDD"} 
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    isUsernameFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={usernameInputRef}
                      style={styles.input}
                      placeholder="Username"
                      placeholderTextColor="#AAAAAA"
                      value={username}
                      onChangeText={setUsername}
                      onFocus={() => setIsUsernameFocused(true)}
                      onBlur={() => setIsUsernameFocused(false)}
                      autoCapitalize="none"
                      returnKeyType="done"
                      required
                    />
                    <MaterialIcons 
                      name="alternate-email" 
                      size={28} 
                      color={username ? "#000000" : isUsernameFocused ? "#000000" : "#DDDDDD"} 
                    />
                  </View>
                </View>

                <View style={styles.socialSection}>
                  <Text style={styles.socialSectionText}>Or sign up with:</Text>
                  
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>----or----</Text>
                    <View style={styles.dividerLine} />
                  </View>
                  
                  <View style={styles.authOptionsContainer}>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={handleGoogleSignIn}
                    >
                      <AntDesign name="google" size={18} color="#000000" />
                      <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={handlePhoneSignIn}
                    >
                      <MaterialIcons name="phone" size={18} color="#000000" />
                      <Text style={styles.socialButtonText}>Phone</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Already have an Account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                    <Text style={styles.signupButtonText}>SIGN IN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Set your credentials</Text>
              
              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    isEmailFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={emailInputRef}
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      required
                    />
                    <MaterialIcons 
                      name="email" 
                      size={28} 
                      color={email ? "#000000" : isEmailFocused ? "#000000" : "#DDDDDD"} 
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    isPasswordFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#AAAAAA"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      returnKeyType="next"
                      onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                      required
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

                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    isConfirmPasswordFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={confirmPasswordInputRef}
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#AAAAAA"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setIsConfirmPasswordFocused(true)}
                      onBlur={() => setIsConfirmPasswordFocused(false)}
                      returnKeyType="done"
                      required
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <MaterialIcons
                        name={showConfirmPassword ? "visibility" : "visibility-off"}
                        size={28}
                        color={confirmPassword ? "#000000" : isConfirmPasswordFocused ? "#000000" : "#DDDDDD"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>Profile Picture</Text>
              <Text style={styles.subtitle}>Add a profile picture (optional)</Text>
              
              <View style={styles.photoContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <MaterialIcons name="add-a-photo" size={40} color="#AAAAAA" />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.photoHint}>Tap to select a photo</Text>
              </View>

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our
                </Text>
                <Text style={styles.termsText}>
                  <Text style={styles.linkText} onPress={() => Alert.alert('Terms', 'Terms of Service')}>
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text style={styles.linkText} onPress={() => Alert.alert('Privacy', 'Privacy Policy')}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  // Render bottom buttons
  const renderBottomButtons = () => {
    // For the first screen (names), full width Next button only
    if (currentStep === 0) {
      return (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.actionButtonFullWidth}
            onPress={nextStep}
            disabled={formLoading}
          >
            {formLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.actionButtonText}>NEXT</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
    
    // For other screens, show both Back and Next/Register buttons
    return (
      <View style={styles.bottomButtonContainer}>
        {/* Back button for steps 1 and 2 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={prevStep}
        >
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>

        {/* Next/Register button for steps 1 and 2 */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={currentStep === 2 ? completeRegistration : nextStep}
          disabled={formLoading}
        >
          {formLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.actionButtonText}>
              {currentStep < 2 ? 'NEXT' : 'SIGN UP'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f8f8f8'}}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.progressContainer}>
            {renderProgressIndicator()}
          </View>

          <FlatList
            ref={flatListRef}
            data={[
              { id: 'name' },
              { id: 'password' },
              { id: 'final' }
            ]}
            renderItem={renderStep}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            style={styles.flatList}
            keyboardShouldPersistTaps="handled"
          />
          
          {renderBottomButtons()}
          
          {/* Preloading overlay */}
          {isPreloading && (
            <Animated.View 
              style={[
                styles.preloaderContainer,
                {
                  opacity: loaderOpacity,
                  backgroundColor: '#FFFFFF'
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
                <Text style={styles.preloaderText}>{preloaderText}</Text>
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
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 5,
  },
  stepContainer: {
    width: width,
    padding: 24,
    paddingTop: 5,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 5,
  },
  title: {
    ...getTextStyle('bold', 'xxxl'),
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    ...getTextStyle('regular', 'sm', theme.colors.lightText),
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12, // Rounded corners
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 8,
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
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  photoButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginBottom: 15,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoHint: {
    ...getTextStyle('regular', 'sm', theme.colors.lightText),
  },
  socialSection: {
    marginVertical: 20,
  },
  socialSectionText: {
    ...getTextStyle('regular', 'sm', theme.colors.lightText),
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14, // Slightly larger text
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    marginHorizontal: 10,
    ...getTextStyle('regular', 'sm', theme.colors.lightText),
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
  rememberMeContainer: {
    marginVertical: 15,
  },
  checkboxContainer: {
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
    fontSize: 14,
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  termsText: {
    ...getTextStyle('regular', 'sm', theme.colors.lightText),
    textAlign: 'center',
    marginBottom: 5,
    fontSize: 14,
  },
  linkText: {
    ...getTextStyle('medium', 'sm', theme.colors.secondary),
    textDecorationLine: 'underline',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
    color: '#000000',
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  backButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: '#243D6E',
  },
  backButtonText: {
    ...getTextStyle('bold', 'md', theme.colors.primary),
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#243D6E',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 30,
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
  flatList: {
    flex: 1,
  },
  preloaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  preloaderText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SignUpScreen;
