import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const PlaceholderImage = ({ width, height, color, style }) => (
  <View
    style={[
      styles.placeholderImage,
      {
        width,
        height,
        backgroundColor: color || '#2A2A2A',
      },
      style,
    ]}
  />
);

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLogin, setIsLogin] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  
  // Add new animated values for image shapes
  const imageShape1 = React.useRef(new Animated.Value(0)).current;
  const imageShape2 = React.useRef(new Animated.Value(0)).current;
  const imageShape3 = React.useRef(new Animated.Value(0)).current;
  const imageShape4 = React.useRef(new Animated.Value(0)).current;

  // Animation interpolations for each image
  const image1Style = {
    borderRadius: imageShape1.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [width * 0.14, 40, width * 0.14]
    }),
    transform: [{
      scale: imageShape1.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [1, 1.1, 0.95]
      })
    }]
  };

  const image2Style = {
    borderRadius: imageShape2.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [40, width * 0.14, 40]
    }),
    transform: [{
      scale: imageShape2.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [1, 0.95, 1.1]
      })
    }]
  };

  const image3Style = {
    borderRadius: imageShape3.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [40, width * 0.14, 40]
    }),
    transform: [{
      scale: imageShape3.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [1, 1.1, 0.95]
      })
    }]
  };

  const image4Style = {
    borderRadius: imageShape4.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [width * 0.14, 40, width * 0.14]
    }),
    transform: [{
      scale: imageShape4.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [1, 0.95, 1.1]
      })
    }]
  };

  const animateImageShapes = (toValue) => {
    Animated.parallel([
      Animated.timing(imageShape1, {
        toValue,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(imageShape2, {
        toValue,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(imageShape3, {
        toValue,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(imageShape4, {
        toValue,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isLogin) {
          handleLoginBack();
          return true;
        }
        if (currentStep === 1) {
          handleBack();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [currentStep, isLogin])
  );

  const handleNext = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentStep(1);
      slideAnim.setValue(50);
      animateImageShapes(1);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const handleBack = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentStep(0);
      slideAnim.setValue(-50);
      animateImageShapes(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const handleLoginTransition = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsLogin(true);
      slideAnim.setValue(50);
      animateImageShapes(2);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const handleLoginBack = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsLogin(false);
      slideAnim.setValue(-50);
      animateImageShapes(1);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const renderImageGrid = () => (
    <View style={styles.imageGrid}>
      <View style={styles.imageColumn1}>
        <View style={[styles.imageWrapper, styles.image1]}>
          <Animated.View style={[styles.placeholderImage, {
            width: width * 0.28,
            height: width * 0.28,
            backgroundColor: '#2A2A2A',
          }, image1Style]}>
          </Animated.View>
          <View style={styles.starDecoration}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
          </View>
        </View>
        <View style={[styles.imageWrapper, styles.image3]}>
          <Animated.View style={[styles.placeholderImage, {
            width: width * 0.32,
            height: width * 0.38,
            backgroundColor: '#4A4A4A',
          }, image3Style]}>
          </Animated.View>
        </View>
      </View>
      <View style={styles.imageColumn2}>
        <View style={[styles.imageWrapper, styles.image2]}>
          <Animated.View style={[styles.placeholderImage, {
            width: width * 0.28,
            height: width * 0.35,
            backgroundColor: '#3A3A3A',
          }, image2Style]}>
          </Animated.View>
        </View>
        <View style={[styles.imageWrapper, styles.image4]}>
          <Animated.View style={[styles.placeholderImage, {
            width: width * 0.28,
            height: width * 0.28,
            backgroundColor: '#5A5A5A',
          }, image4Style]}>
          </Animated.View>
          <View style={styles.scribbleDecoration}>
            <MaterialIcons name="gesture" size={14} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </View>
  );

  const renderContent = () => (
    <View style={styles.contentWrapper}>
      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {isLogin ? (
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpTitle}>Welcome back</Text>
            <Text style={styles.signUpSubtitle}>
              Log in to continue exploring and booking events
            </Text>
            <View style={styles.signInButtonsContainer}>
              <TouchableOpacity style={styles.googleButton}>
                <View style={styles.buttonContent}>
                  <AntDesign name="google" size={20} color="#000000" style={styles.buttonIcon} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signInButton}>
                <View style={styles.buttonContent}>
                  <MaterialIcons name="mail-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.signInButtonText}>Continue with email</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signInButton}>
                <View style={styles.buttonContent}>
                  <MaterialIcons name="smartphone" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.signInButtonText}>Continue with phone number</Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.loginLink} onPress={handleLoginBack}>
              <Text style={styles.loginLinkText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        ) : currentStep === 0 ? (
          <View style={styles.textBackground}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Event exploration{'\n'}made simple</Text>
              <Text style={styles.subtitle}>
                Discover, book, and track events seamlessly with calendar integration and personalized event curation
              </Text>
            </View>
            <View style={styles.bottomContainer}>
              <View style={styles.paginationContainer}>
                <View style={styles.paginationDots}>
                  <View style={[styles.dot, currentStep === 0 && styles.activeDot]} />
                  <View style={[styles.dot, currentStep === 1 && styles.activeDot]} />
                </View>
              </View>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpTitle}>Get started</Text>
            <Text style={styles.signUpSubtitle}>
              Register for events and create images of the activities you plan to attend.
            </Text>
            <View style={styles.signInButtonsContainer}>
              <TouchableOpacity style={styles.googleButton}>
                <View style={styles.buttonContent}>
                  <AntDesign name="google" size={20} color="#000000" style={styles.buttonIcon} />
                  <Text style={styles.googleButtonText}>Sign up with Google</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signInButton}>
                <View style={styles.buttonContent}>
                  <MaterialIcons name="mail-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.signInButtonText}>sign up with email</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signInButton}>
                <View style={styles.buttonContent}>
                  <MaterialIcons name="smartphone" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.signInButtonText}>sign up with phone number</Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.loginLink} onPress={handleLoginTransition}>
              <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.step}>
        {renderImageGrid()}
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  step: {
    flex: 1,
  },
  imageGrid: {
    position: 'absolute',
    top: height * 0.08,
    left: 0,
    right: 0,
    height: height * 0.45,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageColumn1: {
    marginRight: width * 0.02,
  },
  imageColumn2: {
    marginTop: height * 0.03,
  },
  imageWrapper: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: height * 0.01,
  },
  circleImage: {
    borderRadius: width * 0.14,
  },
  ovalImage: {
    borderRadius: 40,
  },
  image1: {
    zIndex: 4,
  },
  image2: {
    zIndex: 3,
  },
  image3: {
    zIndex: 2,
  },
  image4: {
    zIndex: 1,
  },
  starDecoration: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 4,
  },
  scribbleDecoration: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    zIndex: 4,
  },
  contentWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  textBackground: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#000000',
  },
  textContainer: {
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    marginBottom: 24,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#000000',
  },
  paginationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  paginationDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333333',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  signUpTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  signUpSubtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 32,
  },
  signInButtonsContainer: {
    gap: 12,
  },
  googleButton: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  buttonIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '500',
  },
  signInButton: {
    height: 52,
    backgroundColor: 'rgba(32, 32, 32, 0.6)',
    borderRadius: 14,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
    opacity: 0.9,
  },
  loginLink: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  loginLinkText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  placeholderImage: {
    overflow: 'hidden',
  },
});

export default OnboardingScreen; 