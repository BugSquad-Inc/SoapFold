import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  Alert,
  FlatList
} from 'react-native';
import { MaterialIcons, Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { theme, getTextStyle } from '../utils/theme';
import ScreenContainer from '../components/ScreenContainer';

const PaymentScreen = ({ navigation, route }) => {
  const { 
    service, 
    items = {}, 
    totalItems = 1,
    pickupDate = '15 Jun',
    pickupTime = '9:00 AM - 11:00 AM',
    address = '',
    notes = '',
    totalPrice = 29.99 
  } = route.params || {};
  
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  
  // Format card number with spaces
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
  };
  
  // Format expiry date (MM/YY)
  const formatExpiry = (text) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const formatted = cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned;
    return formatted.slice(0, 5); // Limit to MM/YY format
  };
  
  // Mask card number for display (e.g., **** **** **** 1234)
  const maskCardNumber = (number) => {
    if (!number) return '';
    const last4 = number.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };
  
  // Handle card number change
  const handleCardNumberChange = (text) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };
  
  // Handle expiry change
  const handleExpiryChange = (text) => {
    const formatted = formatExpiry(text);
    setCardExpiry(formatted);
  };
  
  // Handle CVV change
  const handleCVVChange = (text) => {
    const cleaned = text.replace(/[^0-9]/gi, '');
    setCardCVV(cleaned.slice(0, 3));
  };
  
  // Check if payment form is valid
  const isFormValid = () => {
    if (selectedPayment === 'card') {
      return (
        cardNumber.replace(/\s+/g, '').length === 16 &&
        cardExpiry.length === 5 &&
        cardCVV.length === 3 &&
        nameOnCard.trim().length > 0
      );
    }
    return true; // For cash payment, no validation needed
  };
  
  // Handle payment submission
  const handlePayment = () => {
    if (!isFormValid()) {
      Alert.alert('Invalid Payment Details', 'Please check your payment information and try again.');
      return;
    }
    
    // Simulate payment processing
    navigation.navigate('BookingConfirmationScreen', {
      bookingId: `LDY${Math.floor(100000 + Math.random() * 900000)}`,
      service,
      pickupDate,
      pickupTime,
      address,
      totalPrice
    });
  };
  
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
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service:</Text>
                <Text style={styles.summaryValue}>{service?.name || 'Wash & Fold'}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pickup Date:</Text>
                <Text style={styles.summaryValue}>{pickupDate}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pickup Time:</Text>
                <Text style={styles.summaryValue}>{pickupTime}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>${totalPrice}</Text>
              </View>
            </View>
            
            {/* Payment Methods */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <View style={styles.paymentOptions}>
              <TouchableOpacity 
                style={[
                  styles.paymentOption,
                  selectedPayment === 'card' && styles.selectedPaymentOption
                ]}
                onPress={() => setSelectedPayment('card')}
              >
                <View style={styles.paymentIconContainer}>
                  <MaterialIcons name="credit-card" size={24} color={selectedPayment === 'card' ? theme.colors.primary : '#666'} />
                </View>
                <Text style={[
                  styles.paymentLabel,
                  selectedPayment === 'card' && styles.selectedPaymentLabel
                ]}>
                  Credit/Debit Card
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.paymentOption,
                  selectedPayment === 'cash' && styles.selectedPaymentOption
                ]}
                onPress={() => setSelectedPayment('cash')}
              >
                <View style={styles.paymentIconContainer}>
                  <MaterialIcons name="attach-money" size={24} color={selectedPayment === 'cash' ? theme.colors.primary : '#666'} />
                </View>
                <Text style={[
                  styles.paymentLabel,
                  selectedPayment === 'cash' && styles.selectedPaymentLabel
                ]}>
                  Cash on Delivery
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Card Details Section - only show if card payment is selected */}
            {selectedPayment === 'card' && (
              <View style={styles.cardDetailsContainer}>
                <Text style={styles.cardDetailsTitle}>Card Details</Text>
                
                <View style={styles.cardTypeContainer}>
                  <Image 
                    source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png'}} 
                    style={styles.cardTypeIcon} 
                    resizeMode="contain"
                  />
                  <Image 
                    source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png'}} 
                    style={styles.cardTypeIcon} 
                    resizeMode="contain"
                  />
                  <Image 
                    source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png'}} 
                    style={styles.cardTypeIcon} 
                    resizeMode="contain"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </View>
                
                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChangeText={handleExpiryChange}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      value={cardCVV}
                      onChangeText={handleCVVChange}
                      keyboardType="number-pad"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name on Card</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    value={nameOnCard}
                    onChangeText={setNameOnCard}
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.saveCardContainer}>
                  <TouchableOpacity style={styles.checkbox}>
                    <MaterialIcons name="check" size={16} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.saveCardText}>Save card for future payments</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        
        {/* Pay Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.payButton, !isFormValid() && styles.disabledButton]}
            disabled={!isFormValid()}
            onPress={handlePayment}
          >
            <Text style={styles.payButtonText}>
              Pay ${totalPrice}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  summaryCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentOptions: {
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentOption: {
    backgroundColor: `${theme.colors.primary}20`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 12,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#333',
  },
  selectedPaymentLabel: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  cardDetailsContainer: {
    marginBottom: 24,
  },
  cardDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cardTypeIcon: {
    width: 60,
    height: 40,
    marginRight: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  saveCardText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen; 