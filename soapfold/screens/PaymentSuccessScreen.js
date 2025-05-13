import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import { getOrderById } from '../config/firebase';

const { width } = Dimensions.get('window');

const PaymentSuccessScreen = ({ route, navigation }) => {
  // Extract order details from route params
  const { 
    orderId, 
    paymentId,
    totalAmount
  } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Fetch order details from Firestore
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          setError('Order ID not found');
          setLoading(false);
          return;
        }
        
        const order = await getOrderById(orderId);
        
        if (!order) {
          setError('Order not found. Please check your orders in the Orders tab.');
          setLoading(false);
          return;
        }
        
        // Format delivery date
        const estimatedDelivery = order.deliveryDate 
          ? new Date(order.deliveryDate.seconds * 1000).toLocaleDateString('en-US', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })
          : 'In 2-3 days';
        
        setOrderDetails({
          id: order.id,
          service: order.items[0]?.name || 'Laundry Service',
          date: new Date().toLocaleDateString('en-US', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }),
          total: order.totalAmount,
          estimatedDelivery: estimatedDelivery
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  useEffect(() => {
    // Run animation sequence when order details are loaded
    if (!loading && !error) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [loading, error]);
  
  // Handle viewing order details
  const handleViewOrderDetails = () => {
    navigation.navigate('Orders', {
      screen: 'OrderDetail',
      params: { orderId: orderDetails?.id || orderId }
    });
  };
  
  // Handle going back to home screen
  const handleGoToHome = () => {
    navigation.navigate('MainTabs', { screen: 'HomeScreen' });
  };
  
  // If loading, show loading indicator
  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CD964" />
          <Text style={styles.loadingText}>Finalizing your order...</Text>
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
            style={styles.closeButton}
            onPress={handleGoToHome}
          >
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={50} color="#E74C3C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={handleGoToHome}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }
  
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleGoToHome}
        >
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.animationContainer}>
        <View style={styles.successCircle}>
          <Animated.View 
            style={[
              styles.checkIconContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <MaterialIcons name="check" size={64} color="#FFFFFF" />
          </Animated.View>
        </View>
      </View>
      
      <Animated.View 
        style={[
          styles.contentContainer, 
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successMessage}>
          Your order has been placed successfully. We'll take it from here!
        </Text>
        
        <View style={styles.orderSummaryCard}>
          <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Order ID</Text>
            <Text style={styles.orderDetailValue}>#{orderDetails?.id || orderId}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Service</Text>
            <Text style={styles.orderDetailValue}>{orderDetails?.service || 'Laundry Service'}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Date</Text>
            <Text style={styles.orderDetailValue}>{orderDetails?.date || new Date().toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Amount</Text>
            <Text style={styles.orderDetailValue}>₹{(orderDetails?.total || totalAmount).toFixed(2)}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Est. Delivery</Text>
            <Text style={styles.orderDetailValue}>{orderDetails?.estimatedDelivery || 'In 2-3 days'}</Text>
          </View>
        </View>
      </Animated.View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handleGoToHome}
        >
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.viewOrderButton}
          onPress={handleViewOrderDetails}
        >
          <Text style={styles.viewOrderButtonText}>View Order Details</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.5,
    marginBottom: 20,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CD964', // Success green color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  checkIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  orderSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  viewOrderButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#243D6E',
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  viewOrderButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
    marginBottom: 24,
    textAlign: 'center',
  }
});

export default PaymentSuccessScreen; 