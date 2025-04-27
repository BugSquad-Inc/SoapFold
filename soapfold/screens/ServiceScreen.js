import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { theme, getTextStyle } from '../utils/theme';

const ServiceScreen = ({ navigation, route }) => {
  // Extract params if service type is pre-selected
  const { serviceType, serviceId, appliedOfferId, appliedOfferTitle, appliedOfferColor } = route.params || {};
  
  // UI States
  const [activeTab, setActiveTab] = useState(serviceType || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOfferBanner, setShowOfferBanner] = useState(!!appliedOfferId);
  
  // Animation values
  const offerBannerHeight = useRef(new Animated.Value(60)).current;
  const tabIndicatorPos = useRef(new Animated.Value(0)).current;
  
  // Service tabs
  const serviceTabs = [
    'All',
    'Wash & Fold',
    'Dry Cleaning',
    'Ironing',
    'Express',
    'Specialty'
  ];
  
  // Service items data
  const serviceItems = [
    // Wash & Fold services
    {
      id: 'wf1',
      name: 'Regular Laundry',
      description: 'Everyday clothes washed, dried and folded',
      price: 12.99,
      unit: 'kg',
      category: 'Wash & Fold',
      image: require('../assets/images/laundry.jpg'),
    },
    {
      id: 'wf2',
      name: 'Bedding & Linens',
      description: 'Sheets, pillowcases, and towels',
      price: 15.99,
      unit: 'kg',
      category: 'Wash & Fold',
      image: require('../assets/images/laundry.jpg'),
    },
    
    // Dry Cleaning services
    {
      id: 'dc1',
      name: 'Suits & Blazers',
      description: 'Professional cleaning for business attire',
      price: 24.99,
      unit: 'item',
      category: 'Dry Cleaning',
      image: require('../assets/images/laundry.jpg'),
    },
    {
      id: 'dc2',
      name: 'Dresses & Gowns',
      description: 'Careful treatment for delicate dresses',
      price: 29.99,
      unit: 'item',
      category: 'Dry Cleaning',
      image: require('../assets/images/laundry.jpg'),
    },
    
    // Ironing services
    {
      id: 'ir1',
      name: 'Shirts & Blouses',
      description: 'Professional ironing for perfect presentation',
      price: 4.99,
      unit: 'item',
      category: 'Ironing',
      image: require('../assets/images/ironing.jpg'),
    },
    {
      id: 'ir2',
      name: 'Pants & Trousers',
      description: 'Precise pressing for crisp creases',
      price: 5.99,
      unit: 'item',
      category: 'Ironing',
      image: require('../assets/images/ironing.jpg'),
    },
    
    // Express services
    {
      id: 'ex1',
      name: 'Express Wash & Fold',
      description: 'Same-day service for urgent laundry',
      price: 18.99,
      unit: 'kg',
      category: 'Express',
      image: require('../assets/images/laundry.jpg'),
    },
    {
      id: 'ex2',
      name: 'Express Dry Cleaning',
      description: '24-hour turnaround for special occasions',
      price: 34.99,
      unit: 'item',
      category: 'Express',
      image: require('../assets/images/laundry.jpg'),
    },
    
    // Specialty services
    {
      id: 'sp1',
      name: 'Stain Removal',
      description: 'Expert treatment for tough stains',
      price: 9.99,
      unit: 'stain',
      category: 'Specialty',
      image: require('../assets/images/laundry.jpg'),
    },
    {
      id: 'sp2',
      name: 'Leather & Suede',
      description: 'Special care for delicate materials',
      price: 49.99,
      unit: 'item',
      category: 'Specialty',
      image: require('../assets/images/laundry.jpg'),
    }
  ];
  
  // Filter services based on active tab and search query
  const getFilteredServices = () => {
    let filtered = serviceItems;
    
    // Filter by category if not "All"
    if (activeTab !== 'All') {
      filtered = filtered.filter(item => item.category === activeTab);
    }
    
    // Filter by search query if it exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  // Handle tab change with animation
  const handleTabChange = (tab, index) => {
    // Animate tab indicator
    Animated.spring(tabIndicatorPos, {
      toValue: index * 100, // Approximate width
      friction: 8,
      tension: 60,
      useNativeDriver: false, // Using left positioning
    }).start();
    
    // Set the active tab
    setActiveTab(tab);
  };
  
  // Handle service item selection
  const handleServiceSelect = (service) => {
    navigation.navigate('ClothesScreen', { 
      serviceId: service.id, 
      serviceName: service.name,
      serviceCategory: service.category,
      appliedOfferId,
      appliedOfferTitle
    });
  };
  
  // Hide offer banner
  const hideOfferBanner = () => {
    Animated.timing(offerBannerHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      setShowOfferBanner(false);
    });
  };
  
  // Calculate initial position for tab indicator
  useEffect(() => {
    if (serviceType) {
      const index = serviceTabs.indexOf(serviceType);
      if (index !== -1) {
        tabIndicatorPos.setValue(index * 100); // Set initial position
      }
    }
  }, []);
  
  // Render a service item
  const renderServiceItem = ({ item }) => {
    const discountedPrice = appliedOfferId ? 
      (item.price * (1 - parseInt(appliedOfferTitle) / 100)).toFixed(2) : 
      null;
    
    return (
      <TouchableOpacity 
        style={styles.serviceItem}
        onPress={() => handleServiceSelect(item)}
      >
        <View style={styles.serviceImageContainer}>
          <Image 
            source={item.image}
            style={styles.serviceImage}
            resizeMode="cover"
          />
          {item.category === 'Express' && (
            <View style={styles.expressTag}>
              <Text style={styles.expressTagText}>Express</Text>
            </View>
          )}
        </View>
        
        <View style={styles.serviceContent}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.priceContainer}>
            {discountedPrice ? (
              <View style={styles.discountedPriceContainer}>
                <Text style={styles.originalPrice}>${item.price}/{item.unit}</Text>
                <Text style={styles.discountedPrice}>${discountedPrice}/{item.unit}</Text>
              </View>
            ) : (
              <Text style={styles.servicePrice}>${item.price}/{item.unit}</Text>
            )}
            
            <TouchableOpacity style={styles.addButton}>
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#222222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Laundry Services</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('CartScreen')}>
          <MaterialIcons name="shopping-cart" size={24} color="#222222" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Applied Offer Banner */}
      {showOfferBanner && (
        <Animated.View 
          style={[
            styles.offerBanner, 
            { 
              height: offerBannerHeight,
              backgroundColor: appliedOfferColor || '#222222' 
            }
          ]}
        >
          <View style={styles.offerBannerContent}>
            <MaterialIcons name="local-offer" size={18} color="#FFFFFF" />
            <Text style={styles.offerBannerText}>
              {appliedOfferTitle} OFF applied to selected services
            </Text>
          </View>
          <TouchableOpacity style={styles.offerBannerClose} onPress={hideOfferBanner}>
            <Feather name="x" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#888888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor="#888888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#888888" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="filter" size={20} color="#222222" />
        </TouchableOpacity>
      </View>
      
      {/* Service Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {serviceTabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => handleTabChange(tab, index)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
          <Animated.View 
            style={[
              styles.tabIndicator,
              {
                left: tabIndicatorPos,
                backgroundColor: appliedOfferColor || theme.colors.primary
              }
            ]} 
          />
        </ScrollView>
      </View>
      
      {/* Service Items List */}
      <FlatList
        data={getFilteredServices()}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="search" size={50} color="#CCCCCC" />
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    ...getTextStyle('bold', 'lg', '#222222'),
  },
  cartButton: {
    padding: 5,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    ...getTextStyle('bold', 'xs', '#FFFFFF'),
    fontSize: 10,
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  offerBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerBannerText: {
    ...getTextStyle('medium', 'sm', '#FFFFFF'),
    marginLeft: 10,
  },
  offerBannerClose: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    ...getTextStyle('regular', 'sm', '#222222'),
    padding: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tabsScrollContent: {
    paddingHorizontal: 15,
  },
  tab: {
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  tabText: {
    ...getTextStyle('medium', 'sm', '#666666'),
  },
  activeTabText: {
    ...getTextStyle('bold', 'sm', '#222222'),
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: 70,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  servicesList: {
    padding: 15,
    paddingBottom: 30,
  },
  serviceItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    ...theme.shadowSm,
  },
  serviceImageContainer: {
    width: 120,
    height: 140,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  expressTag: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  expressTagText: {
    ...getTextStyle('bold', 'xs', '#FFFFFF'),
    fontSize: 10,
  },
  serviceContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  serviceName: {
    ...getTextStyle('bold', 'md', '#222222'),
    marginBottom: 5,
  },
  serviceDescription: {
    ...getTextStyle('regular', 'sm', '#666666'),
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  servicePrice: {
    ...getTextStyle('bold', 'md', '#222222'),
  },
  discountedPriceContainer: {
    flexDirection: 'column',
  },
  originalPrice: {
    ...getTextStyle('regular', 'sm', '#888888'),
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    ...getTextStyle('bold', 'md', theme.colors.primary),
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    ...getTextStyle('bold', 'md', '#777777'),
    marginTop: 20,
    marginBottom: 5,
  },
  emptySubtext: {
    ...getTextStyle('regular', 'sm', '#999999'),
    textAlign: 'center',
  },
});

export default ServiceScreen; 