import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  validateService, 
  validateQuantity, 
  calculateBasePrice,
  ERROR_MESSAGES 
} from '../../utils/bookingUtils';

const { width } = Dimensions.get('window');

const ServiceDetailScreen = ({ navigation, route }) => {
  const { service, offerExists = false, offerDiscountAmount = 0 } = route.params || {
    name: 'Wash & Fold',
    description: 'Professional washing, drying and folding services',
    price: 14.99,
    unit: 'per kg',
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  };
  
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const insets = useSafeAreaInsets();
  
  // Calculate total price whenever quantity or service changes
  useEffect(() => {
    if (route.params?.service?.price) {
      // Calculate total based on price per kg
      const pricePerKg = parseFloat(route.params.service.price);
      const total = pricePerKg * quantity;
      setTotalPrice(total);
    }
  }, [quantity, route.params?.service]);

  // Validate service data on mount
  useEffect(() => {
    if (!route.params?.service) {
      setError(ERROR_MESSAGES.INVALID_SERVICE);
      return;
    }

    const serviceData = {
      ...route.params.service,
      type: route.params.service.type || 'wash_fold'
    };

    if (!validateService(serviceData)) {
      setError(ERROR_MESSAGES.INVALID_SERVICE);
      return;
    }

    // Initialize total price
    const pricePerKg = parseFloat(route.params.service.price);
    setTotalPrice(pricePerKg);

    setLoading(false);
  }, [route.params?.service]);

  // Sample features list
  const features = [
    'Professional handling of all fabric types',
    'Eco-friendly detergents and supplies',
    'Same-day service available',
    'Free pickup and delivery for orders over ₹30',
    'Satisfaction guaranteed or money back'
  ];
  
  // Sample review data
  const reviews = [
    {
      id: 1,
      name: 'John Doe',
      rating: 5,
      comment: 'Excellent service! My clothes came back perfectly clean and folded.',
      date: '2 weeks ago',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      rating: 4,
      comment: 'Great service overall. Quick turnaround time and professional staff.',
      date: '1 month ago',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    }
  ];
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const calculatePrice = () => {
    if (offerExists) {
      const discount = (service.price * offerDiscountAmount) / 100;
      return (service.price - discount).toFixed(2);
    }
    return service.price;
  };
  
  const handleBooking = () => {
    navigation.navigate('BookingScreen', {
      service: {
        ...service,
        finalPrice: calculatePrice(),
        quantity: quantity
      },
      offerExists,
      offerDiscountAmount
    });
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }
  
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialIcons key={`full-${i}`} name="star" size={16} color="#FFC107" />
      );
    }
    
    if (halfStar) {
      stars.push(
        <MaterialIcons key="half" name="star-half" size={16} color="#FFC107" />
      );
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialIcons key={`empty-${i}`} name="star-outline" size={16} color="#FFC107" />
      );
    }
    
    return stars;
  };
  
  const renderReview = (review) => {
    return (
      <View key={review.id} style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
          <View style={styles.reviewUser}>
            <Text style={styles.reviewName}>{review.name}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
          <View style={styles.reviewRating}>
            {renderStars(review.rating)}
          </View>
        </View>
        <Text style={styles.reviewComment}>{review.comment}</Text>
      </View>
    );
  };
  
  return (
    <ScreenContainer style={{ backgroundColor: '#222222' }}>
      <StatusBar barStyle="light-content" backgroundColor="#222222" />
      <SafeAreaView style={styles.safeArea}>
        {/* Offer Applied Banner */}
        {offerExists && (
          <View style={styles.offerBanner}>
            <MaterialIcons name="local-offer" size={22} color="#fff" />
            <Text style={styles.offerBannerText}>
              Offer Applied! {offerDiscountAmount}% OFF
            </Text>
          </View>
        )}
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: service?.image }} 
            style={styles.headerImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <MaterialIcons name="favorite-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.overlay} />
        </View>
        
        {/* Content */}
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100 // Add extra padding to avoid overflow with bottom bar
          }}
        >
          <View style={styles.contentContainer}>
            {/* Service Info */}
            <View style={styles.serviceInfoContainer}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceName}>{service?.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₹{service?.price}</Text>
                  <Text style={styles.unit}>{service?.unit}</Text>
                </View>
              </View>
              
              <View style={styles.ratingContainer}>
                <View style={styles.ratingStars}>
                  {renderStars(service?.rating)}
                </View>
                <Text style={styles.ratingText}>{service?.rating}</Text>
                <Text style={styles.reviewCount}>({service?.reviews} reviews)</Text>
              </View>
              
              <Text style={styles.description}>{service?.description}</Text>
              
              {/* Features */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Features</Text>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <MaterialIcons name="check-circle" size={18} color={theme.colors.primary} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              {/* Reviews */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Reviews</Text>
                  <TouchableOpacity>
                    <Text style={styles.viewAllButton}>View All</Text>
                  </TouchableOpacity>
                </View>
                {reviews.map(review => renderReview(review))}
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom Bar */}
        <View style={[
          styles.bottomBar, 
          { paddingBottom: Math.max(insets.bottom, 16) + 16 }
        ]}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={decreaseQuantity}
            >
              <MaterialIcons name="remove" size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={increaseQuantity}
            >
              <MaterialIcons name="add" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={handleBooking}
          >
            <Text style={styles.bookButtonText}>
              {offerExists ? `Book Now - ₹${calculatePrice()}` : `Book Now - ₹${service.price}`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#243D6E',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    backgroundColor: '#243D6E',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: '#243D6E',
    borderRadius: 20,
    padding: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#243D6E',
    borderRadius: 20,
    padding: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  serviceInfoContainer: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  unit: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  viewAllButton: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#333',
  },
  reviewItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewUser: {
    flex: 1,
    marginLeft: 12,
  },
  reviewName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#243D6E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    margin: 16,
    marginBottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  offerBannerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
});

export default ServiceDetailScreen; 