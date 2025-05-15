import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  Platform,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import ScreenContainer from '../../components/ScreenContainer';
import Constants from 'expo-constants';
import { createOrder } from '../../config/firestore';
import { createPayment } from '../../config/firestore';
import { auth, db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Modern approach to detect Expo environment
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let RazorpayCheckout;
if (!isExpoGo) {
  try {
    RazorpayCheckout = require('react-native-razorpay').default;
  } catch (error) {
    console.log('Razorpay import error:', error);
  }
}

const BookingScreen = ({ navigation, route }) => {
  const { service, quantity = 1, totalPrice = 14.99 } = route.params || {};
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  
  // Laundry items state
  const [itemCounts, setItemCounts] = useState({
    tShirts: 0,
    pants: 0,
    dresses: 0,
    suits: 0,
    jackets: 0,
    bedSheets: 0,
    towels: 0
  });
  
  // Available dates - next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const dayName = date.toLocaleString('default', { weekday: 'short' });
      
      dates.push({
        id: i,
        fullDate: date,
        formatted: `${day} ${month}`,
        dayName: dayName
      });
    }
    
    return dates;
  };
  
  // Available time slots
  const timeSlots = [
    { id: 1, time: '9:00 AM - 11:00 AM' },
    { id: 2, time: '11:00 AM - 1:00 PM' },
    { id: 3, time: '1:00 PM - 3:00 PM' },
    { id: 4, time: '3:00 PM - 5:00 PM' },
    { id: 5, time: '5:00 PM - 7:00 PM' }
  ];
  
  // Update item count
  const updateItemCount = (item, value) => {
    setItemCounts(prev => ({
      ...prev,
      [item]: Math.max(0, value) // Ensure count doesn't go below 0
    }));
  };
  
  // Calculate total items
  const totalItems = Object.values(itemCounts).reduce((sum, count) => sum + count, 0) + quantity;
  
  // Calculate final price
  const calculateFinalPrice = () => {
    // Base price from the service
    const basePrice = parseFloat(totalPrice);
    
    // Additional fee based on extra items
    const extraItems = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);
    const extraItemFee = extraItems * (service?.price || 14.99) * 0.5; // 50% of base price per additional item type
    
    // Delivery fee
    const deliveryFee = 5.00; // Updated to match the summary display
    
    return (basePrice + extraItemFee + deliveryFee).toFixed(2);
  };
  
  const dates = generateDates();

  // Define the items to be passed to payment
  const getFormattedItems = () => {
    return {
      baseItem: { name: service?.name || 'Wash & Fold', quantity, price: totalPrice },
      additionalItems: Object.entries(itemCounts)
        .filter(([_, count]) => count > 0)
        .map(([item, count]) => ({
          name: item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          count,
          price: (service?.price || 14.99) * 0.5 * count
        }))
    };
  };

  // Define test mode flag - using only __DEV__ to avoid Platform.constants errors
  const isTestMode = __DEV__;

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
            };
            
            handlePaymentSuccess(testPaymentData);
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

  // Handle successful payment
  const handlePaymentSuccess = async (razorpayData) => {
    try {
      setIsProcessing(true);
      
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not found. Please log in again.');
        setIsProcessing(false);
        return;
      }
      
      // Format delivery date - 2 days from pickup
      const pickupDate = new Date(selectedDate.fullDate);
      const deliveryDate = new Date(pickupDate);
      deliveryDate.setDate(deliveryDate.getDate() + 2);
      
      // Format items for Firestore
      const formattedItems = Object.entries(itemCounts)
        .filter(([_, count]) => count > 0)
        .map(([item, count]) => ({
          name: item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          quantity: count,
          price: (service?.price || 14.99) * 0.5 * count
        }));
        
      // Add base service item if quantity > 0
      if (quantity > 0) {
        formattedItems.unshift({
          name: service?.name || 'Wash & Fold',
          quantity,
          price: parseFloat(totalPrice)
        });
      }

      // Create order in Firestore
      const orderData = {
        customerId: user.uid,
        items: formattedItems,
        status: 'pending',
        totalAmount: parseFloat(calculateFinalPrice()),
        pickupDateString: pickupDate.toISOString(),
        deliveryDateString: deliveryDate.toISOString(),
        address: {
          street: address,
          notes: notes
        }
      };

      // Create order and get order ID
      const orderId = await createOrder(orderData);
      
      // Create payment record
      const paymentData = {
        orderId: orderId,
        customerId: user.uid,
        amount: parseFloat(calculateFinalPrice()),
        status: 'success',
        method: 'razorpay',
        transactionId: razorpayData.razorpay_payment_id
      };

      console.log("Payment Data ",paymentData);

      // Create payment record
      const paymentId = await createPayment(paymentData);
      
      // Navigate to success screen
      navigation.replace('PaymentSuccess', {
        orderId: orderId,
        amount: calculateFinalPrice()
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update the Razorpay handler
  const handleRazorpaySuccess = (data) => {
    console.log('Razorpay payment success:', data);
    handlePaymentSuccess(data);
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      const finalPrice = calculateFinalPrice();
      const amountInPaise = Math.round(finalPrice * 100);
      
      if (amountInPaise < 100) {
        alert('Amount must be at least ₹1');
        return;
      }

      const options = {
        description: `Payment for ${service?.name || 'Wash & Fold'}`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: 'rzp_test_KhGe6qjulyJzhZ',
        amount: amountInPaise,
        name: 'SoapFold',
        prefill: {
          email: 'arsacskasha@gmail.com',
          contact: '994080029',
          name: 'Arsac'
        },
        theme: { color: '#000000' },
      };

      console.log('Initiating Razorpay payment with options:', options);
      RazorpayCheckout.open(options)
        .then((data) => {
          console.log(`Payment success: ${JSON.stringify(data)}`);
          handleRazorpaySuccess(data);
        })
        .catch((error) => {
          console.log(`Payment error: ${error.code} | ${error.description}`);
          setIsProcessing(false);
          Alert.alert('Payment Failed', error.description || 'There was a problem with your payment.');
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

  // const handlePayment = isTestMode ? handleTestPayment : handleRazorpayPayment;
  const handlePayment = handleRazorpayPayment;
  console.log("HandlePayment ",handlePayment);
  
  return (
    <ScreenContainer>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{service?.name || 'Laundry Booking'}</Text>
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Text style={styles.sectionTitle}>Laundry Details</Text>
            
            {/* Base Items */}
            <View style={styles.baseItemContainer}>
              <View style={styles.baseItemRow}>
                <Text style={styles.baseItemLabel}>{service?.name || 'Wash & Fold'}</Text>
                <View style={styles.baseQuantityContainer}>
                  <Text style={styles.baseQuantityValue}>{quantity} kg</Text>
                  <Text style={styles.baseItemPrice}>₹{totalPrice}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.sectionSubtitle}>Additional Items</Text>
            
            {/* Additional Items */}
            {Object.entries(itemCounts).map(([item, count]) => (
              <View key={item} style={styles.itemRow}>
                <Text style={styles.itemLabel}>
                  {item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                
                <View style={styles.counterContainer}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => updateItemCount(item, count - 1)}
                  >
                    <MaterialIcons name="remove" size={18} color="#666" />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.counterInput}
                    value={count.toString()}
                    keyboardType="number-pad"
                    onChangeText={value => {
                      const numValue = parseInt(value) || 0;
                      updateItemCount(item, numValue);
                    }}
                  />
                  
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => updateItemCount(item, count + 1)}
                  >
                    <MaterialIcons name="add" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {/* Pickup Date */}
            <Text style={styles.sectionTitle}>Pickup Date</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.datesContainer}
            >
              {dates.map(date => (
                <TouchableOpacity
                  key={date.id}
                  style={[
                    styles.dateItem,
                    selectedDate === date.formatted && styles.selectedDateItem
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[
                    styles.dayName,
                    selectedDate === date.formatted && styles.selectedDateText
                  ]}>
                    {date.dayName}
                  </Text>
                  <Text style={[
                    styles.dateText,
                    selectedDate === date.formatted && styles.selectedDateText
                  ]}>
                    {date.formatted}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Pickup Time */}
            <Text style={styles.sectionTitle}>Pickup Time</Text>
            
            <View style={styles.timeContainer}>
              {timeSlots.map(slot => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeItem,
                    selectedTime === slot.time && styles.selectedTimeItem
                  ]}
                  onPress={() => setSelectedTime(slot.time)}
                >
                  <Text style={[
                    styles.timeText,
                    selectedTime === slot.time && styles.selectedTimeText
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Address */}
            <Text style={styles.sectionTitle}>Pickup Address</Text>
            
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your address"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            
            {/* Notes Section */}
            <View style={styles.notesContainer}>
              <Text style={styles.sectionTitle}>Additional Notes:</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Any special instructions for washing, folding, etc."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
            
            {/* Booking Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service ({quantity} kg):</Text>
                <Text style={styles.summaryValue}>₹{totalPrice}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Additional Items:</Text>
                <Text style={styles.summaryValue}>₹{(Object.values(itemCounts).reduce((sum, count) => sum + count, 0) * (service?.price || 14.99) * 0.5).toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                <Text style={styles.summaryValue}>₹5.00</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₹{calculateFinalPrice()}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              (!selectedDate || !selectedTime || !address) ? styles.disabledButton : {}
            ]}
            disabled={!selectedDate || !selectedTime || !address}
            onPress={handlePayment}
          >
            <Text style={styles.continueButtonText}>
            {isProcessing ? 'Processing...' : `Pay ₹${calculateFinalPrice()}`}

            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    backgroundColor: '#243D6E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  baseItemContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  baseItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  baseItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  baseQuantityContainer: {
    alignItems: 'flex-end',
  },
  baseQuantityValue: {
    fontSize: 14,
    color: '#666',
  },
  baseItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  itemLabel: {
    fontSize: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterInput: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
  },
  datesContainer: {
    marginBottom: 16,
  },
  dateItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedDateItem: {
    backgroundColor: theme.colors.primary,
  },
  dayName: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDateText: {
    color: '#fff',
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  timeItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeItem: {
    backgroundColor: theme.colors.primary,
  },
  timeText: {
    fontSize: 14,
  },
  selectedTimeText: {
    color: '#fff',
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 50,
    marginBottom: 16,
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 100,
  },
  summaryContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  continueButton: {
    backgroundColor: '#243D6E',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingScreen; 