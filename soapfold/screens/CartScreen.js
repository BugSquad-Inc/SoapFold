import React, { useState } from 'react';
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

const CartScreen = ({ route }) => {
  const { serviceTitle } = route.params;
  const [cartItems, setCartItems] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const items = Object.keys(imageMap);

  const categories = ['All', 'Top', 'Bottoms', 'Linen', 'Shoes'];

  const filterItems = () => {
    if (selectedCategory === 'All') {
      return items;
    }
    return items.filter(item => {
      if (selectedCategory === 'Top' && (item === 'Shirt' || item === 'Kurta' || item === 'Blazer' || item === 'Saree')) {
        return true;
      }
      if (selectedCategory === 'Bottoms' && (item === 'Pant' || item === 'Jeans')) {
        return true;
      }
      if (selectedCategory === 'Linen' && (item === 'Bedsheet' || item === 'Curtain' || item === 'Pillow Cover')) {
        return true;
      }
      if (selectedCategory === 'Shoes' && (item === 'Sneakers' || item === 'Leather Shoes' || item === 'Heels')) {
        return true;
      }
      return false;
    });
  };

  const increment = (name) => {
    setCartItems((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  };

  const decrement = (name) => {
    setCartItems((prev) => {
      if (prev[name] && prev[name] > 0) {
        return { ...prev, [name]: prev[name] - 1 };
      }
      return prev;
    });
  };

  const renderItem = ({ item }) => {
    const quantity = cartItems[item] || 0;

    return (
      <View style={styles.card}>
        <Image source={imageMap[item]} style={styles.image} />
        <Text style={styles.name}>{item}</Text>
        <Text style={styles.price}>Rp {samplePrices[item].toLocaleString()}</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity onPress={() => decrement(item)} style={styles.decrementButton}>
            <Text style={styles.decrementButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => increment(item)} style={styles.incrementButton}>
            <Text style={styles.incrementButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        {quantity > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{quantity}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.tab, selectedCategory === category && styles.activeTab]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[styles.tabText, selectedCategory === category && styles.activeTabText]}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{serviceTitle}</Text>
      {/* Render tabs as a header component */}
      <FlatList
        data={filterItems()}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={renderTabs}
      />
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
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
    width: 80,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#fff',
  },
  grid: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 10,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  },
  incrementButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  incrementButtonText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  decrementButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decrementButtonText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 8,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});