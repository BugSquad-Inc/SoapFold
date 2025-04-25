import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  
  // Mock order data - in a real app, this would come from an API call using the orderId
  const [order, setOrder] = useState({
    id: 'ORD123456',
    date: '15 Nov 2023',
    service: 'Wash & Fold',
    status: 'In Progress',
    statusColor: '#007AFF',
    paymentMethod: 'Credit Card',
    deliveryAddress: '123 Laundry Street, Clean City, 12345',
    items: [
      { id: '1', name: 'T-Shirt', quantity: 2, price: 15000 },
      { id: '2', name: 'Pants', quantity: 1, price: 20000 },
      { id: '3', name: 'Dress Shirt', quantity: 2, price: 25000 }
    ],
    timeline: [
      { status: 'Order Placed', date: '15 Nov 2023, 10:30 AM', completed: true },
      { status: 'Payment Confirmed', date: '15 Nov 2023, 10:35 AM', completed: true },
      { status: 'In Progress', date: '15 Nov 2023, 02:00 PM', completed: true },
      { status: 'Ready for Delivery', date: 'Estimated: 17 Nov 2023', completed: false },
      { status: 'Delivered', date: 'Estimated: 18 Nov 2023', completed: false }
    ],
    amount: 75000,
    deliveryFee: 10000,
    promotion: 5000,
    total: 80000
  });
  
  // Calculate the progress percentage for the progress bar
  const calculateProgress = () => {
    const completedSteps = order.timeline.filter(step => step.completed).length;
    return (completedSteps / order.timeline.length) * 100;
  };
  
  const renderOrderItems = () => {
    return order.items.map(item => (
      <View key={item.id} style={styles.orderItemRow}>
        <View style={styles.orderItemDetail}>
          <Text style={styles.orderItemName}>{item.name}</Text>
          <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
        </View>
        <Text style={styles.orderItemPrice}>${item.price.toFixed(2)}</Text>
      </View>
    ));
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
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
            </View>
          </View>
          
          <Text style={styles.orderDate}>{order.date}</Text>
          
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${calculateProgress()}%` }]} />
            </View>
            <Text style={styles.progressText}>{calculateProgress()}% Complete</Text>
          </View>
        </View>

        {/* Timeline section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timeline}>
            {order.timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDotContainer}>
                  <View style={[
                    styles.timelineDot, 
                    event.completed && styles.timelineDotCompleted
                  ]} />
                  {index < order.timeline.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      event.completed && styles.timelineLineCompleted
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{event.status}</Text>
                  <Text style={styles.timelineTime}>{event.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Items section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {renderOrderItems()}
          
          <View style={styles.divider} />
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>${order.amount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>${order.deliveryFee.toFixed(2)}</Text>
          </View>
          
          {order.promotion > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Promotion</Text>
              <Text style={[styles.priceValue, styles.discountText]}>-${order.promotion.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={() => {
            // Navigate to a support screen or show contact options
            Alert.alert(
              "Contact Support",
              "How would you like to contact customer support?",
              [
                {
                  text: "Call",
                  onPress: () => console.log("Call support")
                },
                {
                  text: "Email",
                  onPress: () => console.log("Email support")
                },
                {
                  text: "Cancel",
                  style: "cancel"
                }
              ]
            );
          }}
        >
          <MaterialIcons name="chat" size={20} color="#222" />
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reorderButton}
          onPress={() => {
            // Navigate to the appropriate service screen to place a new order
            navigation.navigate('MainTabs', { 
              screen: 'HomeScreen',
              params: { reorderService: order.service }
            });
          }}
        >
          <Text style={styles.reorderButtonText}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingBottom: 80,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDotContainer: {
    position: 'relative',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineLine: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  timelineLineCompleted: {
    backgroundColor: '#007AFF',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
  },
  discountText: {
    color: '#4CD964',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  reorderButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderItemDetail: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default OrderDetailScreen; 