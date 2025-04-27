import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RedeemScreen = ({ route, navigation }) => {
  // Get insets to properly handle bottom navigation bar
  const insets = useSafeAreaInsets();
  
  // Get the promotion data passed from the previous screen
  const { promotion } = route.params || { 
    promotion: {
      id: '1',
      title: 'UP TO',
      subtitle: '50% OFF',
      description: 'Dry cleaning services',
      backgroundColor: '#000000',
      accentColor: '#FF3B30',
      buttonText: 'Redeem Now',
      iconName: 'arrow-right-circle'
    }
  };

  // List of services that can be used with this promotion
  const eligibleServices = [
    {
      id: '1',
      name: 'Wash & Fold',
      discount: '20% OFF',
      regularPrice: 'Rp 25,000',
      discountedPrice: 'Rp 20,000',
      image: require('../assets/images/laundry.jpg')
    },
    {
      id: '2',
      name: 'Dry Cleaning',
      discount: '50% OFF',
      regularPrice: 'Rp 40,000',
      discountedPrice: 'Rp 20,000',
      image: require('../assets/images/ironing.jpg')
    },
    {
      id: '3',
      name: 'Ironing Service',
      discount: '15% OFF',
      regularPrice: 'Rp 15,000',
      discountedPrice: 'Rp 12,750',
      image: require('../assets/images/ironing.jpg')
    }
  ];

  const handleServiceSelect = (service) => {
    navigation.navigate('ServiceWithOffersScreen', {
      service,
      promotion
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem Offer</Text>
        <View style={styles.rightSpace} />
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{
          ...styles.contentContainer,
          paddingBottom: insets.bottom + 56 // Add safe area insets + space for navbar
        }}
      >
        {/* Promotion Banner */}
        <View style={[styles.promotionBanner, { backgroundColor: promotion.backgroundColor }]}>
          <View style={styles.promotionContent}>
            <Text style={styles.promotionTitle}>{promotion.title}</Text>
            <Text style={[styles.promotionSubtitle, { color: promotion.accentColor }]}>{promotion.subtitle}</Text>
            <Text style={styles.promotionDesc}>{promotion.description}</Text>
          </View>
        </View>

        {/* Eligible Services Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Eligible Services</Text>
          <Text style={styles.sectionDesc}>Select a service to apply this offer</Text>

          {eligibleServices.map((service) => (
            <TouchableOpacity 
              key={service.id} 
              style={styles.serviceCard}
              onPress={() => handleServiceSelect(service)}
            >
              <Image source={service.image} style={styles.serviceImage} />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDiscount}>{service.discount}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.regularPrice}>{service.regularPrice}</Text>
                  <Text style={styles.discountedPrice}>{service.discountedPrice}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#777" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>• Valid until December 31, 2023</Text>
          <Text style={styles.termsText}>• Cannot be combined with other offers</Text>
          <Text style={styles.termsText}>• Valid for first-time users only</Text>
          <Text style={styles.termsText}>• Subject to availability</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16, 
    marginTop: 0,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
  promotionBanner: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  promotionContent: {
    alignItems: 'center',
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  promotionSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  promotionDesc: {
    fontSize: 14,
    color: '#fff',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regularPrice: {
    fontSize: 12,
    color: '#777',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  termsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  rightSpace: {
    width: 40,
  },
  contentContainer: {
    // No paddingBottom here - it's applied dynamically in the component
  },
});

export default RedeemScreen; 