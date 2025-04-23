import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5,
};

// Custom icon components
const ClothesIcon = ({ size, color }) => (
  <MaterialIcons name="dry-cleaning" size={size} color={color} />
);

const LaundryIcon = ({ size, color }) => (
  <MaterialIcons name="local-laundry-service" size={size} color={color} />
);

const IronIcon = ({ size, color }) => (
  <MaterialIcons name="iron" size={size} color={color} />
);

const FoldIcon = ({ size, color }) => (
  <MaterialIcons name="layers" size={size} color={color} />
);

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Service categories
  const services = [
    { id: 1, name: 'Dry', icon: ClothesIcon, color: '#FFCA28' },
    { id: 2, name: 'Laundry', icon: LaundryIcon, color: '#222222' },
    { id: 3, name: 'Iron', icon: IronIcon, color: '#222222' },
    { id: 4, name: 'Fold', icon: FoldIcon, color: '#222222' }
  ];
  
  // Laundry nearby data
  const laundryNearby = [
    { id: 1, name: 'Clean Express', rating: 4.8 },
    { id: 2, name: 'Wash & Fold', rating: 4.6 }
  ];

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      console.log('Fetching user data on screen focus or load');
      // Try local storage first for immediate display
      const cachedUserData = await AsyncStorage.getItem('@userData');
      if (cachedUserData) {
        const userData = JSON.parse(cachedUserData);
        console.log('Using cached user data immediately:', userData);
        setUser(userData);
      }

      // Get the email
      const userEmail = auth.currentUser?.email || (cachedUserData ? JSON.parse(cachedUserData).email : null);
      console.log('User email:', userEmail);
      
      if (!userEmail) {
        console.log('No user email found in auth or cache');
        setLoading(false);
        return;
      }
      
      // Try to get data from Firestore using email if auth user isn't ready
      if (!auth.currentUser) {
        console.log('Auth not ready, trying Firestore query by email');
        if (userEmail) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', userEmail));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const userId = querySnapshot.docs[0].id;
            console.log('Found user by email query:', userData);
            setUser(userData);
            await AsyncStorage.setItem('@userData', JSON.stringify(userData));
            setLoading(false);
            return;
          }
        }
      }
      
      // Continue with normal flow if auth is ready
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Then fetch from Firestore for up-to-date data
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          // User data exists in Firestore
          const userData = userDoc.data();
          console.log('Firestore user data:', userData);
          
          // Check Google provider data for name if it exists
          const googleProvider = currentUser.providerData.find(
            provider => provider.providerId === 'google.com'
          );
          
          // If displayName is not set or is default 'User', try to update it from auth sources
          if (!userData.displayName || userData.displayName === 'User') {
            // First try the direct auth displayName
            if (currentUser.displayName) {
              userData.displayName = currentUser.displayName;
              console.log('Using auth displayName:', currentUser.displayName);
            } 
            // Then try Google provider data if available
            else if (googleProvider && googleProvider.displayName) {
              userData.displayName = googleProvider.displayName;
              console.log('Using Google provider displayName:', googleProvider.displayName);
            }
            
            // Update Firestore with the new displayName if we found one
            if (userData.displayName && userData.displayName !== 'User') {
              console.log('Updating Firestore with displayName:', userData.displayName);
              await updateDoc(doc(db, 'users', currentUser.uid), {
                displayName: userData.displayName
              });
            }
          }
          
          // Set user data in state
          setUser(userData);
          
          // Cache the updated data
          await AsyncStorage.setItem('@userData', JSON.stringify(userData));
        } else {
          console.log('No user document exists, creating default user');
          // Create basic user data if doesn't exist
          
          // Check for name in Google provider data
          const googleProvider = currentUser.providerData.find(
            provider => provider.providerId === 'google.com'
          );
          
          // Try to get a name from the email
          let displayName = currentUser.displayName || 
                          (googleProvider ? googleProvider.displayName : null);
          
          // If still no name, try to use email username
          if (!displayName || displayName === 'User') {
            const email = currentUser.email;
            if (email) {
              const emailName = email.split('@')[0];
              if (emailName && emailName.length > 2) {
                displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                console.log('Using name from email:', displayName);
              }
            }
          }
          
          const defaultUser = {
            displayName: displayName || 'User',
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            createdAt: serverTimestamp(),
            location: 'Cembung Dafur, Yogyakarta'
          };
          
          console.log('Created default user:', defaultUser);
          
          // Set user data in state
          setUser(defaultUser);
          
          // Save the default user data to Firestore
          try {
            await setDoc(doc(db, 'users', currentUser.uid), defaultUser);
            // Cache the data
            await AsyncStorage.setItem('@userData', JSON.stringify(defaultUser));
          } catch (saveError) {
            console.error('Error saving default user data:', saveError);
          }
        }
      }
      setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

  // Initial animation and data fetch
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();

    // Initial data fetch
    fetchUserData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('HomeScreen focused - refreshing user data');
      fetchUserData();
      return () => {}; // cleanup function
    }, [])
  );

  // Helper to get user's initials
  const getUserInitial = () => {
    if (!user || !user.displayName) return '?';
    
    // Split the name and get initials from first and last name if available
    const nameParts = user.displayName.trim().split(/\s+/);
    
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    // If there are multiple parts, get first letter of first and last name
    const firstInitial = nameParts[0].charAt(0);
    const lastInitial = nameParts[nameParts.length - 1].charAt(0);
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Get user's first name with multiple fallbacks
  const getUserFirstName = () => {
    // First try from user state (which comes from Firestore)
    if (user?.displayName && user.displayName !== 'User') {
      return user.displayName.split(/\s+/)[0];
    }
    
    // Then try from auth.currentUser directly
    if (auth.currentUser?.displayName) {
      return auth.currentUser.displayName.split(/\s+/)[0];
    }
    
    // Next try from Google provider data
    const googleProvider = auth.currentUser?.providerData?.find(
      provider => provider.providerId === 'google.com'
    );
    
    if (googleProvider?.displayName) {
      return googleProvider.displayName.split(/\s+/)[0];
    }

    // Try to get a name from the email address (before the @)
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize the first letter and return if email username seems like a name
      if (emailName && emailName.length > 2) {
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }
    }
    
    // Finally fall back to 'User'
    return 'User';
  };

  const handleServicePress = (service) => {
    // Add press animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
    
    // Navigate to parent navigator first, then to the screen
    navigation.navigate('CategoryScreen', { category: service.name });
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceItem}
      onPress={() => handleServicePress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.serviceIconContainer, { backgroundColor: item.color }]}>
        <item.icon size={26} color="#fff" />
      </View>
      <Text style={styles.serviceText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderLaundryItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.laundryCard} onPress={() => navigation.navigate('LaundryDetail', { laundry: item })}>
        <View style={styles.laundryImageContainer}>
          <Image source={item.image} style={styles.laundryImage} resizeMode="cover" />
          
          <View style={styles.laundryRating}>
            <Ionicons name="star" size={12} color="#FFCA28" />
            <Text style={{ color: 'white', fontSize: 10, marginLeft: 2, fontWeight: '600' }}>
              {item.rating}
            </Text>
          </View>
        </View>
        
        <View style={styles.laundryCardContent}>
          <Text style={styles.laundryName}>{item.name}</Text>
          <Text style={styles.laundryLocation}>
            <Ionicons name="location-outline" size={12} color="#777" />
            {item.location}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('Starting logout process from HomeScreen...');
      
      // Clear user data from AsyncStorage, but keep onboarding status
      const keys = ['@userData', '@user', '@authUser', '@userToken'];
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      console.log('AsyncStorage items removed (keeping @hasSeenOnboarding)');
      
      // Now sign out from Firebase
      await signOut(auth);
      console.log('User signed out from Firebase Auth');
      
      // The auth state listener in App.js will handle navigation automatically
      // No need to navigate here as the auth state change will trigger App.js to show the Auth stack
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  // Update profile button click to navigate directly to profile screen
  const goToProfile = () => {
    // Now unnecessary since we use tab navigation
  };

  // Render profile image or initials with enhanced error handling and cache invalidation
  const renderProfileImage = () => {
    // Add timestamp to URL to prevent caching if the URL contains cloudinary
    const photoURL = user?.photoURL;
    
    if (photoURL) {
      // Add cache-busting parameter for Cloudinary URLs
      const imageUrl = photoURL.includes('cloudinary.com') 
        ? `${photoURL}?t=${new Date().getTime()}` 
        : photoURL;
        
      console.log('Loading profile image:', imageUrl);
      
      return (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.profileImage}
          onError={(e) => {
            console.log('Error loading profile image:', e.nativeEvent.error);
            // If image fails to load, force a re-fetch of user data
            AsyncStorage.getItem('@userData').then(data => {
              if (data) {
                const userData = JSON.parse(data);
                if (userData.photoURL === photoURL) {
                  // Remove the photoURL from cache to try a fresh load next time
                  delete userData.photoURL;
                  AsyncStorage.setItem('@userData', JSON.stringify(userData));
                }
              }
            });
          }}
        />
      );
    } else {
      return <Text style={styles.profileInitial}>{getUserInitial()}</Text>;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFCA28" />
      </View>
    );
  }

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  const serviceOpacity = scrollY.interpolate({
    inputRange: [0, 50, 150],
    outputRange: [1, 1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <Animated.View style={[
        styles.header,
        { transform: [{ translateY: headerTranslateY }] }
      ]}>
        <View style={styles.headerContent}>
            <TouchableOpacity
            style={styles.profileButton} 
            onPress={goToProfile} 
            activeOpacity={0.8}
          >
            <View style={styles.profilePlaceholder}>
              {renderProfileImage()}
            </View>
            </TouchableOpacity>
          
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
            <MaterialIcons name="notifications-none" size={24} color="#FFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Hey, {getUserFirstName()} <Text style={styles.emoji}>👋</Text>
          </Text>
          <Text style={styles.taglineText}>Get smart experience in washing</Text>
          
          <TouchableOpacity style={styles.locationContainer} activeOpacity={0.8}>
            <MaterialIcons name="location-pin" size={14} color="#FFCA28" />
            <Text style={styles.locationText}>Cembung Dafur, Yogyakarta</Text>
            <MaterialIcons name="keyboard-arrow-down" size={14} color="#777" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories */}
        <Animated.View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Category</Text>
          
          <View style={styles.serviceGrid}>
            {services.map(service => (
              <TouchableOpacity 
                key={service.id}
                style={styles.serviceItem}
                onPress={() => handleServicePress(service)}
                activeOpacity={0.7}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: service.color }]}>
                  <service.icon size={26} color="#fff" />
                </View>
                <Text style={styles.serviceText}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
        
        {/* Nearby Laundry */}
        <View style={styles.nearbySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Laundry Nearby</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.laundryCardsContainer}>
            <TouchableOpacity style={[styles.laundryCard, SHADOW]} activeOpacity={0.9}>
              <View style={styles.laundryImagePlaceholder}>
                <MaterialIcons name="local-laundry-service" size={30} color="#666" />
              </View>
              <View style={styles.laundryRating}>
                <Text style={styles.ratingText}>4.8</Text>
                <MaterialIcons name="star" size={10} color="#FFD700" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.laundryCard, SHADOW]} activeOpacity={0.9}>
              <View style={styles.laundryImagePlaceholder}>
                <MaterialIcons name="local-laundry-service" size={30} color="#666" />
                </View>
              <View style={styles.laundryRating}>
                <Text style={styles.ratingText}>4.6</Text>
                <MaterialIcons name="star" size={10} color="#FFD700" />
                </View>
              </TouchableOpacity>
          </View>
        </View>
        
        {/* Spacer for bottom navigation */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileButton: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFF',
  },
  welcomeSection: {
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  emoji: {
    fontSize: 20,
  },
  taglineText: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
    fontWeight: '400',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 11,
    color: '#CCCCCC',
    marginLeft: 4,
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 5,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  serviceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  serviceItem: {
    alignItems: 'center',
    width: width / 4 - 18,
    marginBottom: 18,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    color: '#DDDDDD',
    textAlign: 'center',
    marginTop: 4,
    width: '100%',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  nearbySection: {
    marginBottom: 24,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  laundryCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  laundryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    width: width / 2 - 24,
    marginRight: 12,
    position: 'relative',
    height: 120,
  },
  laundryImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  laundryImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  laundryCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  laundryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  laundryLocation: {
    fontSize: 10,
    color: '#BBBBBB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#FFCA28',
    fontSize: 13,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
    marginRight: 3,
  },
  bottomSpacer: {
    height: 20, // Reduced height for tab navigator space
  },
  laundryRating: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  laundryImageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  laundryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default HomeScreen;

