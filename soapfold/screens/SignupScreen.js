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
  FlatList,
  Dimensions,
  Image,
  Animated,
  Easing,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import { auth, saveUserToLocalStorage, saveUserDataToLocalStorage } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithCredential, sendEmailVerification } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as ImagePicker from 'expo-image-picker';
import { theme, getTextStyle } from '../utils/theme';
import { uploadToCloudinary } from '../utils/imageUpload';

const { width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

const SignUpScreen = ({ navigation }) => {
  // User data state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  
  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
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

  // Google Sign-in configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '391415088926-02i9hua9l1q05c1pm8ejvkc1i98e2ot9.apps.googleusercontent.com',
    androidClientId: '391415088926-02i9hua9l1q05c1pm8ejvkc1i98e2ot9.apps.googleusercontent.com',
    webClientId: '391415088926-02i9hua9l1q05c1pm8ejvkc1i98e2ot9.apps.googleusercontent.com',
  });

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
    if (!firstName || !lastName) {
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
    // Show message that Google Sign-in is disabled
    Alert.alert(
      "Feature Disabled",
      "Google Sign-in is currently disabled. Please use email registration.",
      [{ text: "OK" }]
    );
  };

  // Handle phone sign-in
  const handlePhoneSignIn = () => {
    // Show message that Phone Sign-in is disabled
    Alert.alert(
      "Feature Disabled",
      "Phone Sign-in is currently disabled. Please use email registration.",
      [{ text: "OK" }]
    );
  };

  // Complete registration function
  const completeRegistration = async () => {
    // Start preloading animation immediately
    startPreloadingAnimation();
    setIsLoading(true);
    
    try {
      // Animate to completed state (all dots filled)
      Animated.timing(progressAnimation, {
        toValue: 3, // Step beyond the final dot
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      console.log(`Creating account for: ${firstName} ${lastName} (${email})`);
      
      // Check if Firebase auth is initialized
      if (!auth) {
        throw new Error('Firebase Authentication is not initialized');
      }
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      console.log('User created successfully:', userCredential.user.uid);
      
      // Upload profile image if available
      let photoURL = null;
      if (profileImage) {
        photoURL = await uploadToCloudinary(profileImage);
      }
      
      // Update user profile
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: photoURL || '',
      });
      console.log('User profile updated successfully');
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      console.log('Verification email sent successfully');
      
      // Save user data to AsyncStorage
      const userData = {
        uid: userCredential.user.uid,
        firstName: firstName,
        lastName: lastName,
        displayName: `${firstName} ${lastName}`,
        email: email,
        photoURL: photoURL || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        phoneNumber: userCredential.user.phoneNumber || '',
        emailVerified: false // Initially email is not verified
      };
      
      await saveUserDataToLocalStorage(userData);
      await saveUserToLocalStorage(userCredential.user);
      
      console.log('User data saved to AsyncStorage successfully');
      
      // Start polling for email verification
      let verificationCheckCount = 0;
      const maxVerificationChecks = 120; // Poll for up to 2 minutes (120 × 1 second)
      
      const checkVerificationStatus = async () => {
        // Need to reload the user to get the latest emailVerified status
        if (verificationCheckCount >= maxVerificationChecks) {
          // Timeout after 2 minutes - keep loading screen
          Alert.alert(
            "Verification Time Expired",
            "Please check your email to verify your account, then try signing in.",
            [
              { 
                text: "OK", 
                onPress: () => {
                  setIsLoading(false);
                  setIsPreloading(false);
                  navigation.navigate('SignIn');
                }
              }
            ]
          );
          return;
        }
        
        verificationCheckCount++;
        
        try {
          // Reload user to get current verification status
          await userCredential.user.reload();
          const updatedUser = auth.currentUser;
          
          if (updatedUser && updatedUser.emailVerified) {
            // Email is verified!
            console.log('Email verification confirmed');
            
            // Update emailVerified in AsyncStorage
            const storedUserData = await AsyncStorage.getItem('@userData');
            if (storedUserData) {
              const parsedUserData = JSON.parse(storedUserData);
              const updatedUserData = {
                ...parsedUserData,
                emailVerified: true
              };
              await AsyncStorage.setItem('@userData', JSON.stringify(updatedUserData));
            }
            
            // Update loading screen text
            setPreloaderText("Verification successful! Redirecting...");
            
            // Show verification success briefly, then navigate home without a button
            setTimeout(() => {
              setIsLoading(false);
              setIsPreloading(false);
              
              // Navigate to the appropriate screen after verification
              // This can be the home screen or wherever you want the user to go
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }, 1500); // Show success message for 1.5 seconds before navigating
          } else {
            // Not verified yet, check again in 1 second
            console.log(`Verification check ${verificationCheckCount}/${maxVerificationChecks}: Not verified yet`);
            setTimeout(checkVerificationStatus, 1000);
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
          // Keep checking despite errors
          setTimeout(checkVerificationStatus, 1000);
        }
      };
      
      // Update the loading screen text to indicate we're waiting for verification
      setPreloaderText("Waiting for email verification...");
      
      // Start the verification status check immediately - don't wait for alert
      checkVerificationStatus();
      
      // Create a more visually appealing verification alert
      Alert.alert(
        "Verification Email Sent",
        "Please check your email and click the verification link.\n\nThis screen will remain active until verification is complete.",
        [{ text: "OK" }],  // The OK button doesn't navigate anywhere - just dismisses the alert
        { cancelable: false }
      );
      
    } catch (error) {
      // Reset animation if error
      Animated.timing(progressAnimation, {
        toValue: 2, // Reset to current step
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      setIsLoading(false);
      setIsPreloading(false);
      console.error('Sign-up error:', error.code, error.message);
      console.error('Complete error details:', error);
      
      // Provide user-friendly error messages
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
                      returnKeyType="done"
                      required
                    />
                    <MaterialIcons 
                      name="person" 
                      size={28} 
                      color={lastName ? "#000000" : isLastNameFocused ? "#000000" : "#DDDDDD"} 
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
                disabled={isLoading}
              >
                {isLoading ? (
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
          disabled={isLoading}
        >
          {isLoading ? (
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  backButtonText: {
    ...getTextStyle('bold', 'md', theme.colors.primary),
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
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
  flatList: {
    flex: 1,
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  preloaderText: {
    ...getTextStyle('medium', 'md', theme.colors.primary),
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default SignUpScreen;
