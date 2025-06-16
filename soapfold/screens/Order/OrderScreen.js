import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import { auth } from '../../config/firebase';
import { getCustomerOrders, getOrderFromFirestore } from '../../config/firestore';

const getStatusLabel = (status) => {
  if (status === 'active') return 'Active';
  if (status === 'pending') return 'Pending';
  if (status === 'completed') return 'Completed';
  // Add more as needed
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusBadgeStyle = (status) => {
  if (status === 'active' || status === 'pending') return styles.activeStatusBadge;
  if (status === 'completed') return styles.completedStatusBadge;
  return styles.completedStatusBadge;
};

const ACTIVE_STATUSES = ['active', 'pending', 'processing', 'in progress'];
const COMPLETED_STATUSES = ['completed', 'delivered'];

const OrderScreen = ({ navigation, route }) => {
  const [filter, setFilter] = useState('all');
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch orders from Firestore for the current user
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const ordersData = await getCustomerOrders(user.uid);
      // Map Firestore data to UI format
      const formattedOrders = ordersData.map(order => ({
        id: order.id,
        orderNumber: `#${order.id}`,
        date: order.createdAt?.toDate
          ? order.createdAt.toDate().toLocaleDateString()
          : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''),
        status: order.status,
        // Use service.finalPrice for totalAmount
        totalAmount: order.service?.finalPrice ? `₹${order.service.finalPrice}` : '₹0.00',
        // Use service as the only item
        items: order.service
          ? [{ name: order.service.name, quantity: order.service.quantity }]
          : [],
        shippingAddress: order.address || '',
        paymentMethod: order.paymentMethod || '',
      }));
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
    setLoading(false);
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
          <MaterialIcons name="shopping-bag" size={60} color="#243D6E" />
          <Text style={[styles.emptyStateText, {color: '#243D6E', fontWeight: 'bold'}]}>No orders yet</Text>
        </View>
      );
    }
    // Filter orders based on selected filter
    const filteredOrders = filter === 'all'
      ? orders
      : filter === 'active'
        ? orders.filter(order => ACTIVE_STATUSES.includes(order.status?.toLowerCase()))
        : orders.filter(order => COMPLETED_STATUSES.includes(order.status?.toLowerCase()));

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
            getStatusBadgeStyle(order.status)
          ]}>
            <Text style={styles.statusText}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderInfo}>
          <Text style={styles.orderDate}>{order.date}</Text>
          <Text style={styles.orderAmount}>{order.totalAmount}</Text>
        </View>
        
        <View style={styles.orderItems}>
          {order.items.map((item, index) => (
            <Text key={`${item.name}-${index}`} style={styles.orderItemText}>
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