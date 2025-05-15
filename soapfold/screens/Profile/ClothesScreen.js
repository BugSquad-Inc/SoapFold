import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';
import { theme, getTextStyle } from '../../utils/theme';

const ClothesScreen = ({ navigation, route }) => {
  const { service } = route.params;
  
  const [selectedItems, setSelectedItems] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  
  // Sample clothing items based on the service type
  const getItemsForService = () => {
    // Common items
    const baseItems = [
      {
        id: '1',
        name: 'T-Shirt',
        price: 'Rp 15,000',
        image: require('../../assets/images/ironing.jpg')
      },
      {
        id: '2',
        name: 'Shirt',
        price: 'Rp 18,000',
        image: require('../../assets/images/ironing.jpg')
      },
      {
        id: '3',
        name: 'Pants',
        price: 'Rp 20,000',
        image: require('../../assets/images/ironing.jpg')
      },
      {
        id: '4',
        name: 'Jeans',
        price: 'Rp 25,000',
        image: require('../../assets/images/ironing.jpg')
      }
    ];
    
    // Add specific items based on service category
    if (service.category === 'dry') {
      return [
        ...baseItems,
        {
          id: '5',
          name: 'Suit',
          price: 'Rp 80,000',
          image: require('../../assets/images/ironing.jpg')
        },
        {
          id: '6',
          name: 'Dress',
          price: 'Rp 60,000',
          image: require('../../assets/images/ironing.jpg')
        },
        {
          id: '7',
          name: 'Coat',
          price: 'Rp 90,000',
          image: require('../../assets/images/ironing.jpg')
        },
        {
          id: '8',
          name: 'Sweater',
          price: 'Rp 45,000',
          image: require('../../assets/images/ironing.jpg')
        }
      ];
    } else if (service.category === 'iron') {
      return [
        ...baseItems,
        {
          id: '5',
          name: 'Blouse',
          price: 'Rp 20,000',
          image: require('../../assets/images/ironing.jpg')
        },
        {
          id: '6',
          name: 'Dress Shirt',
          price: 'Rp 25,000',
          image: require('../../assets/images/ironing.jpg')
        }
      ];
    } else {
      return [
        ...baseItems,
        {
          id: '5',
          name: 'Bedsheet',
          price: 'Rp 40,000',
          image: require('../../assets/images/laundry.jpg')
        },
        {
          id: '6',
          name: 'Towel',
          price: 'Rp 15,000',
          image: require('../../assets/images/laundry.jpg')
        },
        {
          id: '7',
          name: 'Pillowcase',
          price: 'Rp 10,000',
          image: require('../../assets/images/laundry.jpg')
        },
        {
          id: '8',
          name: 'Curtain',
          price: 'Rp 50,000',
          image: require('../../assets/images/laundry.jpg')
        }
      ];
    }
  };
  
  const clothingItems = getItemsForService();
  
  const handleItemSelection = (item) => {
    setSelectedItems(prev => {
      const newItems = {...prev};
      
      if (newItems[item.id]) {
        // If item exists, increment count
        newItems[item.id] = {
          ...newItems[item.id],
          quantity: newItems[item.id].quantity + 1
        };
      } else {
        // Add new item with quantity 1
        newItems[item.id] = {
          ...item,
          quantity: 1
        };
      }
      
      return newItems;
    });
  };
  
  const handleItemRemoval = (item) => {
    setSelectedItems(prev => {
      const newItems = {...prev};
      
      if (newItems[item.id]) {
        // If quantity is 1, remove the item
        if (newItems[item.id].quantity === 1) {
          delete newItems[item.id];
        } else {
          // Otherwise, decrement quantity
          newItems[item.id] = {
            ...newItems[item.id],
            quantity: newItems[item.id].quantity - 1
          };
        }
      }
      
      return newItems;
    });
  };
  
  // Calculate total amount and item count when selected items change
  React.useEffect(() => {
    let total = 0;
    let count = 0;
    
    Object.values(selectedItems).forEach(item => {
      total += parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * item.quantity;
      count += item.quantity;
    });
    
    setTotalAmount(parseFloat(total.toFixed(2)));
    setItemCount(count);
  }, [selectedItems]);
  
  const handleContinue = () => {
    if (itemCount === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to continue.');
      return;
    }
    
    // Convert selected items to an array
    const selectedItemsArray = Object.values(selectedItems);
    
    navigation.navigate('CartScreen', {
      selectedItems: selectedItemsArray,
      service: service
    });
  };
  
  const renderItem = ({ item }) => {
    const isSelected = selectedItems[item.id];
    const quantity = isSelected ? selectedItems[item.id].quantity : 0;
    
    return (
      <View style={styles.itemCard}>
        <Image source={item.image} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{item.price}</Text>
        </View>
        
        <View style={styles.quantityControls}>
          <TouchableOpacity 
            style={[styles.quantityButton, quantity === 0 && styles.quantityButtonDisabled]}
            onPress={() => handleItemRemoval(item)}
            disabled={quantity === 0}
          >
            <MaterialIcons name="remove" size={18} color={quantity === 0 ? "#ccc" : "#222"} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleItemSelection(item)}
          >
            <MaterialIcons name="add" size={18} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{service.name}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.serviceInfoContainer}>
          <Text style={styles.serviceDescription}>{service.description}</Text>
          <View style={styles.serviceDetails}>
            <Text style={styles.servicePrice}>{service.price}</Text>
            <View style={styles.etaContainer}>
              <MaterialIcons name="schedule" size={14} color="#666" />
              <Text style={styles.etaText}>{service.eta}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Select Items</Text>
        
        <FlatList
          data={clothingItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
        
        <View style={styles.footer}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{itemCount} items selected</Text>
            <Text style={styles.totalText}>
              Total: {totalAmount.toFixed(2)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.continueButton,
              itemCount === 0 && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={itemCount === 0}
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
    backgroundColor: '#243D6E',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  serviceInfoContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    margin: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f8f8f8',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    width: 20,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
});

export default ClothesScreen; 