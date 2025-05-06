import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';

const { width } = Dimensions.get('window');

const PaymentSuccessScreen = ({ route, navigation }) => {
  // Extract order details from route params
  const { 
    orderId = 'ORD123456',
    date = '15 Nov 2023',
    service = 'Wash & Fold',
    total = 80000,
    estimatedDelivery = '18 Nov 2023'
  } = route.params || {};
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Run animation sequence
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
  }, []);
  
  // Handle viewing order details
  const handleViewOrderDetails = () => {
    navigation.navigate('Orders', {
      screen: 'OrderDetail',
      params: { orderId }
    });
  };
  
  // Handle going back to home screen
  const handleGoToHome = () => {
    navigation.navigate('MainTabs', { screen: 'HomeScreen' });
  };
  
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
            <Text style={styles.orderDetailValue}>{orderId}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Service</Text>
            <Text style={styles.orderDetailValue}>{service}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Date</Text>
            <Text style={styles.orderDetailValue}>{date}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Amount</Text>
            <Text style={styles.orderDetailValue}>Rp {total.toLocaleString()}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Est. Delivery</Text>
            <Text style={styles.orderDetailValue}>{estimatedDelivery}</Text>
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    padding: 24,
  },
  homeButton: {
    backgroundColor: '#243D6E',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewOrderButton: {
    backgroundColor: '#243D6E',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PaymentSuccessScreen; 