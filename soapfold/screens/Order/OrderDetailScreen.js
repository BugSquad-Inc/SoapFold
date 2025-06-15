import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import { auth } from '../../config/firebase';
import { getOrderFromFirestore, updateOrderInFirestore } from '../../config/firestore';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch order data from Firestore
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch order from Firestore
        const orderData = await getOrderFromFirestore(orderId);
        
        if (!orderData) {
          setError('Order not found. Please try again.');
          setLoading(false);
          return;
        }
        
        // Format dates if they are Firestore timestamps
        const formatFirestoreDate = (timestamp) => {
          if (!timestamp) return null;
          
          const date = timestamp.seconds 
            ? new Date(timestamp.seconds * 1000) 
            : new Date(timestamp);
            
          return date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        };
        
        // Calculate subtotal
        const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Format the order data for display
        const formattedOrder = {
          id: orderData.id,
          date: formatFirestoreDate(orderData.createdAt) || 'N/A',
          service: orderData.items[0]?.name || 'Laundry Service',
          status: orderData.status || 'Pending',
          paymentMethod: orderData.paymentMethod || 'Card',
          deliveryAddress: orderData.address || 'N/A',
          items: orderData.items || [],
          timeline: orderData.timeline || [
            { status: 'Order Placed', date: formatFirestoreDate(orderData.createdAt), completed: true },
            { status: 'Payment Confirmed', date: formatFirestoreDate(orderData.createdAt), completed: true },
            { status: 'In Progress', date: 'Processing', completed: false },
            { status: 'Ready for Delivery', date: 'Estimated: In 2 days', completed: false },
            { status: 'Delivered', date: 'Estimated: In 3 days', completed: false }
          ],
          amount: subtotal,
          deliveryFee: 5000, // Default delivery fee if not specified
          promotion: 0, // Default promotion amount if not specified
          total: orderData.totalAmount || subtotal + 5000 // Use total amount or calculate it
        };
        
        setOrder(formattedOrder);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);
  
  // Calculate the progress percentage for the progress bar
  const calculateProgress = () => {
    if (!order || !order.timeline) return 0;
    const completedSteps = order.timeline.filter(step => step.completed).length;
    return (completedSteps / order.timeline.length) * 100;
  };
  
  // Function to render order items
  const renderOrderItems = () => {
    if (!order || !order.items) return null;
    
    return order.items.map((item, index) => (
      <View key={index} style={styles.orderItemRow}>
        <View style={styles.orderItemDetail}>
          <Text style={styles.orderItemName}>{item.name}</Text>
          <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
        </View>
        <Text style={styles.orderItemPrice}>₹{item.price.toFixed(2)}</Text>
      </View>
    ));
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </ScreenContainer>
    );
  }
  
  // If error, show error message
  if (error) {
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
          <View style={{width: 24}} />
        </View>
        
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={50} color="#E74C3C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              getOrderFromFirestore(orderId)
                .then(data => {
                  if (data) {
                    setOrder(data);
                    setError(null);
                  } else {
                    setError('Order not found. Please try again.');
                  }
                })
                .catch(err => {
                  setError('Failed to load order details. Please try again.');
                  console.error(err);
                })
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }
  
  // If no order (shouldn't happen but just in case)
  if (!order) {
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
          <View style={{width: 24}} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

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
            <Text style={styles.priceValue}>₹{order.amount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>₹{order.deliveryFee.toFixed(2)}</Text>
          </View>
          
          {order.promotion > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Promotion</Text>
              <Text style={[styles.priceValue, styles.discountText]}>-₹{order.promotion.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.total.toFixed(2)}</Text>
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

// Function to determine the color based on order status
const getStatusColor = (status) => {
  switch(status) {
    case 'Pending':
      return '#FFA500';
    case 'Processing':
      return '#FFA500';
    case 'In Progress':
      return '#FFA500';
    case 'Ready for Delivery':
      return '#007AFF';
    case 'In Transit':
      return '#007AFF';
    case 'Delivered':
      return '#4CD964';
    case 'Cancelled':
      return '#FF3B30';
    default:
      return '#FFA500';
  }
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 10,
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
    backgroundColor: '#243D6E',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#E74C3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default OrderDetailScreen;
