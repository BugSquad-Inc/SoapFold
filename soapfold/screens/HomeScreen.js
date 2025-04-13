import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Animated,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import profileImage from '../assets/images/profile-image.png';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MenuBar from './MenuBar';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { profile } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const [selectedTab, setSelectedTab] = useState('Welcome Offer');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(width));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // PanResponder for swipe gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dx > 20; // Detect swipe right
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          // Close the menu if swiped right enough
          closeMenu();
        }
      },
    })
  ).current;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleMenu = () => {
    if (menuVisible) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    setMenuVisible(false);
    Animated.timing(menuAnimation, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Welcome');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}>
        <MenuBar onLogout={handleLogout} />
      </Animated.View>
      <View style={styles.header}>
        <Image source={profileImage} style={styles.profileImage} />
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello 👋 {profile?.name || 'Guest'}</Text>
          <Text style={styles.welcomeText}>Welcome</Text>
        </View>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {['Welcome Offer', 'Wash & Iron', 'Ironing', 'Petrol Wash'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Offer Card */}
        <View style={styles.offerContainer}>
          <Text style={styles.offerText}>Prepay and save your laundry services</Text>
          <Text style={styles.offerDetails}>€20 minimum order</Text>
          <Text style={styles.offerDetails}>Free 24h delivery</Text>
          <Text style={styles.offerDetails}>Best price guaranteed</Text>
          <TouchableOpacity style={styles.orderButton} onPress={() => navigation.navigate('Order')}>
            <Text style={styles.buttonText}>Order Now</Text>
          </TouchableOpacity>
          <Image source={require('../assets/images/promotional_badge.png')} style={styles.badge} />
        </View>

        {/* Getting Started Section */}
        <View style={styles.getStartedContainer}>
          <View style={styles.getStartedTextContainer}>
            <Text style={styles.getStartedText}>Getting Started?</Text>
            <Text style={styles.getStartedSubtitle}>See how Laundry heap works and learn more about our services.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Services')}>
            <Ionicons name="arrow-forward" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Order')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {orders.length > 0 ? (
            orders.slice(0, 3).map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetails', { order })}
              >
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <Text style={styles.orderDate}>{new Date(order.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.orderStatus}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noOrders}>No recent orders</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return '#4CAF50';
    case 'in progress':
      return '#2196F3';
    case 'pending':
      return '#FF9800';
    default:
      return '#333';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef8e9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    zIndex: 1000,
  },
  header: {
    padding: wp('2%'),
    marginTop: hp('2%'),
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  profileImage: {
    width: wp('15%'),
    aspectRatio: 1,
    borderRadius: 20,
  },
  greetingContainer: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  greeting: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeText: {
    fontSize: wp('4%'),
    color: '#666',
  },
  menuButton: {
    padding: wp('2%'),
  },
  content: {
    flex: 1,
    paddingTop: hp('2%'),
    paddingBottom: 80,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: hp('1.5%'),
  },
  tab: {
    height: hp('5%'),
    paddingHorizontal: wp('5%'),
    marginRight: wp('3%'),
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFF3CC',
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: wp('3.5%'),
  },
  offerContainer: {
    padding: wp('5%'),
    backgroundColor: '#FFF3CC',
    borderRadius: 20,
    marginVertical: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  offerText: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
  },
  offerDetails: {
    fontSize: wp('3.8%'),
    marginVertical: 2,
  },
  orderButton: {
    backgroundColor: '#FFC107',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('8%'),
    borderRadius: 25,
    marginVertical: hp('2%'),
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  badge: {
    width: wp('25%'),
    height: hp('5%'),
    marginTop: hp('1%'),
    resizeMode: 'contain',
  },
  getStartedContainer: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderRadius: 16,
    marginHorizontal: wp('2%'),
    marginBottom: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  getStartedTextContainer: {
    flex: 1,
    paddingRight: wp('4%'),
  },
  getStartedText: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  getStartedSubtitle: {
    color: '#666',
    fontSize: wp('3.8%'),
    flexShrink: 1,
  },
  section: {
    paddingHorizontal: wp('4%'),
    marginTop: hp('2%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#007AFF',
    fontSize: wp('4%'),
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: wp('4%'),
    color: '#666',
    marginTop: 4,
  },
  orderStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  noOrders: {
    textAlign: 'center',
    color: '#666',
    marginTop: hp('2%'),
  },
});

export default HomeScreen;
