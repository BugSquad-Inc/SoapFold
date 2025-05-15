import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const OrderScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('all');
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  
  // Mock order data
  const mockOrders = [
    {
      id: '1',
      orderNumber: '#ORD12345',
      date: 'June 15, 2023',
      status: 'active',
      totalAmount: '₹32.50',
      items: [
        { id: '1', name: 'Lavender Soap', quantity: 2, price: '₹12.99' },
        { id: '2', name: 'Eucalyptus Bath Bomb', quantity: 1, price: '₹6.52' }
      ],
      shippingAddress: '123 Main St, Anytown, CA 12345',
      paymentMethod: 'Visa **** 1234',
    },
    {
      id: '2',
      orderNumber: '#ORD12346',
      date: 'June 10, 2023',
      status: 'completed',
      totalAmount: '₹45.75',
      items: [
        { id: '3', name: 'Rose Soap', quantity: 3, price: '₹15.75' },
        { id: '4', name: 'Bamboo Wash Cloth', quantity: 2, price: '₹14.25' }
      ],
      shippingAddress: '456 Elm St, Somewhere, NY 67890',
      paymentMethod: 'Mastercard **** 5678',
    },
    {
      id: '3',
      orderNumber: '#ORD12347',
      date: 'June 5, 2023',
      status: 'completed',
      totalAmount: '₹22.99',
      items: [
        { id: '5', name: 'Citrus Scrub', quantity: 1, price: '₹22.99' }
      ],
      shippingAddress: '789 Oak St, Elsewhere, TX 23456',
      paymentMethod: 'PayPal',
    }
  ];

  // Fetch orders from storage or API
  const fetchOrders = async () => {
    // Replace with your real fetch logic
    // For now, just simulate with localStorage or AsyncStorage if needed
    // setOrders(await getOrdersFromStorageOrAPI());
    setOrders(mockOrders);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const renderOrders = () => {
    if (!orders || orders.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="shopping-bag" size={60} color="#243D6E" />
          <Text style={[styles.emptyStateText, {color: '#243D6E', fontWeight: 'bold'}]}>No orders yet</Text>
        </View>
      );
    }
    // Filter orders based on selected filter
    const filteredOrders = filter === 'all' 
      ? orders 
      : orders.filter(order => order.status === filter);

    return filteredOrders.map(order => (
      <TouchableOpacity 
        key={order.id} 
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { order })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <View style={[
            styles.statusBadge, 
            order.status === 'active' ? styles.activeStatusBadge : styles.completedStatusBadge
          ]}>
            <Text style={styles.statusText}>
              {order.status === 'active' ? 'Active' : 'Completed'}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderInfo}>
          <Text style={styles.orderDate}>{order.date}</Text>
          <Text style={styles.orderAmount}>{order.totalAmount}</Text>
        </View>
        
        <View style={styles.orderItems}>
          {order.items.map((item, index) => (
            <Text key={item.id} style={styles.orderItemText}>
              {item.quantity}x {item.name}
              {index < order.items.length - 1 ? ', ' : ''}
            </Text>
          ))}
        </View>
        
        <View style={styles.orderFooter}>
          <TouchableOpacity 
            style={styles.orderButton}
            onPress={() => navigation.navigate('OrderDetail', { order })}
          >
            <Text style={styles.orderButtonText}>View Details</Text>
          </TouchableOpacity>
          
          {order.status === 'active' && (
            <TouchableOpacity style={styles.orderButton}>
              <Text style={styles.orderButtonText}>Track Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#222222" />
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]} 
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'active' && styles.activeFilter]} 
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]} 
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.ordersContainer,
          { paddingBottom: insets.bottom + 80 } // Add safe area insets and space for nav bar
        ]}
      >
        {renderOrders()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#243D6E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
  },
  activeFilter: {
    backgroundColor: '#000',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  ordersContainer: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatusBadge: {
    backgroundColor: '#e3f2fd',
  },
  completedStatusBadge: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItemText: {
    fontSize: 14,
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  orderButton: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 10,
  },
  orderButtonText: {
    fontSize: 12,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default OrderScreen; 