import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Alert, Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go, a development build, or a test environment
const isExpoGo = Constants.appOwnership === 'expo';
const isTestMode = isExpoGo || __DEV__; // Removed the forced "true" to allow production mode

// Conditionally import RazorpayCheckout
let RazorpayCheckout;
try {
  // Only try to import in a real device environment and when not in Expo Go
  if (!isExpoGo && Platform.OS !== 'web') {
    RazorpayCheckout = require('react-native-razorpay').default;
    console.log('Razorpay import successful');
  } else {
    console.log('Skipping Razorpay import in test environment');
  }
} catch (error) {
  console.error('Razorpay import error:', error);
}

// Razorpay API keys
const RAZORPAY_KEY_TEST = 'rzp_test_KhGe6qjulyJzhZ';
const RAZORPAY_KEY_PRODUCTION = 'rzp_live_REPLACE_WITH_YOUR_LIVE_KEY'; // Replace with your live key
const RAZORPAY_KEY = isTestMode ? RAZORPAY_KEY_TEST : RAZORPAY_KEY_PRODUCTION;

const RazorpayScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  
  // Add validation
  if (!route.params?.cartItems || !route.params?.totalPrice) {
    alert('Invalid cart data');
    navigation.goBack();
    return null;
  }

  const { 
    cartItems, 
    totalPrice, 
    serviceTitle, 
    pickupDate, 
    pickupTime, 
    address, 
    notes 
  } = route.params;

  // Test mode payment handler
  const handleTestPayment = () => {
    Alert.alert(
      'Test Payment Mode',
      'This is a test payment. In production, this will use Razorpay.',
      [
        {
          text: 'Simulate Success',
          onPress: () => {
            const testPaymentData = {
              paymentId: 'test_' + Date.now(),
              signature: 'test_signature',
              amount: totalPrice,
              items: cartItems,
              service: serviceTitle,
              timestamp: new Date().toISOString()
            };
            
            navigation.navigate('PaymentSuccessScreen', {
              ...testPaymentData,
              totalAmount: totalPrice
            });
          }
        },
        {
          text: 'Simulate Failure',
          onPress: () => {
            Alert.alert('Payment Failed', 'This is a simulated payment failure');
            navigation.goBack();
          }
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  // Real Razorpay payment handler
  const handleRazorpayPayment = async () => {
    try {
      // Check if Razorpay is available
      if (!RazorpayCheckout) {
        console.warn('RazorpayCheckout is not available, falling back to test mode');
        setIsProcessing(false);
        // Fall back to test payment if Razorpay is not available
        handleTestPayment();
        return;
      }

      const amountInPaise = Math.round(totalPrice * 100);
      
      if (amountInPaise < 100) {
        alert('Amount must be at least ₹1');
        navigation.goBack();
        return;
      }

      const options = {
        description: `Payment for ${serviceTitle?.name || 'Laundry Service'}`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: RAZORPAY_KEY,
        amount: amountInPaise,
        name: 'SoapFold',
        prefill: {
          email: 'arsacskasha@gmail.com',
          contact: '994080029',
          name: 'Arsac'
        },
        theme: { color: '#000000' }
      };

      console.log('Initiating Razorpay payment with options:', options);
      console.log('RazorpayCheckout available:', !!RazorpayCheckout);
      
      try {
        const data = await RazorpayCheckout.open(options);
        console.log('Razorpay success response:', data);
        
        const paymentData = {
          paymentId: data.razorpay_payment_id,
          orderId: data.razorpay_order_id,
          signature: data.razorpay_signature,
          amount: totalPrice,
          items: cartItems,
          service: serviceTitle,
          timestamp: new Date().toISOString()
        };
  
        navigation.navigate('PaymentSuccessScreen', {
          ...paymentData,
          totalAmount: totalPrice
        });
      } catch (err) {
        console.error('Razorpay error response:', err);
        throw err;
      }    

    } catch (error) {
      console.error('Payment Error Details:', error);
      setError(error.message || 'Payment failed');
      
      if (error.code === 'PAYMENT_CANCELLED') {
        alert('Payment was cancelled by user');
      } else if (error.code === 'NETWORK_ERROR') {
        alert('Network error occurred. Please check your internet connection');
      } else if (error.description) {
        alert(`Payment failed: ${error.description}`);
      } else {
        alert('Payment failed. Please try again later');
      }
      navigation.goBack();
    } finally {
      setIsProcessing(false);
    }
  };

  // Choose appropriate payment handler based on environment
  const handlePayment = isTestMode ? handleTestPayment : handleRazorpayPayment;

  // Auto-initiate payment when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePayment();
    }, 500); // Short delay for better user experience
    
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Payment Error: {error}</Text>
        <Text style={styles.retryText} onPress={() => navigation.goBack()}>
          Go back and try again
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.loadingText}>Initializing payment...</Text>
      {isTestMode && (
        <Text style={styles.testModeText}>
          Running in Test Mode
        </Text>
      )}
    </View>
  );
};

export default RazorpayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333'
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20
  },
  retryText: {
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline'
  },
  testModeText: {
    position: 'absolute',
    bottom: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 12
  }
});
