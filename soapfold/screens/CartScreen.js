import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Animatable from 'react-native-animatable';

const CartScreen = () => {
  const route = useRoute();
  const { serviceTitle, selectedItems, color, image } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: color || '#fef8e9' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{serviceTitle} Cart</Text>

        <Animatable.View animation="fadeInUp" delay={100} style={styles.imageContainer}>
          <Image source={image} style={styles.image} />
        </Animatable.View>

        <View style={styles.cartCard}>
          <Text style={styles.sectionTitle}>Items Selected</Text>
          {selectedItems.map((item, index) => (
            <Animatable.View
              key={index}
              animation="fadeInLeft"
              delay={index * 100}
              style={styles.itemRow}
            >
              <Text style={styles.itemText}>{item}</Text>
              <Text style={styles.qtyText}>x1</Text>
            </Animatable.View>
          ))}
        </View>

        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
  },
  header: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#2b2b2b',
    textAlign: 'center',
    marginBottom: hp('3%'),
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  image: {
    width: wp('60%'),
    height: hp('20%'),
    resizeMode: 'contain',
    borderRadius: 18,
    backgroundColor: '#fff',
    elevation: 4,
  },
  cartCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: wp('5%'),
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: hp('3%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('1%'),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  itemText: {
    fontSize: wp('4.2%'),
    color: '#444',
    letterSpacing: 0.4,
  },
  qtyText: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#555',
  },
  confirmButton: {
    backgroundColor: '#2b2b2b',
    borderRadius: 22,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
});

export default CartScreen;
