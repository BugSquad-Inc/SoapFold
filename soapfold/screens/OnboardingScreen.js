import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Fix: Make app fullscreen by hiding status bar when component mounts
  useEffect(() => {
    StatusBar.setHidden(true);
    return () => {
      // Restore status bar when component unmounts
      StatusBar.setHidden(false);
    };
  }, []);

  const onboardingData = [
    {
      id: '1',
      title: 'Spotless Laundry at Your Fingertips',
      image: require('../assets/onboarding1.jpg'),
      backgroundColor: '#000000'
    },
    {
      id: '2',
      title: 'Fast Pickup & Delivery when you need it most',
      image: require('../assets/onboarding2.jpg'),
      backgroundColor: '#000000'
    },
    {
      id: '3',
      title: 'Start Your Journey with SoapFold!',
      image: require('../assets/onboarding3.jpg'),
      backgroundColor: '#000000'
    }
  ];

  const renderItem = ({ item, index }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Image 
          source={item.image} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        {/* Overlay gradients for fading effect at top and bottom */}
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.5)', 'transparent']}
          style={styles.topGradient}
        />
        
        {/* Strong bottom black overlay/blur like in the image */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
          style={styles.bottomGradient}
        />
        
        {/* Black blur background box with rounded corners */}
        <View style={styles.bottomBlurContainer} />
        
        {/* App logo - only show on first screen within the FlatList */}
        {index === 0 && (
          <Text style={styles.appNameFirstScreen}>SoapFold</Text>
        )}
        
        {/* Text positioned at the bottom like in the image */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'SignIn' } }],
      });
    }
  };

  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'SignIn' } }],
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      flatListRef.current.scrollToIndex({
        index: currentIndex - 1,
        animated: true
      });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  return (
    <View style={styles.container}>
      {/* Skip button - moved higher with no background */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}
      
      {/* Fixed app name for screens 2 and 3 */}
      {currentIndex > 0 && (
        <Text style={styles.appNameFixed}>SoapFold</Text>
      )}
      
      {/* Main content */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Global navigation controls fixed at the bottom */}
      <View style={styles.controlsContainer}>
        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => (
            <View 
              key={index} 
        style={[
                styles.dot, 
                index === currentIndex && [
                  styles.activeDot,
                  index === 0 && styles.firstScreenDot,
                  index === 1 && styles.secondScreenDot,
                  index === 2 && styles.thirdScreenDot
                ]
              ]} 
            />
          ))}
                </View>

        {/* Navigation buttons */}
        <View style={styles.navButtonsContainer}>
          {/* Previous button - black square with white icon */}
          {currentIndex > 0 ? (
              <TouchableOpacity 
              style={styles.prevButton}
              onPress={handlePrevious}
            >
              <MaterialIcons name="chevron-left" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          ) : <View style={styles.buttonPlaceholder} />}
          
          {/* Next button - white square with black icon */}
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
            <MaterialIcons 
              name={currentIndex === onboardingData.length - 1 ? "check" : "chevron-right"} 
              size={30} 
              color="#000000" 
            />
              </TouchableOpacity>
            </View>
          </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  skipButton: {
    position: 'absolute',
    top: 25, // Moved higher
    right: 20,
    zIndex: 10,
    padding: 8,
    // Removed background color
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '35%', // Extended fade height
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '35%', // Bottom 35% black blur/overlay
    zIndex: 1,
  },
  bottomBlurContainer: {
    position: 'absolute',
    left: 5,
    right: 5,
    bottom: 10,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    zIndex: 1,
  },
  appNameFirstScreen: {
    position: 'absolute',
    bottom: 200,
    left: 30,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFCA28',
    zIndex: 2,
  },
  appNameTopCenter: {
    position: 'absolute',
    top: 25, // Little gap at the top
    alignSelf: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFCA28',
    zIndex: 10,
  },
  textContainer: {
    position: 'absolute',
    bottom: 110,
    left: 30, // Aligned with onboarding dots margin
    right: 30,
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    lineHeight: 42,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginRight: 10,
  },
  activeDot: {
    width: 20,
    // Base active dot styles (backgroundColor will be overridden by screen-specific styles)
  },
  firstScreenDot: {
    backgroundColor: '#D2B48C', // Sandal/tan color for first screen
  },
  secondScreenDot: {
    backgroundColor: '#FF3B30', // Red color for second screen
  },
  thirdScreenDot: {
    backgroundColor: '#5AC8FA', // Sky blue color for third screen
  },
  navButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prevButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPlaceholder: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  appNameFixed: {
    position: 'absolute',
    top: 25,
    alignSelf: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFCA28',
    zIndex: 20, // Higher z-index to ensure it's on top
    width: '100%',
    textAlign: 'center',
  },
});

export default OnboardingScreen; 