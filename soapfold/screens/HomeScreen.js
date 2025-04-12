import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import profileImage from '../assets/images/profile-image.png';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { profile } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);

  // State to track the selected tab
  const [selectedTab, setSelectedTab] = useState('Welcome Offer');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={profileImage} style={styles.profileImage} />
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello 👋 {profile?.name || 'Guest'}</Text>
          <Text style={styles.welcomeText}>Welcome</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Tabs Section */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'Welcome Offer' && styles.activeTab]}
            onPress={() => setSelectedTab('Welcome Offer')}
          >
            <Text style={styles.tabText}>Welcome Offer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'Wash & Iron' && styles.activeTab]}
            onPress={() => setSelectedTab('Wash & Iron')}
          >
            <Text style={styles.tabText}>Wash & Iron</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'Ironing' && styles.activeTab]}
            onPress={() => setSelectedTab('Ironing')}
          >
            <Text style={styles.tabText}>Ironing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'Petrol Wash' && styles.activeTab]}
            onPress={() => setSelectedTab('Petrol Wash')}
          >
            <Text style={styles.tabText}>Petrol Wash</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Promo Card */}
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

        {/* Getting Started Card */}
        <View style={styles.getStartedContainer}>
          <Text style={styles.getStartedText}>Getting Started?</Text>
          <Text style={styles.getStartedSubtitle}>See how Laundry heap works and learn more about our services.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Services')}>
            <Ionicons name="arrow-forward" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Recent Orders Section */}
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
                  <Text style={styles.orderDate}>
                    {new Date(order.date).toLocaleDateString()}
                  </Text>
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

      {/* Bottom Navigation Bar */}
      {/* <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image source={require('../assets/images/home.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Category')}>
          <Image source={require('../assets/images/order.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
          <Image source={require('../assets/images/calendar.png')} style={styles.navIcon} />
        </TouchableOpacity>
      </View> */}
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
    backgroundColor: '#fff',
    padding:10,
  },
  header: {
    padding: wp('2%'),
    marginTop: hp('3%'),
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: '15%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 20,
    marginRight: 10,
  },
  greetingContainer: {
    flexDirection: 'column',
    marginLeft: 10,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 0,
  },
  tab: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFF3CC',
  },
  tabText: {
    fontWeight: 'bold',
  },
  offerContainer: {
    padding: 20,
    backgroundColor: '#FFF3CC',
    borderRadius: 20,
    marginVertical: 10,
  },
  offerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  offerDetails: {
    fontSize: 14,
    marginVertical: 2,
  },
  orderButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    width: 100,
    height: 30,
    marginTop: 10,
  },
  getStartedContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  getStartedSubtitle: {
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#007AFF',
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '500',
  },
  noOrders: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  menuButton: {
    marginLeft: 'auto',
    padding: wp('2%'),
  },
});

export default HomeScreen; 