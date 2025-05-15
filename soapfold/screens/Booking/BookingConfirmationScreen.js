import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import ScreenContainer from '../../components/ScreenContainer';

const BookingConfirmationScreen = ({ navigation, route }) => {
  const { 
    bookingId = 'LDY123456',
    service = { name: 'Wash & Fold' },
    pickupDate = '15 Jun',
    pickupTime = '9:00 AM - 11:00 AM',
    address = '123 Main St, New York, NY 10001',
    totalPrice = 29.99
  } = route.params || {};
  
  return (
    <ScreenContainer>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.container}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successCircle}>
                <MaterialIcons name="check" size={60} color="#fff" />
              </View>
            </View>
            
            {/* Success Message */}
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successMessage}>
              Your laundry service has been booked successfully. We'll pick up your items at the scheduled time.
            </Text>
            
            {/* Booking Details Card */}
            <View style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingTitle}>Booking Details</Text>
                <Text style={styles.bookingId}>#{bookingId}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialIcons name="local-laundry-service" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Service</Text>
                  <Text style={styles.detailValue}>{service.name}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialIcons name="event" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Pickup Date</Text>
                  <Text style={styles.detailValue}>{pickupDate}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialIcons name="access-time" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Pickup Time</Text>
                  <Text style={styles.detailValue}>{pickupTime}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{address}</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹{totalPrice}</Text>
              </View>
            </View>
            
            {/* Next Steps */}
            <View style={styles.nextStepsContainer}>
              <Text style={styles.nextStepsTitle}>What's Next?</Text>
              
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Prepare your laundry items for pickup at the scheduled time.
                </Text>
              </View>
              
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Our cleaner will pick up your items and take them for processing.
                </Text>
              </View>
              
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Track your order status from the Orders tab in the app.
                </Text>
              </View>
              
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>
                  Clean laundry will be delivered back to you within 48 hours.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.viewOrderButton}
            onPress={() => navigation.navigate('OrderDetailScreen', { orderId: bookingId })}
          >
            <Text style={styles.viewOrderButtonText}>View Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  container: {
    padding: 16,
  },
  successIconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  bookingCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  nextStepsContainer: {
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewOrderButton: {
    flex: 1,
    backgroundColor: `${theme.colors.primary}20`,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  viewOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  homeButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BookingConfirmationScreen; 