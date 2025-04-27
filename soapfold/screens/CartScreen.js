import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ScrollView, StatusBar, SafeAreaView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const imageMap = {
  'Shirt': require('../assets/images/ironing.jpg'),
  'Pant': require('../assets/images/ironing.jpg'),
  'Bedsheet': require('../assets/images/ironing.jpg'),
  'Towel': require('../assets/images/ironing.jpg'),
  'Kurta': require('../assets/images/ironing.jpg'),
  'Pillow Cover': require('../assets/images/ironing.jpg'),
  'Saree': require('../assets/images/ironing.jpg'),
  'Blazer': require('../assets/images/ironing.jpg'),
  'Suit': require('../assets/images/ironing.jpg'),
  'Curtain': require('../assets/images/ironing.jpg'),
  'Sneakers': require('../assets/images/ironing.jpg'),
  'Leather Shoes': require('../assets/images/ironing.jpg'),
  'Heels': require('../assets/images/ironing.jpg'),
  'School Uniform': require('../assets/images/ironing.jpg'),
  'Hotel Linen': require('../assets/images/ironing.jpg'),
  'Corporate Wear': require('../assets/images/ironing.jpg'),
};

const samplePrices = {
  'Shirt': 2000,
  'Pant': 2500,
  'Bedsheet': 3000,
  'Towel': 1500,
  'Kurta': 2800,
  'Pillow Cover': 1200,
  'Saree': 4000,
  'Blazer': 5000,
  'Suit': 4500,
  'Curtain': 3500,
  'Sneakers': 3000,
  'Leather Shoes': 5000,
  'Heels': 3800,
  'School Uniform': 3200,
  'Hotel Linen': 4200,
  'Corporate Wear': 5500,
};

// Empty cart component
const EmptyCart = () => (
  <View style={styles.emptyCartContainer}>
    <MaterialIcons name="shopping-cart" size={80} color="#ddd" />
    <Text style={styles.emptyCartText}>Your cart is empty</Text>
    <Text style={styles.emptyCartSubtext}>Add items to your cart to get started</Text>
  </View>
);

const CartScreen = ({ route, navigation }) => {
  const { serviceTitle } = route.params;
  const [cartItems, setCartItems] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const items = Object.keys(imageMap);
  const categories = ['All', 'Top', 'Bottoms', 'Linen', 'Shoes'];
  const insets = useSafeAreaInsets();

  const totalPrice = useMemo(() =>
    Object.entries(cartItems).reduce((acc, [item, qty]) => acc + qty * (samplePrices[item] || 0), 0),
    [cartItems]
  );

  const filterItems = () => {
    if (selectedCategory === 'All') return items;

    const categoryMap = {
      Top: ['Shirt', 'Kurta', 'Blazer', 'Saree'],
      Bottoms: ['Pant', 'School Uniform'],
      Linen: ['Bedsheet', 'Curtain', 'Pillow Cover', 'Hotel Linen'],
      Shoes: ['Sneakers', 'Leather Shoes', 'Heels'],
    };

    return items.filter(item => categoryMap[selectedCategory]?.includes(item));
  };

  const increment = (name) => {
    setCartItems((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  };

  const decrement = (name) => {
    setCartItems((prev) => {
      const current = prev[name] || 0;
      if (current > 1) return { ...prev, [name]: current - 1 };
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  };

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.tab, selectedCategory === category && styles.activeTab]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[styles.tabText, selectedCategory === category && styles.activeTabText]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderItem = ({ item }) => {
    const quantity = cartItems[item] || 0;
    const pricePerItem = samplePrices[item] || 0;
    const totalItemPrice = quantity * pricePerItem;
  
    return (
      <View style={styles.card}>
        <Image source={imageMap[item]} style={styles.image} />
        
        <Text style={styles.name}>
          {item} {quantity > 0 ? `(x${quantity}) — Rp ${totalItemPrice.toLocaleString()}` : ''}
        </Text>
  
        {quantity === 0 && (
          <Text style={styles.price}>Rp {pricePerItem.toLocaleString()}</Text>
        )}
  
        <View style={styles.quantityControls}>
          <TouchableOpacity onPress={() => decrement(item)} style={styles.decrementButton}>
            <Text style={styles.decrementButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => increment(item)} style={styles.incrementButton}>
            <Text style={styles.incrementButtonText}>+</Text>
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
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <TouchableOpacity style={styles.clearButton} onPress={() => setCartItems({})}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filterItems()}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          numColumns={2}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: 80 + insets.bottom }
          ]}
          ListHeaderComponent={renderTabs}
          ListEmptyComponent={EmptyCart}
        />

        {totalPrice > 0 && (
          <View style={[
            styles.footer,
            { paddingBottom: insets.bottom + 10 }
          ]}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>Rp {totalPrice.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              disabled={totalPrice === 0}
              style={[styles.verifyButton, totalPrice === 0 && styles.verifyButtonDisabled]}
              onPress={() => navigation.navigate('BookingScreen', {
                service: serviceTitle || 'Laundry Service',
                quantity: cartItems.length,
                totalPrice
              })}
            >
              <Text style={styles.verifyText}>Verify Order</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingTop: 0,
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
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeTab: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: '#000',
  },
  activeTabText: {
    color: '#fff',
  },
  grid: {
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 10,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  incrementButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decrementButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  decrementButtonText: {
    color: '#fff',
    fontSize: 18,
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
    paddingBottom: 16,
    marginBottom: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default CartScreen;
