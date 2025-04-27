import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Platform, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';

// Check if we're running in Expo Go or development build
const isExpoGo = Constants.appOwnership === 'expo';

// Conditionally import RazorpayCheckout
let RazorpayCheckout;
if (!isExpoGo) {
  try {
    RazorpayCheckout = require('react-native-razorpay').default;
  } catch (error) {
    console.log('Razorpay import error:', error);
  }
}

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

const RazorpayScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Add validation
  if (!route.params?.cartItems || !route.params?.totalPrice) {
    alert('Invalid cart data');
    navigation.goBack();
    return null;
  }

  const { cartItems, totalPrice, serviceTitle } = route.params;

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
              // orderId: 'test_order_' + Date.now(),
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
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  // Real Razorpay payment handler
  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      const amountInPaise = Math.round(totalPrice * 100);
      
      if (amountInPaise < 100) {
        alert('Amount must be at least ₹1');
        return;
      }

      const options = {
        description: `Payment for ${serviceTitle}`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: 'rzp_test_KhGe6qjulyJzhZ',
        amount: amountInPaise,
        name: 'SoapFold',
        // order_id: `order_${Math.floor(Math.random() * 1000000000)}`,
        prefill: {
          email: 'arsacskasha@gmail.com',
          contact: '994080029',
          name: 'Arsac'
        },
        theme: { color: '#000000' },
        // notes: {
        //   serviceTitle: serviceTitle,
        //   items: JSON.stringify(cartItems)
        // },
        // retry: {
        //   enabled: true,
        //   max_count: 1
        // },
        // send_sms_hash: true,
        // remember_customer: true,
        // timeout: 300
      };

      console.log('Initiating Razorpay payment with options:', options);
      // const data = await RazorpayCheckout.open(options);
      try {
        const data = await RazorpayCheckout.open(options);
        console.log('Razorpay success response:', data);
      } catch (err) {
        console.error('Razorpay error response:', err);  // This will help us debug
      }    
      
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

    } catch (error) {
      console.error('Payment Error Details:', error);
      
      if (error.code === 'PAYMENT_CANCELLED') {
        alert('Payment was cancelled by user');
      } else if (error.code === 'NETWORK_ERROR') {
        alert('Network error occurred. Please check your internet connection');
      } else if (error.description) {
        alert(`Payment failed: ${error.description}`);
      } else {
        alert('Payment failed. Please try again later');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Choose appropriate payment handler based on environment
  const handlePayment = isExpoGo ? handleTestPayment : handleRazorpayPayment;
  console.log("HandlePayment ",handlePayment);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerText}>Payment</Text>
        <FontAwesome name="user-circle" size={24} color="#555" />
      </View>

      {/* Order Summary */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {Object.entries(cartItems).map(([itemName, quantity], index) => {
          const unitPrice = samplePrices[itemName] || 0;
          const price = quantity * unitPrice;
          return (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{itemName}</Text>
              <Text style={styles.itemPrice}>₹{price.toLocaleString()}</Text>
            </View>
          );
        })}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>₹{totalPrice.toLocaleString()}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.primaryButton, isProcessing && styles.buttonDisabled]} 
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <Text style={styles.primaryButtonText}>
            {isProcessing ? 'Processing...' : `Pay ₹${totalPrice.toLocaleString()}`}
          </Text>
        </TouchableOpacity>
        
        {isExpoGo && (
          <Text style={styles.testModeText}>
            Running in Test Mode (Expo Go)
          </Text>
        )}
      </View>
    </View>
  );
};

export default RazorpayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef8e9',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  itemName: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: '#666',
  },
  testModeText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontSize: 12,
  }
});
