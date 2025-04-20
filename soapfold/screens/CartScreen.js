import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ScrollView } from 'react-native';

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

const CartScreen = ({ route, navigation }) => {
  const { serviceTitle } = route.params;
  const [cartItems, setCartItems] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const items = Object.keys(imageMap);
  const categories = ['All', 'Top', 'Bottoms', 'Linen', 'Shoes'];

  const totalPrice = useMemo(() =>
    Object.entries(cartItems).reduce((acc, [item, qty]) => acc + qty * (samplePrices[item] || 0), 0),
    [cartItems]
  );

  const handleContinueToPayment = () => {
    navigation.navigate('PaymentScreen', {
      cartItems,
      totalPrice,
      serviceTitle,
    });
  };

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
          {item} {quantity > 0 ? `(x${quantity}) — ₹${totalItemPrice.toLocaleString()}` : ''}
        </Text>

        {quantity === 0 && (
          <Text style={styles.price}>₹{pricePerItem.toLocaleString()}</Text>
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
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>{serviceTitle}</Text>
        <FlatList
          data={filterItems()}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          numColumns={2}
          contentContainerStyle={styles.grid}
          ListHeaderComponent={renderTabs}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₹{totalPrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          disabled={totalPrice === 0}
          style={[styles.verifyButton, totalPrice === 0 && styles.verifyButtonDisabled]}
          onPress={handleContinueToPayment}
        >
          <Text style={styles.verifyText}>Verify Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
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
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
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
});
