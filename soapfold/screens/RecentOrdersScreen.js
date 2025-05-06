import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme, getTextStyle } from '../utils/theme';
import ScreenContainer from '../components/ScreenContainer';
import EmptyOrdersPlaceholder from '../components/EmptyOrdersPlaceholder';

const RecentOrdersScreen = ({ navigation, route }) => {
  const { recentOrder } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Mock order data
  useEffect(() => {
    // Generate orders with one being highlighted if passed in route params
    const mockOrders = [
      {
        id: recentOrder || '#12345',
        date: 'Today, 10:30 AM',
        status: 'Processing',
        totalItems: 5,
        totalAmount: 45.99,
        paymentMethod: 'Credit Card',
        deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
        items: [
          { name: 'T-Shirt', quantity: 2, price: 5.98 },
          { name: 'Pants', quantity: 1, price: 3.99 },
          { name: 'Dress Shirt', quantity: 1, price: 24.99 },
          { name: 'Towels', quantity: 1, price: 11.03 }
        ]
      },
      {
        id: '#12340',
        date: 'Yesterday, 2:15 PM',
        status: 'Delivered',
        totalItems: 3,
        totalAmount: 32.50,
        paymentMethod: 'Apple Pay',
        deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
        items: [
          { name: 'Sheets', quantity: 1, price: 15.99 },
          { name: 'Pillowcases', quantity: 2, price: 16.51 }
        ]
      },
      {
        id: '#12337',
        date: '20 Jul 2023, 11:45 AM',
        status: 'Delivered',
        totalItems: 7,
        totalAmount: 67.85,
        paymentMethod: 'Cash on Delivery',
        deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
        items: [
          { name: 'Suits', quantity: 1, price: 29.99 },
          { name: 'Dress', quantity: 1, price: 24.99 },
          { name: 'Shirts', quantity: 3, price: 10.47 },
          { name: 'Socks (pairs)', quantity: 2, price: 2.40 }
        ]
      },
      {
        id: '#12325',
        date: '15 Jul 2023, 9:20 AM',
        status: 'Delivered',
        totalItems: 4,
        totalAmount: 39.96,
        paymentMethod: 'Credit Card',
        deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
        items: [
          { name: 'T-Shirts', quantity: 4, price: 11.96 },
          { name: 'Shorts', quantity: 3, price: 7.47 },
          { name: 'Jeans', quantity: 2, price: 20.53 }
        ]
      }
    ];
    
    setOrders(mockOrders);
    
    // Auto-expand the recent order if it exists
    if (recentOrder) {
      setExpandedOrderId(recentOrder);
    }
  }, [recentOrder]);
  
  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  
  // Get status color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return '#FFA500';
      case 'In Transit': return '#3498DB';
      case 'Delivered': return '#2ECC71';
      case 'Cancelled': return '#E74C3C';
      default: return '#FFA500';
    }
  };
  
  // Render an order item
  const renderOrderItem = ({ item }) => {
    const isExpanded = expandedOrderId === item.id;
    const isRecentOrder = recentOrder === item.id;
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          isRecentOrder && styles.highlightedOrderCard
        ]}
        onPress={() => toggleOrderExpansion(item.id)}
        activeOpacity={0.8}
      >
        {/* Order Card Header */}
        <View style={styles.orderCardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.id}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{item.totalItems}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.totalAmount}>₹{item.totalAmount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Payment</Text>
            <Text style={styles.summaryValue}>{item.paymentMethod}</Text>
          </View>
        </View>
        
        {/* Expanded Order Details */}
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <View style={styles.sectionDivider} />
            
            {/* Delivery Address */}
            <View style={styles.deliveryAddressSection}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <Text style={styles.deliveryAddress}>{item.deliveryAddress}</Text>
            </View>
            
            <View style={styles.sectionDivider} />
            
            {/* Order Items */}
            <View style={styles.orderItemsSection}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              
              {item.items.map((orderItem, index) => (
                <View key={index} style={styles.orderItemRow}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName}>{orderItem.name}</Text>
                    <Text style={styles.orderItemQuantity}>Qty: {orderItem.quantity}</Text>
                  </View>
                  <Text style={styles.orderItemPrice}>₹{orderItem.price.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            
            {/* Actions */}
            <View style={styles.actionsContainer}>
              {item.status === 'Processing' || item.status === 'In Transit' ? (
                <TouchableOpacity style={styles.trackButton}>
                  <MaterialIcons name="local-shipping" size={18} color="#FFFFFF" />
                  <Text style={styles.trackButtonText}>Track Order</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.reorderButton}>
                  <Feather name="refresh-cw" size={16} color="#FFFFFF" />
                  <Text style={styles.reorderButtonText}>Reorder</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.supportButton}>
                <Feather name="help-circle" size={16} color="#222222" />
                <Text style={styles.supportButtonText}>Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Expand/Collapse Button */}
        <View style={styles.expandButtonContainer}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleOrderExpansion(item.id)}
          >
            <MaterialIcons
              name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#888888"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  const handleBrowseServices = () => {
    navigation.navigate('MainTabs', { screen: 'HomeScreen' });
  };
  
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.rightSpace} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyOrdersPlaceholder onBrowseServices={handleBrowseServices} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
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
  rightSpace: {
    width: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  highlightedOrderCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#fafafa',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
  },
  orderDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#888888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  expandedDetails: {
    marginTop: 15,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  deliveryAddressSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },
  deliveryAddress: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  orderItemsSection: {
    marginBottom: 15,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#222222',
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#888888',
    marginTop: 3,
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#243D6E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    elevation: 2,
  },
  trackButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#243D6E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    elevation: 2,
  },
  reorderButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#243D6E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
    marginLeft: 6,
  },
  expandButtonContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  expandButton: {
    backgroundColor: '#243D6E',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default RecentOrdersScreen;
