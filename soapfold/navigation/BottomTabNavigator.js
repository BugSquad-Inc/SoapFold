import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CategoryScreen from '../screens/CategoryScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CartScreen from '../screens/CartScreen';
import NotificationScreen, { unreadNotificationsCount } from '../screens/NotificationScreen';
import OrderScreen from '../screens/OrderScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';

// Import other screens
import OrdersNavigator from './OrdersNavigator';
import RedeemScreen from '../screens/RedeemScreen';
import OffersScreen from '../screens/OffersScreen';
import ServiceWithOffersScreen from '../screens/ServiceWithOffersScreen';
import ServiceScreen from '../screens/ServiceScreen';
import ClothesScreen from '../screens/ClothesScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import RecentOrdersScreen from '../screens/RecentOrdersScreen';
import ServiceCategoryScreen from '../screens/ServiceCategoryScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import RazorpayScreen from '../screens/RazorpayScreen';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

// Stack navigator for the Orders section
const OrderStack = createStackNavigator();

function OrderScreenNavigator() {
  return (
    <OrderStack.Navigator screenOptions={{ headerShown: false }}>
      <OrderStack.Screen name="OrdersMain" component={OrderScreen} />
      <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </OrderStack.Navigator>
  );
}

// Define TabBarIcon function
const TabBarIcon = (props) => {
  return <MaterialIcons size={30} style={{ marginBottom: -3 }} {...props} />;
};

// Update Custom Tab Bar to include Orders tab
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Check for unread notifications
  useEffect(() => {
    const checkUnreadNotifications = async () => {
      try {
        const count = await AsyncStorage.getItem('@unreadNotifications');
        setUnreadCount(count ? parseInt(count) : unreadNotificationsCount);
      } catch (error) {
        console.log('Error loading unread notifications count', error);
        setUnreadCount(unreadNotificationsCount);
      }
    };
    
    checkUnreadNotifications();
    
    // Check for unread notifications every time the tab bar is focused
    const unsubscribe = navigation.addListener('focus', checkUnreadNotifications);
    return unsubscribe;
  }, [navigation]);

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

            // Center "+" button with bubbles animation
            if (route.name === 'CartScreen') {
              return (
                <TouchableOpacity 
                  key={route.key}
                  style={styles.centerNavItem} 
                  onPress={() => {
                    // Navigate to ServiceCategoryScreen within HomeStack
                    navigation.navigate('HomeScreen', {
                      screen: 'ServiceCategoryScreen',
                      params: {
                        category: {
                          id: 'all',
                          name: 'All Categories',
                          icon: 'category',
                          color: '#222222'
                        }
                      }
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.centerNavButton}>
                    <MaterialIcons name="add" size={32} color="#FFFFFF" />
                    
                    {/* Bubble animations */}
                    <Bubble delay={0} size={8} left={21} duration={1800} />
                    <Bubble delay={400} size={6} left={15} duration={2000} />
                    <Bubble delay={800} size={7} left={28} duration={1700} />
                    <Bubble delay={1200} size={5} left={22} duration={2200} />
                    <Bubble delay={1600} size={6} left={18} duration={1900} />
                  </View>
                </TouchableOpacity>
              );
            }

            // Get icon name based on route
            let iconName;
            let Component = MaterialIcons;
            
            if (route.name === 'HomeScreen') {
              iconName = 'cottage'; // Stylish house/home icon
            } else if (route.name === 'Orders') {
              iconName = 'receipt-long'; // Orders icon
            } else if (route.name === 'NotificationScreen') {
              iconName = isFocused ? 'notifications-active' : 'notifications-none'; // Active/inactive notification icon
            } else if (route.name === 'ProfileScreen') {
              iconName = 'person-outline'; // Outlined person icon
            }

            // Regular nav items with active state
            return (
              <TouchableOpacity 
                key={route.key}
                style={index === 0 ? styles.firstNavItem : (index === state.routes.length - 1 ? styles.lastNavItem : styles.navItem)} 
                activeOpacity={0.7}
                onPress={onPress}
              >
                <View style={styles.iconContainer}>
                  <Component 
                    name={iconName} 
                    size={32} // Increased icon size from 28 to 32
                    color={isFocused ? "#222222" : "#AAAAAA"} 
                  />
                  
                  {/* Show notification badge for notification tab if there are unread notifications */}
                  {route.name === 'NotificationScreen' && unreadCount > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
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

// Create a stack navigator for each tab
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Orders" component={OrdersNavigator} />
    <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
    <Stack.Screen name="RedeemScreen" component={RedeemScreen} />
    <Stack.Screen name="OffersScreen" component={OffersScreen} />
    <Stack.Screen name="ServiceWithOffersScreen" component={ServiceWithOffersScreen} />
    <Stack.Screen name="ServiceScreen" component={ServiceScreen} />
    <Stack.Screen name="ClothesScreen" component={ClothesScreen} />
    <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
    <Stack.Screen name="RecentOrdersScreen" component={RecentOrdersScreen} />
    <Stack.Screen name="ServiceCategoryScreen" component={ServiceCategoryScreen} />
    <Stack.Screen name="ServiceDetailScreen" component={ServiceDetailScreen} />
    <Stack.Screen name="BookingScreen" component={BookingScreen} />
    <Stack.Screen name="BookingConfirmationScreen" component={BookingConfirmationScreen} />
    <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />
    <Stack.Screen name="RazorpayScreen" component={RazorpayScreen} />
  </Stack.Navigator>
);

const BottomTabNavigator = () => {
  const colorScheme = useColorScheme();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  useEffect(() => {
    // ... existing code ...
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          display: 'none',
          backgroundColor: '#f8f8f8' 
        },
      }}
    >
      <Tab.Screen name="HomeScreen" component={HomeStack} />
      <Tab.Screen name="Orders" component={OrderScreenNavigator} options={{ title: 'Orders' }} />
      <Tab.Screen name="CartScreen" component={CartScreen} />
      <Tab.Screen name="NotificationScreen" component={NotificationScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    zIndex: 999,
    elevation: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  bottomNavContainer: {
    padding: 4,
    backgroundColor: '#f8f8f8',
    width: '100%',
    elevation: 0,
    borderTopWidth: 0,
    paddingBottom: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 48,
    paddingHorizontal: 8,
  },
  firstNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 48,
    paddingHorizontal: 8,
    paddingLeft: 15,
  },
  lastNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 48,
    paddingHorizontal: 8,
    paddingRight: 15,
  },
  centerNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  centerNavButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    position: 'relative', // For bubble positioning
    overflow: 'visible', // Allow bubbles to overflow
    borderWidth: 2,
    borderColor: '#BBBBBB', // Medium gray border
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
    backgroundColor: 'rgba(170, 170, 170, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    bottom: 30,
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
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
}); 