import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const CategoryScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Prices</Text>

      {/* Wash Category */}
      <View style={styles.categoryCard}>
        <Text style={styles.categoryTitle}>Wash</Text>
        <Text style={styles.categoryDescription}>For everyday bedsheets laundry, and towels.</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.buttonText}>WASH</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.buttonText}>TUMBLE-DRY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.buttonText}>IN A BAG</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.priceText}>Price per item from €1.95</Text>
      </View>

      {/* Ironing Category */}
      <View style={styles.categoryCard}>
        <Text style={styles.categoryTitle}>Ironing</Text>
        <Text style={styles.categoryDescription}>For items that are already clean.</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.buttonText}>IRONING</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.buttonText}>ON HANGERS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.buttonText}>IN A BAG</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.priceText}>Price per item from €1.95</Text>
      </View>

      {/* Add more categories as needed */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('4%'),
    backgroundColor: '#fff',
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    marginBottom: hp('2%'),
  },
  categoryCard: {
    backgroundColor: '#FFF3CC',
    borderRadius: 10,
    padding: wp('4%'),
    marginBottom: hp('2%'),
  },
  categoryTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  categoryDescription: {
    fontSize: wp('4%'),
    marginBottom: hp('1%'),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  categoryButton: {
    backgroundColor: '#FFC107',
    padding: wp('2%'),
    borderRadius: 5,
    flex: 1,
    marginHorizontal: wp('1%'),
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: wp('4%'),
    marginTop: hp('1%'),
  },
});

export default CategoryScreen;
