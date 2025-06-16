import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import { getOrderById } from '../../config/firebase';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        if (orderData) {
          setOrder({
            ...orderData,
            date: orderData.createdAt?.toDate?.().toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) || 'N/A',
            timeline: [
              { status: 'Order Placed', emoji: '📦', date: orderData.createdAt?.toDate?.().toLocaleDateString() || 'N/A', completed: true },
              { status: 'Payment Confirmed', emoji: '💳', date: orderData.createdAt?.toDate?.().toLocaleDateString() || 'N/A', completed: true },
              { status: 'In Progress', emoji: '🔄', date: 'Processing', completed: orderData.status === 'Processing' || orderData.status === 'Ready for Delivery' || orderData.status === 'Delivered' },
              { status: 'Ready for Delivery', emoji: '🚚', date: 'Estimated: In 2 days', completed: orderData.status === 'Ready for Delivery' || orderData.status === 'Delivered' },
              { status: 'Delivered', emoji: '✨', date: 'Estimated: In 3 days', completed: orderData.status === 'Delivered' }
            ],
            amount: parseFloat(orderData.service?.price || 0),
            deliveryFee: 5.00,
            promotion: orderData.offerDiscountAmount || 0,
            total: parseFloat(orderData.service?.finalPrice || 0)
          });
        } else {
          setError('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  if (error) return (
    <View style={[styles.container, styles.centered]}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
  if (!order) return <View style={[styles.container, styles.centered]}><Text style={styles.errorText}>No order details available</Text></View>;

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Order Status</Text>
            <Text style={[styles.statusBadge, { backgroundColor: theme.colors.primary + '20' }]}>{order.status}</Text>
          </View>
          <View style={styles.timeline}>
            {order.timeline.map((step, index) => (
              <View key={index} style={styles.timelineStep}>
                <View style={[styles.timelineDot, { backgroundColor: step.completed ? theme.colors.primary : theme.colors.border }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{step.emoji} {step.status}</Text>
                  <Text style={styles.timelineDate}>{step.date}</Text>
                </View>
                {index < order.timeline.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: step.completed ? theme.colors.primary : theme.colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Service Details</Text>
          <View style={styles.serviceCard}>
            <Image source={{ uri: order.service?.image }} style={styles.serviceImage} />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{order.service?.name}</Text>
              <Text style={styles.serviceDescription}>{order.service?.description}</Text>
              <View style={styles.serviceMeta}>
                <Text style={styles.servicePrice}>₹{order.service?.price}</Text>
                <Text style={styles.serviceUnit}>{order.service?.unit}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Date</Text>
              <Text style={styles.summaryValue}>{order.date}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Date</Text>
              <Text style={styles.summaryValue}>{order.pickupDate?.formatted}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Time</Text>
              <Text style={styles.summaryValue}>{order.pickupTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{order.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹{order.deliveryFee.toFixed(2)}</Text>
            </View>
            {order.promotion > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Promotion</Text>
                <Text style={[styles.summaryValue, styles.promotionText]}>-₹{order.promotion.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
          <View style={styles.addressCard}>
            <MaterialIcons name="location-on" size={24} color={theme.colors.primary} />
            <Text style={styles.addressText}>{order.address}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.supportButton]} onPress={() => Alert.alert('Support', 'Need help? We got you! 💫')}>
            <MaterialIcons name="support-agent" size={24} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.trackButton]} onPress={() => Alert.alert('Track Order', 'Track your order in real-time 🚀')}>
            <MaterialIcons name="local-shipping" size={24} color={theme.colors.white} />
            <Text style={[styles.actionButtonText, { color: theme.colors.white }]}>Track Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusCard: {
    backgroundColor: theme.colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  timeline: {
    marginTop: 16,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    width: 2,
    height: '100%',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  serviceInfo: {
    padding: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 8,
  },
  serviceUnit: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  promotionText: {
    color: theme.colors.success,
  },
  addressCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  supportButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  trackButton: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OrderDetailScreen;
