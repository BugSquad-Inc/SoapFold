import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ServiceWithOffersScreen = ({ route, navigation }) => {
  const { service, promotion } = route.params;
  const [selectedItems, setSelectedItems] = useState({});
  // Get insets to properly handle bottom navigation bar
  const insets = useSafeAreaInsets();

  // Sample items for the selected service
  const serviceItems = [
    {
      id: '1',
      name: 'T-Shirt',
      regularPrice: 'Rp 15,000',
      discountedPrice: 'Rp 12,000',
      image: require('../assets/images/ironing.jpg')
    },
    {
      id: '2',
      name: 'Shirt',
      regularPrice: 'Rp 18,000',
      discountedPrice: 'Rp 14,400',
      image: require('../assets/images/ironing.jpg')
    },
    {
      id: '3',
      name: 'Pants',
      regularPrice: 'Rp 20,000',
      discountedPrice: 'Rp 16,000',
      image: require('../assets/images/ironing.jpg')
    },
    {
      id: '4',
      name: 'Jeans',
      regularPrice: 'Rp 25,000',
      discountedPrice: 'Rp 20,000',
      image: require('../assets/images/ironing.jpg')
    },
    {
      id: '5',
      name: 'Dress',
      regularPrice: 'Rp 30,000',
      discountedPrice: 'Rp 24,000',
      image: require('../assets/images/ironing.jpg')
    },
    {
      id: '6',
      name: 'Skirt',
      regularPrice: 'Rp 22,000',
      discountedPrice: 'Rp 17,600',
      image: require('../assets/images/ironing.jpg')
    }
  ];

  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const newState = {...prev};
      if (newState[item.id]) {
        delete newState[item.id];
      } else {
        newState[item.id] = item;
      }
      return newState;
    });
  };

  const handleContinue = () => {
    // Convert selected items to an array
    const selectedItemsArray = Object.values(selectedItems);
    
    navigation.navigate('CartScreen', {
      selectedItems: selectedItemsArray,
      promotion,
      service
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.itemCard,
        selectedItems[item.id] ? { borderColor: promotion.accentColor, borderWidth: 2 } : {}
      ]}
      onPress={() => toggleItem(item)}
    >
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          selectedItems[item.id] ? { backgroundColor: promotion.accentColor, borderColor: promotion.accentColor } : {}
        ]}>
          {selectedItems[item.id] && (
            <MaterialIcons name="check" size={16} color="#fff" />
          )}
        </View>
      </View>
      
      <Image source={item.image} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.regularPrice}>{item.regularPrice}</Text>
          <Text style={styles.discountedPrice}>{item.discountedPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{service.name}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.promoContainer}>
          <View style={[styles.promoBadge, { backgroundColor: promotion.accentColor }]}>
            <Text style={styles.promoBadgeText}>{promotion.subtitle}</Text>
          </View>
          <Text style={styles.promoText}>Discount automatically applied</Text>
        </View>
        
        <FlatList
          data={serviceItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: 100 + insets.bottom } // Add safe area insets + footer height
          ]}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
        
        <View style={[
          styles.footer,
          { bottom: insets.bottom > 0 ? insets.bottom : 16 } // Adjust footer position based on safe area
        ]}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              {Object.keys(selectedItems).length} items selected
            </Text>
            <Text style={styles.totalText}>
              Total: {Object.keys(selectedItems).length > 0 ? 'Rp 50,000' : 'Rp 0'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.continueButton,
              Object.keys(selectedItems).length === 0 ? styles.continueButtonDisabled : {}
            ]}
            onPress={handleContinue}
            disabled={Object.keys(selectedItems).length === 0}
          >
            <Text style={styles.continueButtonText}>Continue to Cart</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  promoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  promoBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  promoText: {
    fontSize: 14,
    color: '#222',
  },
  listContainer: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  itemImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    marginTop: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
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
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#aaa',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default ServiceWithOffersScreen; 