import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const services = [
  {
    title: 'IRONING',
    description: 'Enjoy 10% off ironing service!',
    tag: 'ironing',
    color: '#fbd0f9',
    // image: require('./assets/ironing.png'), // Add matching local image
  },
  {
    title: 'WASH',
    description: 'Limited Time: 10% off wash service!',
    tag: '10% off',
    color: '#fef0b9',
    // image: require('./assets/wash.png'),
  },
  {
    title: 'WASH & IRON',
    description: 'Save 10% on wash & iron service!',
    tag: 'wash & iron',
    color: '#fcd6ae',
    // image: require('./assets/wash_iron.png'),
  },
  {
    title: 'WELCOME OFFER',
    description: 'Get 15% off next order!',
    tag: 'next order',
    color: '#c9e7f2',
    // image: require('./assets/welcome.png'),
  },
];

const CategoryScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Services</Text>
      {services.map((service, index) => (
        <View key={index} style={[styles.card, { backgroundColor: service.color }]}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitle}>{service.title}</Text>
            <Text style={styles.cardDesc}>{service.description}</Text>
            <TouchableOpacity style={styles.offerButton}>
              <Text style={styles.offerButtonText}>Claim the offer</Text>
            </TouchableOpacity>
          </View>
          <Image source={service.image} style={styles.cardImage} resizeMode="contain" />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef8e9',
    padding: wp('4%'),
  },
  header: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2b2b2b',
    marginBottom: hp('2%'),
  },
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  cardDesc: {
    fontSize: wp('4%'),
    marginBottom: hp('1.5%'),
    color: '#444',
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
  cardImage: {
    width: wp('25%'),
    height: hp('12%'),
  },
});

export default CategoryScreen;
