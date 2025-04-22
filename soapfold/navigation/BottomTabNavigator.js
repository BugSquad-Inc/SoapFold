import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CategoryScreen from '../screens/CategoryScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CartScreen from '../screens/CartScreen';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

// Create a Cleaning Brush animation component for loading
const CleaningBrushAnimation = () => {
  const sweepAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create sweeping animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(sweepAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);
  
  const sweepRotation = sweepAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-25deg', '0deg', '25deg']
  });
  
  const sweepPosition = sweepAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-10, 0, 10]
  });
  
  return (
    <View style={styles.brushContainer}>
      {/* Brush handle */}
      <View style={styles.brushHandle} />
      
      {/* Brush head with sweeping animation */}
      <Animated.View 
        style={[
          styles.brushHead,
          {
            transform: [
              { rotate: sweepRotation },
              { translateX: sweepPosition }
            ]
          }
        ]}
      >
        {/* Bristles */}
        <View style={styles.bristle} />
        <View style={[styles.bristle, { left: 4 }]} />
        <View style={[styles.bristle, { left: 8 }]} />
        <View style={[styles.bristle, { left: 12 }]} />
        <View style={[styles.bristle, { left: 16 }]} />
      </Animated.View>
      
      {/* Dirt particles */}
      <Animated.View 
        style={[
          styles.dirtParticle,
          {
            left: 10,
            transform: [{ translateX: sweepPosition }]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dirtParticle,
          { 
            left: 20,
            width: 4,
            height: 4,
            transform: [{ translateX: sweepPosition }]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dirtParticle,
          {
            left: 5,
            top: 15,
            transform: [{ translateX: sweepPosition }]
          }
        ]} 
      />
    </View>
  );
};

// Rotating washing machine water effect
const WashingMachineEffect = () => {
  // Use a continuous rotation value that doesn't reset
  const rotationValue = useRef(new Animated.Value(0)).current;
  const waterWave = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create continuous spinning animation that doesn't reset
    Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 360,
        duration: 3000,
        useNativeDriver: true,
        isInteraction: false,
      }),
      { iterations: -1 } // Infinite iterations
    ).start();
    
    // Create water wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waterWave, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(waterWave, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);
  
  // Apply the rotation directly with string concatenation to avoid resets
  const spin = rotationValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });
  
  const waterScale = waterWave.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1]
  });

  // Create multiple water droplets around the circle
  const createWaterDroplets = () => {
    const droplets = [];
    const COUNT = 16; // Increased from 12 for more water density
    
    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * 2 * Math.PI;
      const radius = 23; // Slightly smaller to stay inside
      
      // Calculate position along the circle
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Vary size based on position for more water-like effect
      const size = 6 + (i % 4) * 2; // Increased sizes
      
      droplets.push(
        <View
          key={i}
          style={[
            styles.waterDroplet,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              // Position around the circle
              transform: [
                { translateX: x },
                { translateY: y }
              ],
              // Vary opacity for depth effect
              opacity: 0.7 + ((i % 4) * 0.1),
            }
          ]}
        />
      );
    }
    
    // Add some inner water droplets for volume
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const radius = 12; // Inner radius
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const size = 4 + (i % 3);
      
      droplets.push(
        <View
          key={`inner-${i}`}
          style={[
            styles.waterDroplet,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [
                { translateX: x },
                { translateY: y }
              ],
              opacity: 0.5 + ((i % 3) * 0.1),
              backgroundColor: 'rgba(0, 150, 240, 0.7)', // Slightly different color
            }
          ]}
        />
      );
    }
    
    return droplets;
  };
  
  return (
    <View style={styles.washingMachineContainer}>
      {/* Background water */}
      <View style={styles.washingMachineBackground} />
      
      {/* Pulsing water layer */}
      <Animated.View
        style={[
          styles.waterLayer,
          {
            transform: [{ scale: waterScale }]
          }
        ]}
      />
      
      {/* Rotating water effect */}
      <Animated.View 
        style={[
          styles.waterRing,
          { transform: [{ rotate: spin }] }
        ]}
      >
        {createWaterDroplets()}
      </Animated.View>
    </View>
  );
};

// Bubble component
const Bubble = ({ delay, size, left, duration }) => {
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(bubbleAnim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          })
        ])
      ]).start(() => {
        bubbleAnim.setValue(0);
        animate();
      });
    };
    
    animate();
  }, [bubbleAnim, delay, duration]);

  const translateY = bubbleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80] // Increased from -50 to make bubbles go higher
  });
  
  const opacity = bubbleAnim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [0, 0.8, 0.6, 0]
  });
  
  const scale = bubbleAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0.3, 1, 0.8, 0.3]
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: left,
          transform: [{ translateY }, { scale }],
          opacity
        }
      ]}
    />
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Center "+" button with bubbles and washing machine animation
            if (route.name === 'CartScreen') {
              return (
                <TouchableOpacity 
                  key={route.key}
                  style={styles.centerNavItem} 
                  onPress={onPress}
                  activeOpacity={0.8}
                >
                  <Animatable.View 
                    style={styles.centerNavButton}
                    animation="pulse" 
                    iterationCount="infinite" 
                    duration={2000}
                  >
                    {/* Washing machine animation */}
                    <WashingMachineEffect />
                    
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="add" size={30} color="#000" />
                    </View>
                    
                    {/* Bubbles */}
                    <Bubble delay={0} size={8} left={-5} duration={2000} />
                    <Bubble delay={500} size={10} left={48} duration={2500} />
                    <Bubble delay={1200} size={6} left={10} duration={1800} />
                    <Bubble delay={800} size={12} left={36} duration={2200} />
                    <Bubble delay={1500} size={7} left={24} duration={2300} />
                  </Animatable.View>
                </TouchableOpacity>
              );
            }

            // Get icon name based on route
            let iconName;
            let isCustomIcon = false;
            
            if (route.name === 'HomeScreen') {
              iconName = 'home';
            } else if (route.name === 'CalendarScreen') {
              iconName = 'event-note';
            } else if (route.name === 'CategoryScreen') {
              // Using a FontAwesome5 icon for the pro feature - more elegant than medal
              iconName = 'crown';
              isCustomIcon = true;
            } else if (route.name === 'ProfileScreen') {
              iconName = 'person';
            }

            // Regular nav items with active state
            return (
              <TouchableOpacity 
                key={route.key}
                style={styles.navItem} 
                activeOpacity={0.7}
                onPress={onPress}
              >
                <View style={[
                  styles.navItemButton,
                  isFocused && styles.activeNavItemButton
                ]}>
                  {isCustomIcon ? (
                    <FontAwesome5 
                      name={iconName} 
                      size={24} 
                      color={isFocused ? "#FFFFFF" : "#999"} 
                    />
                  ) : (
                    <MaterialIcons 
                      name={iconName} 
                      size={30} 
                      color={isFocused ? "#FFFFFF" : "#999"} 
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="CalendarScreen" component={CalendarScreen} />
      <Tab.Screen name="CartScreen" component={CartScreen} />
      <Tab.Screen name="CategoryScreen" component={CategoryScreen} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 999,
    elevation: 8,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 16,
    left: 50,
    right: 50,
    height: 80,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    height: '100%',
    backgroundColor: 'rgba(25, 25, 25, 0.85)',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46,
  },
  navItemButton: {
    backgroundColor: 'transparent',
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNavItemButton: {
    backgroundColor: 'transparent',
  },
  centerNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    overflow: 'visible',
  },
  centerNavButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  iconContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  washingMachineContainer: {
    position: 'absolute',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  washingMachineBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(0, 150, 255, 0.3)', // Slightly more opaque
  },
  waterLayer: {
    position: 'absolute',
    width: '94%',
    height: '94%',
    borderRadius: 24,
    backgroundColor: 'rgba(0, 180, 255, 0.4)',
  },
  waterRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterDroplet: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 180, 255, 0.9)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 170, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(150, 220, 255, 0.6)',
    bottom: 10,
    zIndex: 3,
  },
  // Styles for the cleaning brush animation
  brushContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  brushHandle: {
    width: 8,
    height: 25,
    backgroundColor: '#333',
    position: 'absolute',
    top: 0,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    zIndex: 1
  },
  brushHead: {
    width: 30,
    height: 15,
    backgroundColor: '#111',
    position: 'absolute',
    bottom: 10,
    borderRadius: 5,
    transform: [{ rotate: '45deg' }],
    zIndex: 2
  },
  bristle: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#555',
    bottom: -6,
    left: 0,
    borderRadius: 1
  },
  dirtParticle: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#777',
    borderRadius: 1.5,
    bottom: 5,
    zIndex: 0
  }
});

export default BottomTabNavigator; 