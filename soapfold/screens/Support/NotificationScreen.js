import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/ThemeContext';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const mockNotifications = [
  {
    id: '1',
    type: 'order_placed',
    title: 'Order Placed Successfully!',
    subtitle: 'Your order #12345 has been placed',
    icon: 'shopping-bag',
    color: '#00C48C',
    date: 'Today',
    orderId: '12345',
    status: 'pending'
  },
  {
    id: '2',
    type: 'payment_success',
    title: 'Payment Successful!',
    subtitle: 'Payment of ₹299 for order #12345 has been completed',
    icon: 'check-circle',
    color: '#7B61FF',
    date: 'Today',
    orderId: '12345',
    amount: 299
  },
  {
    id: '3',
    type: 'payment_failed',
    title: 'Payment Failed',
    subtitle: 'Payment for order #12346 could not be processed',
    icon: 'alert-circle',
    color: '#FF4D67',
    date: 'Yesterday',
    orderId: '12346',
    amount: 299
  },
  {
    id: '4',
    type: 'pickup_reminder',
    title: 'Pickup Reminder',
    subtitle: 'Your laundry pickup is scheduled for tomorrow at 10:00 AM',
    icon: 'clock',
    color: '#FFD600',
    date: 'Yesterday',
    orderId: '12345',
    pickupTime: '10:00 AM'
  }
];

const groupByDate = (notifications) => {
  const groups = {};
  notifications.forEach((notif) => {
    if (!groups[notif.date]) groups[notif.date] = [];
    groups[notif.date].push(notif);
  });
  return groups;
};

const NotificationScreen = ({ navigation }) => {
  const { theme: activeTheme } = useTheme();
  const grouped = groupByDate(mockNotifications);
  const dateSections = Object.keys(grouped);

  const handleNotificationPress = (notification) => {
    switch (notification.type) {
      case 'order_placed':
        navigation.navigate('OrderDetailScreen', { orderId: notification.orderId });
        break;
      case 'payment_success':
      case 'payment_failed':
        navigation.navigate('OrderDetailScreen', { orderId: notification.orderId });
        break;
      case 'pickup_reminder':
        navigation.navigate('OrderDetailScreen', { orderId: notification.orderId });
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F5F1FF' }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {dateSections.map((date) => (
          <View key={date}>
            <Text style={styles.sectionTitle}>{date}</Text>
            {grouped[date].map((notif) => (
              <TouchableOpacity 
                key={notif.id} 
                style={styles.card}
                onPress={() => handleNotificationPress(notif)}
              >
                <View style={[styles.iconCircle, { backgroundColor: notif.color }]}> 
                  <Feather name={notif.icon} size={22} color="#fff" />
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.titleText}>{notif.title}</Text>
                  <Text style={styles.subtitleText}>{notif.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, backgroundColor: '#F5F1FF' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 18, backgroundColor: 'transparent' },
  backButton: { padding: 4, marginRight: 8 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#222', flex: 1, textAlign: 'center' },
  sectionTitle: { color: '#222', fontWeight: 'bold', fontSize: 16, marginTop: 24, marginBottom: 10, marginLeft: 18 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 18, 
    marginHorizontal: 16, 
    marginBottom: 14, 
    padding: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 2 
  },
  iconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  textBlock: { 
    flex: 1 
  },
  titleText: { 
    color: '#222', 
    fontWeight: 'bold', 
    fontSize: 15, 
    marginBottom: 2 
  },
  subtitleText: { 
    color: '#888', 
    fontSize: 13 
  }
});

export default NotificationScreen;
