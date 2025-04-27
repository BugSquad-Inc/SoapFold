import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import ScreenContainer from '../components/ScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ServiceCategoryScreen = ({ navigation, route }) => {
  const { category = { id: 1, name: 'Laundry', icon: 'local-laundry-service', color: '#4A90E2' } } = route.params || {};
  // Get safe area insets to handle bottom navigation bar
  const insets = useSafeAreaInsets();
  
  // Sample data for services in this category
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Wash & Fold',
      description: 'Professional washing, drying and folding services',
      price: 14.99,
      unit: 'per kg',
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 2,
      name: 'Dry Cleaning',
      description: 'Professional dry cleaning for delicate fabrics',
      price: 24.99,
      unit: 'per item',
      rating: 4.7,
      reviews: 95,
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 3,
      name: 'Ironing & Pressing',
      description: 'Professional ironing and pressing service',
      price: 12.99,
      unit: 'per item',
      rating: 4.6,
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 4,
      name: 'Stain Removal',
      description: 'Expert stain removal for all types of fabrics',
      price: 9.99,
      unit: 'per item',
      rating: 4.5,
      reviews: 62,
      image: 'https://images.unsplash.com/photo-1551761429-8232f9f5955c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 5,
      name: 'Bedding & Linens',
      description: 'Washing and pressing for sheets, covers & pillowcases',
      price: 29.99,
      unit: 'per set',
      rating: 4.9,
      reviews: 105,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 6,
      name: 'Express Service',
      description: '3-hour turnaround for urgent laundry needs',
      price: 34.99,
      unit: 'per load',
      rating: 4.7,
      reviews: 43,
      image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ]);
  
  const renderServiceItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.serviceItem}
        onPress={() => navigation.navigate('ServiceDetailScreen', { service: item })}
      >
        <View style={styles.serviceImageContainer}>
          <Image 
            source={{ uri: item.image }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.serviceContent}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.serviceRatingContainer}>
            <MaterialIcons name="star" size={16} color="#FFC107" />
            <Text style={styles.serviceRating}>{item.rating}</Text>
            <Text style={styles.serviceReviews}>({item.reviews} reviews)</Text>
          </View>
          
          <View style={styles.servicePriceContainer}>
            <Text style={styles.servicePrice}>${item.price}</Text>
            <Text style={styles.serviceUnit}>{item.unit}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <ScreenContainer>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        {/* Services List */}
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[
            styles.serviceList,
            { paddingBottom: insets.bottom + 70 } // Add safe area insets + extra padding for navbar
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <MaterialIcons name={category.icon} size={24} color="#FFF" />
              </View>
              <Text style={styles.listTitle}>All {category.name} Services</Text>
              <Text style={styles.listSubtitle}>{services.length} services available</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  categoryHeader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  serviceList: {
    paddingHorizontal: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  serviceImageContainer: {
    width: 100,
    height: 120,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceContent: {
    flex: 1,
    padding: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  serviceRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceRating: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  serviceReviews: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  servicePriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  serviceUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default ServiceCategoryScreen;
