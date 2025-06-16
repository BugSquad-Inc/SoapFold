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
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import ScreenContainer from '../../components/ScreenContainer';
import Constants from 'expo-constants';
import { createOrder, createPayment } from '../../config/firestore';
import { getApp } from '@react-native-firebase/app';
import { getFirestore, serverTimestamp } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { getUserFromFirestore } from '../../config/firestore';
import { useTheme } from '../../utils/ThemeContext';
import {
  validateService,
  validateQuantity,
  calculateBasePrice,
  calculateAdditionalItemsPrice,
  calculateFinalPrice,
  RAZORPAY_TEST_KEY,
  DELIVERY_FEE,
  ERROR_MESSAGES
} from '../../utils/bookingUtils';
import { auth, firestore } from '../../config/firebase';
import { createBookingInFirestore } from '../../config/firestore';

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
  const { theme: activeTheme } = useTheme();
  const { service, quantity = 1, totalPrice = 14.99, offerExists = false, offerDiscountAmount = 0 } = route.params || {};
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [itemCounts, setItemCounts] = useState({
    tShirts: 0,
    pants: 0,
    dresses: 0,
    suits: 0,
    jackets: 0,
    bedSheets: 0,
    towels: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (route.params?.service) {
      setSelectedService(route.params.service);
    }
    if (route.params?.address) {
      setSelectedAddress(route.params.address);
    }
    fetchUserData();
  }, [route.params]);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userData = await getUserFromFirestore(currentUser.uid);
        if (userData) {
          setUserData(userData);
          setFormData(prev => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  // Validate required params on mount
  useEffect(() => {
    if (!route.params?.service) {
      setError(ERROR_MESSAGES.INVALID_SERVICE);
      return;
    }

    const serviceData = {
      ...route.params.service,
      type: route.params.service.type || 'wash_fold'
    };

    if (!validateService(serviceData)) {
      setError(ERROR_MESSAGES.INVALID_SERVICE);
      return;
    }

    setLoading(false);
  }, [route.params]);

  // Calculate prices only if service exists
  const basePrice = service ? (service.totalPrice || calculateBasePrice(service, quantity)) : 0;
  
  // Add defensive programming for additionalItemsPrice
  let additionalItemsPrice = 0;
  try {
    if (service) {
      const calculatedPrice = calculateAdditionalItemsPrice(itemCounts, basePrice);
      additionalItemsPrice = typeof calculatedPrice === 'number' ? calculatedPrice : 0;
    }
  } catch (error) {
    console.warn('Error calculating additional items price:', error);
    additionalItemsPrice = 0;
  }

  // Add logging to help diagnose the issue
  console.log('Price calculations:', {
    basePrice,
    additionalItemsPrice,
    itemCounts,
    service
  });

  // Update item count with validation
  const updateItemCount = (item, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    setItemCounts(prev => ({
      ...prev,
      [item]: newValue
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!selectedDate || !selectedTime || !address) {
      Alert.alert('Error', ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
      return false;
    }
    return true;
  };

  // Show error state if there's an error
  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
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

  // Show loading state
  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

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
  
  // Calculate total items
  const totalItems = Object.values(itemCounts).reduce((sum, count) => sum + count, 0) + quantity;
  
  // Calculate original and discounted prices with defensive programming
  const originalServicePrice = (service?.price || 14.99) * quantity;
  const discountAmount = offerExists ? (originalServicePrice * offerDiscountAmount / 100) : 0;
  const discountedServicePrice = originalServicePrice - discountAmount;
  const deliveryFee = 5.00;
  
  // Ensure all values are numbers before calculation
  const finalPrice = Number(discountedServicePrice) + Number(additionalItemsPrice) + Number(deliveryFee);
  
  // Add logging for price calculations
  console.log('Final price calculations:', {
    originalServicePrice,
    discountAmount,
    discountedServicePrice,
    additionalItemsPrice,
    deliveryFee,
    finalPrice
  });
  
  const dates = generateDates();

  // Define the items to be passed to payment
  const getFormattedItems = () => {
    return {
      baseItem: { name: service?.name || 'Wash & Fold', quantity, price: finalPrice },
      additionalItems: Object.entries(itemCounts)
        .filter(([_, count]) => count > 0)
        .map(([item, count]) => ({
          name: item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          count,
          price: calculateAdditionalItemsPrice({ [item]: count }, basePrice)
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

  // Handle payment success
  const handlePaymentSuccess = async (razorpayData) => {
    try {
      setIsProcessing(true);
      
      // Create order data (do not set orderId yet)
      const orderData = {
        customerId: auth.currentUser?.uid,
        service: {
          ...service,
          quantity,
          finalPrice: finalPrice.toFixed(2)
        },
        pickupDate: selectedDate,
        pickupTime: selectedTime,
        address,
        notes,
        status: 'Processing',
        createdAt: serverTimestamp(),
        offerApplied: offerExists,
        offerDiscountAmount: offerExists ? offerDiscountAmount : 0
      };

      // Log orderData
      console.log('orderData:', orderData);

      // Validate orderData
      if (!orderData.customerId || !orderData.service || !orderData.pickupDate || !orderData.pickupTime || !orderData.address || typeof orderData.service.finalPrice === 'undefined') {
        Alert.alert('Error', 'Order data is missing required fields.');
        setIsProcessing(false);
        return;
      }

      // Create order in Firestore and get the Firestore document ID
      const orderId = await createOrder(orderData);

      // Create payment record
      const paymentData = {
        orderId,
        customerId: auth.currentUser?.uid,
        amount: finalPrice.toFixed(2),
        paymentId: razorpayData.razorpay_payment_id,
        status: 'completed',
        createdAt: serverTimestamp(),
        method: 'razorpay',
      };

      // Log paymentData
      console.log('paymentData:', paymentData);

      // Validate paymentData
      if (!paymentData.orderId || !paymentData.customerId || !paymentData.amount || !paymentData.paymentId) {
        Alert.alert('Error', 'Payment data is missing required fields.');
        setIsProcessing(false);
        return;
      }

      // Create payment record
      const paymentId = await createPayment(paymentData);

      // Navigate to confirmation screen with Firestore orderId
      navigation.replace('BookingConfirmationScreen', {
        bookingId: orderId,
        service: service,
        pickupDate: selectedDate.formatted,
        pickupTime: selectedTime,
        address: address,
        totalPrice: finalPrice.toFixed(2),
        offerApplied: offerExists,
        offerDiscountAmount: offerExists ? offerDiscountAmount : 0
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
      // Defensive logging
      console.log('finalPrice:', finalPrice, 'discountedServicePrice:', discountedServicePrice, 'additionalItemsPrice:', additionalItemsPrice, 'deliveryFee:', deliveryFee);
      if (isNaN(finalPrice) || finalPrice <= 0) {
        Alert.alert('Error', 'Calculated total amount is invalid. Please check your order details.');
        setIsProcessing(false);
        return;
      }
      const amountInPaise = Math.round(finalPrice * 100);
      
      if (isNaN(amountInPaise) || amountInPaise <= 0) {
        Alert.alert('Error', 'Payment amount is invalid.');
        setIsProcessing(false);
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
        
        {/* Offer Applied Banner */}
        {offerExists && (
          <View style={styles.offerBanner}>
            <MaterialIcons name="local-offer" size={22} color="#fff" />
            <Text style={styles.offerBannerText}>
              Offer Applied! {offerDiscountAmount}% OFF
            </Text>
          </View>
        )}
        
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
                  <Text style={styles.baseItemPrice}>₹{finalPrice}</Text>
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
                <Text style={styles.summaryLabel}>Service ({quantity} {service?.unit || 'kg'}):</Text>
                <Text style={styles.summaryValue}>₹{originalServicePrice.toFixed(2)}</Text>
              </View>
              {offerExists && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount ({offerDiscountAmount}%):</Text>
                  <Text style={[styles.summaryValue, { color: 'green' }]}>-₹{discountAmount.toFixed(2)}</Text>
                </View>
              )}
              {offerExists && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Service After Discount:</Text>
                  <Text style={styles.summaryValue}>₹{discountedServicePrice.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Additional Items:</Text>
                <Text style={styles.summaryValue}>₹{Number(additionalItemsPrice).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₹{finalPrice.toFixed(2)}</Text>
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
            {isProcessing ? 'Processing...' : `Pay ₹${finalPrice.toFixed(2)}`}

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
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    margin: 16,
    marginBottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  offerBannerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BookingScreen; 