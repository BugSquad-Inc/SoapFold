import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MaterialIcons } from '@expo/vector-icons';

// Import your images
const images = {
  ironing: require('../assets/images/ironing.jpg'),
  wash: require('../assets/images/laundry.jpg'),
  // washIron: require('../assets/images/wash_iron.png'),
  // welcomeOffer: require('../assets/images/welcome_offer.png'),
  // dryClean: require('../assets/images/dry_clean.png'),
  // shoeCleaning: require('../assets/images/shoe_cleaning.png'),
  // bulkOrder: require('../assets/images/bulk_order.png'),
};





const services = [
  {
    title: 'IRONING',
    description: 'Enjoy 10% off ironing service!',
    tag: 'ironing',
    color: '#fbd0f9',
    image: images.ironing,
  },
  {
    title: 'WASH',
    description: 'Limited Time: 10% off wash service!',
    tag: '10% off',
    color: '#fef0b9',
    image: images.wash,
  },
  {
    title: 'WASH & IRON',
    description: 'Save 10% on wash & iron service!',
    tag: 'wash & iron',
    color: '#fcd6ae',
    // image: images.washIron,
  },
  {
    title: 'WELCOME OFFER',
    description: 'Get 15% off next order!',
    tag: 'next order',
    color: '#c9e7f2',
    // image: images.welcomeOffer,
  },
  {
    title: 'DRY CLEAN',
    description: 'Premium dry clean at 20% off!',
    tag: 'dry clean',
    color: '#dde3fb',
    // image: images.dryClean,
  },
  {
    title: 'SHOE CLEANING',
    description: 'Fresh kicks? 15% off shoe care!',
    tag: 'shoe cleaning',
    color: '#d6f5f3',
    // image: images.shoeCleaning,
  },
  {
    title: 'BULK ORDER',
    description: 'Save big with bulk orders!',
    tag: 'bulk offer',
    color: '#ffe7cc',
    // image: images.bulkOrder,
  },
];

const CategoryScreen = ({ navigation }) => {
  // const handleContinueToCart = (service) => {
  //   const serviceDefaults = {
  //     'IRONING': ['Shirt', 'Pant', 'Bedsheet'],
  //     'WASH': ['Towel', 'Kurta', 'Pillow Cover'],
  //     'WASH & IRON': ['Shirt', 'Saree', 'Blazer'],
  //     'WELCOME OFFER': ['Shirt', 'Pant'],
  //     'DRY CLEAN': ['Saree', 'Suit', 'Curtain'],
  //     'SHOE CLEANING': ['Sneakers', 'Leather Shoes', 'Heels'],
  //     'BULK ORDER': ['School Uniform', 'Hotel Linen', 'Corporate Wear'],
  //   };

  //   const defaultItems = serviceDefaults[service.title] || ['Shirt', 'Pant', 'Kurta']; // fallback

  //   navigation.navigate('CartScreen', {
  //     serviceTitle: service.title,
  //     selectedItems: defaultItems,
  //     color: service.color,
  //     image: service.image,
  //   });
  // };


  const handleContinueToCart = (service) => {
    navigation.navigate('CartScreen', {
      serviceTitle: service.title,
    });
  };
  
  const goBackToHome = () => {
    navigation.navigate('MainTabs', { screen: 'HomeScreen' });
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Services</Text>
        {services.map((service, index) => (
          <Animatable.View
            animation="fadeInUp"
            delay={index * 100}
            duration={600}
            key={index}
            style={[styles.card, { backgroundColor: service.color }]}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardDesc}>{service.description}</Text>
                <Animatable.View animation="pulse" duration={600} iterationCount={1}>
                  <TouchableOpacity style={styles.offerButton} onPress={() => handleContinueToCart(service)}>
                    <Text style={styles.offerButtonText}>Continue</Text>
                  </TouchableOpacity>
                </Animatable.View>
              </View>
              <View style={styles.imagePlaceholder}>
                <Image source={service.image} style={styles.serviceImage} />
              </View>
            </View>
          </Animatable.View>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={goBackToHome} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef8e9',
    margin: hp('2%'),
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    marginTop: hp('2%'),
    fontSize: wp('7%'),
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    color: '#2b2b2b',
    marginBottom: hp('2%'),
  },
  card: {
    borderRadius: 18,
    marginBottom: hp('2.5%'),
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    height: hp('18%'),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: wp('4%'),
    height: '100%',
  },
  cardLeft: {
    flex: 1,
    paddingRight: wp('2%'),
  },
  cardTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginBottom: hp('0.5%'),
    color: '#222',
    letterSpacing: 0.5,
  },
  cardDesc: {
    fontSize: wp('4%'),
    marginBottom: hp('1.5%'),
    color: '#444',
    letterSpacing: 0.3,
  },
  offerButton: {
    backgroundColor: '#fff',
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  offerButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: wp('3.5%'),
  },
  imagePlaceholder: {
    width: wp('40%'),
    height: '100%',
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  backButton: {
    position: 'absolute',
    top: hp('2%'),
    left: wp('2%'),
    padding: wp('2%'),
  },
});

export default CategoryScreen;
