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
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { auth, verifyFirebaseInitialized, getUserFromFirestore } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { theme, getTextStyle } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import topSectionBg from '../../assets/topsection_bg.jpeg';
import { getCustomerOrders } from '../../config/firestore'; // adjust path if needed

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

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const { isDarkMode, theme: activeTheme } = useTheme();
  const [recentOrder, setRecentOrder] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const projectScrollRef = useRef(null);
  
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

  // 1. Define fetchRecentOrder first
  const fetchRecentOrder = async (customerId) => {
    try {
      console.log('Fetching recent orders for customerId:', customerId);
      const orders = await getCustomerOrders(customerId);
      console.log('Received orders from Firestore:', orders);
      
      if (orders && orders.length > 0) {
        console.log('Setting recent order:', orders[0]);
        setRecentOrder(orders[0]);
      } else {
        console.log('No orders found for customer');
        setRecentOrder(null);
      }
    } catch (error) {
      console.error('Error fetching recent order:', error);
      setRecentOrder(null);
    }
  };

  // 2. Now define fetchUserData, which can use fetchRecentOrder
  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      console.log('Current user in fetchUserData:', currentUser?.uid);
      
      if (currentUser) {
        // Get user data from Firestore
        const userData = await getUserFromFirestore(currentUser.uid);
        console.log('User data from Firestore:', userData);
        
        if (userData) {
          setUserData(userData);
          console.log('Using user data from Firestore in home');
          fetchRecentOrder(currentUser.uid); // This is now safe!
        } else {
          // No cached user data, create new user data from auth
          console.log('No user document exists, creating default user');
          
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
            uid: currentUser.uid,
            displayName: displayName || 'User',
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            location: 'Cembung Dafur, Yogyakarta'
          };
          
          console.log('Created default user:', defaultUser);
          
          // Set user data in state
          setUserData(defaultUser);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
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
  }, [route.params?.userUpdated]);

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
    if (!userData || !userData.displayName) return '?';
    
    // Split the name and get initials from first and last name if available
    const nameParts = userData.displayName.trim().split(/\s+/);
    
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    // If there are multiple parts, get first letter of first and last name
    const firstInitial = nameParts[0].charAt(0);
    const lastInitial = nameParts[nameParts.length - 1].charAt(0);
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Get user's first name with multiple fallbacks
  const getUserFirstName = () => {
    // First try from user state
    if (userData?.displayName && userData.displayName !== 'User') {
      return userData.displayName.split(/\s+/)[0];
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
    if (userData?.email) {
      const emailName = userData.email.split('@')[0];
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
    
    // Using direct navigation within the stack
    navigation.navigate('ServiceCategoryScreen', { 
      category: {
        id: service.id.toString(),
        name: service.name,
        icon: service.icon === ClothesIcon ? 'dry-cleaning' : 
              service.icon === LaundryIcon ? 'local-laundry-service' :
              service.icon === IronIcon ? 'iron' : 'layers',
        color: service.color
      }
    });
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
      
      // Sign out from Firebase
      await signOut(auth);
      console.log('User signed out from Firebase Auth');
      
      // The auth state listener in App.js will handle navigation automatically
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
    const photoURL = userData?.photoURL;
    
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
            fetchUserData();
          }}
        />
      );
    } else {
      return <Text style={styles.profileInitial}>{getUserInitial()}</Text>;
    }
  };

  // Add a function to reset onboarding in dev mode
  const resetOnboardingForDev = async () => {
    if (!__DEV__) return; // Only works in development mode
    
    try {
      // Set a flag that will be checked on next app startup
      await AsyncStorage.setItem('@devResetOnboarding', 'true');
      
      // Show an alert to confirm
      Alert.alert(
        'Dev Mode: Onboarding Reset',
        'Onboarding will be reset. Restart the app to see the welcome screens.',
        [{ text: 'OK' }]
      );
      
      console.log('DEV MODE: Onboarding has been flagged for reset on next app start');
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: activeTheme.colors.background }]}>
        <ActivityIndicator size="large" color={activeTheme.colors.primary} />
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

  const firstName = userData?.firstName || userData?.displayName?.split(' ')[0] || 'there';
  
  const projects = [
    {
      id: '1',
      title: 'Wash & Fold',
      description: 'Professional wash and fold service for all your laundry needs',
      icon: 'local-laundry-service',
      active: true
    },
    {
      id: '2',
      title: 'Dry Cleaning',
      description: 'Premium dry cleaning for your delicate fabrics and special garments',
      icon: 'dry-cleaning',
      active: false
    },
    {
      id: '3',
      title: 'Express Service',
      description: 'Same-day turnaround for urgent laundry requests',
      icon: 'timer',
      active: false
    },
    {
      id: '4',
      title: 'Ironing',
      description: 'Professional ironing service for wrinkle-free clothing',
      icon: 'iron',
      active: false
    },
    {
      id: '5',
      title: 'Stain Removal',
      description: 'Specialized stain removal for all types of fabrics',
      icon: 'water-damage',
      active: false
    }
  ];
  
  const tasks = [
    {
      id: '1',
      title: 'Create menu in dashboard & Make user flow',
      completed: true
    },
    {
      id: '2',
      title: 'Make and send prototype to the client',
      completed: false
    },
    {
      id: '3',
      title: 'Finish homepage design',
      completed: false
    }
  ];

  // Promotional Carousel Component
  const PromoCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrolling = useRef(false);

    const originalData = [
      {
        id: '1',
        title: 'UP TO',
        subtitle: '50% OFF',
        description: 'Dry cleaning services',
        backgroundColor: '#000000',
        accentColor: '#FF3B30',
        buttonText: 'Redeem Now',
        iconName: 'arrow-right-circle'
      },
      {
        id: '2',
        title: 'UP TO',
        subtitle: '40% OFF',
        description: 'Wash & fold services',
        backgroundColor: '#000000',
        accentColor: '#007AFF',
        buttonText: 'Redeem Now',
        iconName: 'arrow-right-circle'
      },
      {
        id: '3',
        title: 'UP TO',
        subtitle: '30% OFF',
        description: 'Ironing & premium care',
        backgroundColor: '#000000',
        accentColor: '#FF9500',
        buttonText: 'Redeem Now',
        iconName: 'arrow-right-circle'
      },
      {
        id: '4',
        title: 'UP TO',
        subtitle: '60% OFF',
        description: 'Full service package',
        backgroundColor: '#000000',
        accentColor: '#5856D6',
        buttonText: 'Redeem Now',
        iconName: 'arrow-right-circle'
      }
    ];

    // Create extended data array for seamless infinite scrolling
    const promoData = [...originalData, originalData[0]];

    // Auto scroll timer
    useEffect(() => {
      const timer = setInterval(() => {
        if (scrolling.current) return;
        
        if (activeIndex === promoData.length - 1) {
          // If we're at the clone of first slide, quickly but invisibly jump to the real first slide
          flatListRef.current?.scrollToOffset({
            offset: 0,
            animated: false
          });
          // Add a small delay before updating the state to avoid visual glitches
          setTimeout(() => {
            setActiveIndex(0);
            scrolling.current = false;
          }, 50);
        } else {
          scrolling.current = true;
          flatListRef.current?.scrollToIndex({
            index: activeIndex + 1,
            animated: true
          });
        }
      }, 5000);

      return () => clearInterval(timer);
    }, [activeIndex]);

    // Handle viewable items change
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
      if (viewableItems.length > 0) {
        // Only update activeIndex if we're not in the process of resetting
        if (!scrolling.current || viewableItems[0].index !== 0) {
          setActiveIndex(viewableItems[0].index);
          scrolling.current = false;
        }
      }
    }).current;

    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 50
    }).current;
    
    // Handle manual scroll completion
    const handleMomentumScrollEnd = (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.floor(offsetX / (width - 30) + 0.1); // Add small tolerance for precise detection
      
      // If we've manually scrolled to the duplicate last item, immediately jump back to the first real item
      if (index === promoData.length - 1) {
        scrolling.current = true; // Prevent onViewableItemsChanged from interfering
        
        // Brief delay to ensure scroll has settled
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: 0,
            animated: false
          });
          
          // Additional delay before updating state
          setTimeout(() => {
            setActiveIndex(0);
            scrolling.current = false;
          }, 50);
        }, 10);
      }
    };

    // Render carousel item
    const renderPromoItem = ({ item }) => {
  return (
        <View style={[styles.promoCard, { backgroundColor: item.backgroundColor }]}>
          <View style={styles.promoContentContainer}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>{item.title}</Text>
              <Text style={[styles.promoSubtitle, {color: item.accentColor}]}>{item.subtitle}</Text>
              <Text style={styles.promoDescription}>{item.description}</Text>
              
            <TouchableOpacity
                style={[styles.promoActionButton, {backgroundColor: item.accentColor, marginTop: 10, marginBottom: 4}]}
                onPress={() => {
                  // Navigate through service flow with offer parameters
                  navigation.navigate('ServiceCategoryScreen', {
                    category: {
                      id: 'all',
                      name: 'All Services',
                      icon: 'local-laundry-service',
                      color: activeTheme.colors.primary
                    },
                    offerExists: true,
                    offerDiscountAmount: 30
                  });
                }}
              >
                <Text style={styles.promoActionButtonText}>Redeem Now</Text>
                <Feather name="arrow-right-circle" size={16} color="#FFFFFF" style={{marginLeft: 5}} />
            </TouchableOpacity>
            </View>
            
            <View style={[styles.accentShape, {backgroundColor: item.accentColor}]} />
            
            <View style={styles.promoImageContainer}>
              <Image 
                source={require('../../assets/images/laundry.jpg')} 
                style={styles.promoImage}
                resizeMode="cover"
              />
            </View>
        </View>
        </View>
      );
    };

    return (
      <View style={styles.promoContainer}>
        <FlatList
          ref={flatListRef}
          data={promoData}
          renderItem={renderPromoItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: width - 30,
            offset: (width - 30) * index,
            index
          })}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          decelerationRate={Platform.OS === 'ios' ? 0.8 : 0.92}
          snapToInterval={width - 30}
          snapToAlignment="start"
          disableIntervalMomentum={true}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          removeClippedSubviews={false}
          windowSize={5}
          onScrollToIndexFailed={info => {
            console.warn('Failed to scroll to index', info);
            const wait = new Promise(resolve => setTimeout(resolve, 300));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ 
                index: Math.min(info.index, promoData.length - 1), 
                animated: true,
                viewPosition: 0
              });
            });
          }}
        />
      </View>
    );
  };

  // Handle project box selection with state
  const handleProjectPress = (project, index) => {
    setActiveProjectIndex(index);
    
    // Map project icons to proper icon names for ServiceDetailScreen
    const iconMap = {
      'local-laundry-service': 'local-laundry-service',
      'dry-cleaning': 'dry-cleaning',
      'timer': 'timer',
      'iron': 'iron',
      'opacity': 'opacity'
    };
    
    // Using direct navigation to ServiceDetailScreen instead of ServiceCategoryScreen
    navigation.navigate('ServiceDetailScreen', {
      service: {
        id: project.id.toString(),
        name: project.title,
        icon: iconMap[project.icon] || 'local-laundry-service',
        description: project.description,
        price: project.id === '1' ? 14.99 : project.id === '2' ? 24.99 : 19.99,
        unit: project.id === '1' ? 'per kg' : 'per item',
        rating: 4.8,
        reviews: 124,
        image: project.id === '1' 
          ? 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          : project.id === '2'
          ? 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          : 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      }
    });
  };

  // Function to handle "View All" for recent orders
  const handleViewAllOrders = () => {
    navigation.navigate('CalendarScreen');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: activeTheme.colors.background }]}>
      <ThemedStatusBar backgroundColor="#222222" barStyle="light-content" />
      
      {/* Background container for top section */}
      <ImageBackground source={topSectionBg} style={styles.topSectionContainer} imageStyle={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Hey {firstName}!</Text>
            <View style={styles.projectHeadingContainer}>
              <Text style={styles.subHeading}>Your Laundry</Text>
              <Text style={styles.projectHeading}>Our Daily Duty</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.profileContainer}
            onPress={() => navigation.navigate('Settings', { screen: 'EditProfile' })}
            onLongPress={resetOnboardingForDev}
            delayLongPress={1000}
          >
            {userData?.photoURL ? (
              <Image
                source={{ uri: userData.photoURL }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImageFallback}>
                <Text style={styles.profileInitials}>
                  {firstName.charAt(0).toUpperCase()}
          </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Search Bar positioned to overlap the bottom of the black container */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: activeTheme.colors.cardBackground }]}>
            <View style={styles.searchIconContainer}>
              <Feather name="search" size={16} color={activeTheme.colors.placeholder} />
            </View>
            <TextInput
              style={[styles.searchInput, { color: activeTheme.colors.text }]}
              placeholder="Find laundry services..."
              placeholderTextColor={activeTheme.colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  navigation.navigate('CategoryScreen', {
                    category: 'Search',
                    searchQuery: searchQuery.trim()
                  });
                }
              }}
            />
            <View style={styles.filterButtonContainer}>
              <TouchableOpacity 
                style={[styles.filterButton, { backgroundColor: activeTheme.colors.topSection }]}
                onPress={() => navigation.navigate('CategoryScreen', {
                  category: 'Filter',
                  showFilters: true
                })}
              >
                <MaterialIcons name="tune" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
          </View>
        </View>
      </ImageBackground>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollViewStyle}
      >
        {/* Promotional Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <TouchableOpacity onPress={() => navigation.navigate('OffersScreen', {
            title: 'Special Offers',
            showAllPromotions: true
          })}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>
        
        {/* Promotional Carousel */}
        <PromoCarousel />
        
        {/* Projects Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ServiceCategoryScreen', {
            category: {
              id: 'all',
              name: 'All Services',
              icon: 'local-laundry-service',
              color: activeTheme.colors.primary
            }
          })}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          ref={projectScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.projectsContainer}
          onScroll={(event) => {
            const scrollX = event.nativeEvent.contentOffset.x;
            const boxWidth = 190; // Width + horizontal margins
            const activeIndex = Math.floor(scrollX / boxWidth + 0.5); // Round to nearest
            if (activeIndex !== activeProjectIndex && activeIndex >= 0 && activeIndex < projects.length) {
              setActiveProjectIndex(activeIndex);
            }
          }}
          scrollEventThrottle={16}
        >
          {projects.map((project, index) => (
              <TouchableOpacity 
              key={project.id} 
              style={[
                styles.projectCard, 
                { backgroundColor: index === activeProjectIndex ? '#243D6E' : '#FFFFFF' }
              ]}
              onPress={() => handleProjectPress(project, index)}
            >
              <View style={[styles.projectIconContainer, { backgroundColor: index === activeProjectIndex ? 'rgba(255, 255, 255, 0.15)' : '#F1F1F1' }]}>
                <MaterialIcons 
                  name={
                    project.icon === 'local-laundry-service' ? 'local-laundry-service' : 
                    project.icon === 'dry-cleaning' ? 'dry-cleaning' :
                    project.icon === 'timer' ? 'timer' :
                    project.icon === 'iron' ? 'iron' :
                    project.icon === 'water-damage' ? 'opacity' : 'water'
                  } 
                  size={24} 
                  color={index === activeProjectIndex ? '#FFFFFF' : '#222222'} 
                />
                </View>
              <Text style={[styles.projectTitle, { color: index === activeProjectIndex ? '#FFFFFF' : '#222222' }]}>
                {project.title}
              </Text>
              <Text
                style={[styles.projectDescription, { color: index === activeProjectIndex ? '#FFFFFF' : '#222222' }]}
                numberOfLines={2}
              >
                {project.description}
              </Text>
              <View style={styles.projectArrow}>
                <MaterialIcons 
                  name="chevron-right" 
                  size={24} 
                  color={index === activeProjectIndex ? '#FFFFFF' : '#222222'} 
                />
              </View>
              </TouchableOpacity>
            ))}
          
          {/* Replace See All Card with More button */}
          <TouchableOpacity 
            style={[styles.moreCard, { backgroundColor: '#243D6E' }]}
            onPress={() => navigation.navigate('ServiceCategoryScreen', { 
              category: {
                id: 'all',
                name: 'All Services',
                icon: 'local-laundry-service',
                color: activeTheme.colors.primary
              }
            })}
          >
            <View style={styles.moreContent}>
              <Text style={styles.moreText}>More</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </View>
          </TouchableOpacity>
        </ScrollView>
        
        {/* If there are recent orders shown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={handleViewAllOrders}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {recentOrder ? (
          <TouchableOpacity 
            style={styles.recentOrderCard}
            onPress={() => navigation.navigate('OrderDetailScreen', {
              orderId: recentOrder.id,
              ...recentOrder // pass other order details as needed
            })}
          >
            <View style={styles.recentOrderHeader}>
              <View style={styles.orderInfoContainer}>
                <Text style={styles.orderNumber}>#{recentOrder.id}</Text>
                <Text style={styles.orderDate}>
                  {recentOrder.createdAt 
                    ? new Date(recentOrder.createdAt.seconds * 1000).toLocaleString() 
                    : ''}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#FFF3E0' }]}>
                <View style={[styles.statusIndicator, { backgroundColor: '#FFA500' }]} />
                <Text style={[styles.statusText, { color: '#FFA500' }]}>
                  {recentOrder.status}
                </Text>
              </View>
            </View>
            {/* Render items, total, etc. */}
            <View style={styles.orderItemsPreview}>
              {recentOrder.items && recentOrder.items.map((item, idx) => (
                <View key={idx} style={styles.orderItemPreview}>
                  <MaterialIcons name="checkroom" size={18} color="#666" />
                  <Text style={styles.orderItemPreviewText}>
                    {item.name} ({item.quantity})
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.orderSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>₹{recentOrder.totalAmount}</Text>
              </View>
              <TouchableOpacity style={styles.trackOrderButton}>
                <Text style={styles.trackOrderText}>Track Order</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={{ textAlign: 'center', color: '#888', margin: 20 }}>
            No recent orders found.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  // New container for the black background top section
  topSectionContainer: {
    backgroundColor: '#243D6E',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 25 : 15,
    paddingBottom: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 25,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  greeting: {
    ...getTextStyle('medium', 'sm', '#FFFFFF'),
    marginBottom: 10,
    fontSize: 16,
    letterSpacing: 0,
  },
  subHeading: {
    ...getTextStyle('bold', 'lg', '#FFFFFF'),
    fontSize: 32,
    letterSpacing: -0.3,
    lineHeight: 35,
  },
  profileContainer: {
    marginLeft: 15,
    paddingRight: 6,
  },
  profileImage: {
    width: 55, // Larger profile image
    height: 55, // Larger profile image
    borderRadius: 16, // Rounded square corners
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImageFallback: {
    width: 55, // Match profile image size
    height: 55, // Match profile image size
    borderRadius: 16, // Rounded square corners
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInitials: {
    ...getTextStyle('medium', 'md', '#FFFFFF'),
    fontSize: 22, // Larger text for larger container
  },
  searchContainer: {
    paddingHorizontal: 18,
    position: 'absolute',
    bottom: -24,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
    elevation: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 14,
    width: '88%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIconContainer: {
    marginRight: 10,
    width: 22,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    ...getTextStyle('regular', 'sm', '#555555'),
    height: 54, // Match container height
    fontSize: 15,
    paddingVertical: 0,
    color: '#555555',
  },
  filterButtonContainer: {
    backgroundColor: '#FFFFFF', // White background for the filter container
    borderRadius: 10,
    padding: 4,
    marginLeft: 10,
  },
  filterButton: {
    backgroundColor: '#222222',
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewStyle: {
    marginTop: 5,
  },
  scrollContent: {
    paddingTop: 0, // Removed paddingTop to reduce the gap
    paddingBottom: 100, // Increased to provide enough space for the navbar
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    ...getTextStyle('bold', 'lg', '#222'),
  },
  sectionLink: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  projectsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    marginTop: 8,
  },
  projectCard: {
    width: 190, // Increased width
    height: 210,
    borderRadius: 25,
    marginHorizontal: 8,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4.5,
    elevation: 3,
    marginBottom: 20,
  },
  projectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  projectTitle: {
    ...getTextStyle('bold', 'md', '#222'),
    fontSize: 16,
    marginBottom: 8,
  },
  projectDescription: {
    ...getTextStyle('regular', 'sm', '#222'),
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  projectArrow: {
    position: 'absolute',
    bottom: 18,
    right: 18,
  },
  tasksContainer: {
    paddingHorizontal: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  taskCheckbox: {
    marginRight: 15,
  },
  taskCheckboxUnchecked: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#DDD',
  },
  taskCheckboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    flex: 1,
    ...getTextStyle('medium', 'sm', '#222'),
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginLeft: 10,
  },
  projectHeadingContainer: {
    flexDirection: 'column',
  },
  projectHeading: {
    ...getTextStyle('bold', 'xl', '#FFFFFF'),
    fontSize: 32,
    letterSpacing: -0.3,
    marginTop: 0,
    lineHeight: 35,
  },
  promoContainer: {
    marginHorizontal: 15,
    marginTop: 5,
    marginBottom: 20,
  },
  promoCard: {
    width: width - 30, // Full width minus margins
    height: 190, // Increased height
    borderRadius: 16,
    marginHorizontal: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  promoContentContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    position: 'relative',
  },
  accentShape: {
    position: 'absolute',
    width: 150,
    height: 250,
    transform: [{rotate: '-25deg'}],
    right: -30,
    top: -40,
    opacity: 0.8,
    zIndex: 1,
  },
  promoTextContainer: {
    paddingLeft: 20,
    paddingTop: 25,
    paddingRight: 10,
    zIndex: 2,
    width: '70%',
    justifyContent: 'center',
  },
  promoTitle: {
    ...getTextStyle('regular', 'sm', '#FFFFFF'),
    fontSize: 16,
    opacity: 0.9,
  },
  promoSubtitle: {
    ...getTextStyle('bold', '2xl', '#FFFFFF'),
    fontSize: 34,
    marginTop: 0,
    letterSpacing: -0.5,
  },
  promoDescription: {
    ...getTextStyle('medium', 'sm', '#FFFFFF'),
    fontSize: 14,
    marginTop: 5,
    opacity: 0.8,
  },
  promoImageContainer: {
    position: 'absolute',
    right: 20,
    bottom: 35,
    width: 120,
    height: 120,
    zIndex: 3,
    alignSelf: 'center',
  },
  promoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  seeAllCard: {
    width: 110,
    height: 210,
    backgroundColor: '#F8F8F8',
    borderRadius: 25,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 20,
  },
  seeAllContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllText: {
    ...getTextStyle('medium', 'md', '#666666'),
    marginBottom: 8,
    fontSize: 16,
  },
  promoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    marginTop: 10,
  },
  promoActionButtonText: {
    ...getTextStyle('medium', 'sm', '#FFFFFF'),
    fontSize: 13,
  },
  recentOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfoContainer: {
    flex: 1,
  },
  orderNumber: {
    ...getTextStyle('bold', 'md', '#222'),
    fontSize: 16,
    marginBottom: 4,
  },
  orderDate: {
    ...getTextStyle('medium', 'sm', '#888'),
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...getTextStyle('medium', 'sm'),
    fontSize: 12,
    fontWeight: '600',
  },
  orderItemsPreview: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderItemPreviewText: {
    ...getTextStyle('medium', 'sm', '#666'),
    fontSize: 14,
    marginLeft: 8,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    ...getTextStyle('medium', 'sm', '#888'),
    marginRight: 8,
  },
  summaryValue: {
    ...getTextStyle('bold', 'md', '#222'),
    fontSize: 16,
  },
  trackOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  trackOrderText: {
    ...getTextStyle('medium', 'sm', '#FFFFFF'),
    fontSize: 14,
    marginRight: 6,
  },
  moreCard: {
    width: 110,
    height: 210,
    backgroundColor: '#243D6E',
    borderRadius: 25,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  moreContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    ...getTextStyle('medium', 'md', '#FFFFFF'),
    marginBottom: 8,
    fontSize: 16,
  },
  viewAllText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;

