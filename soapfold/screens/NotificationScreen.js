import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme, getTextStyle } from '../utils/theme';
import ScreenContainer from '../components/ScreenContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add a global variable to track unread notifications
// This will be used by the BottomTabNavigator
export let unreadNotificationsCount = 0;

const NotificationScreen = ({ navigation }) => {
  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Order Completed',
      message: 'Your laundry order #LDY123456 has been completed and is ready for pickup.',
      time: '10 mins ago',
      read: false,
      type: 'order',
      icon: 'local-laundry-service',
      orderId: 'LDY123456'
    },
    {
      id: '2',
      title: 'Special Offer',
      message: 'Get 50% off on your next dry cleaning order. Limited time offer!',
      time: '2 hours ago',
      read: false,
      type: 'promo',
      icon: 'local-offer',
      promoCode: 'DRY50'
    },
    {
      id: '3',
      title: 'Delivery Update',
      message: 'Your order #LDY123450 will be delivered today between 2 PM - 4 PM.',
      time: '5 hours ago',
      read: true,
      type: 'delivery',
      icon: 'delivery-dining',
      orderId: 'LDY123450'
    },
    {
      id: '4',
      title: 'Payment Successful',
      message: 'Your payment of $24.99 for order #LDY123450 was successful.',
      time: '1 day ago',
      read: true,
      type: 'payment',
      icon: 'payment',
      orderId: 'LDY123450'
    },
    {
      id: '5',
      title: 'New Service Available',
      message: 'Try our new express stain removal service, now available!',
      time: '2 days ago',
      read: true,
      type: 'service',
      icon: 'water-damage',
      serviceId: 'stain-removal'
    }
  ]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Update the global unread count whenever notifications change
  useEffect(() => {
    unreadNotificationsCount = unreadCount;
    // Save to AsyncStorage for persistence
    saveUnreadCount(unreadCount);
  }, [unreadCount]);

  // Save unread count to AsyncStorage
  const saveUnreadCount = async (count) => {
    try {
      await AsyncStorage.setItem('@unreadNotifications', count.toString());
    } catch (error) {
      console.log('Error saving unread notifications count', error);
    }
  };

  const getIconBackgroundColor = (type) => {
    switch(type) {
      case 'order':
        return '#4CAF50';
      case 'promo':
        return '#FF9800';
      case 'delivery':
        return '#2196F3';
      case 'payment':
        return '#9C27B0';
      case 'service':
        return '#F44336';
      default:
        return theme.colors.primary;
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleNotificationPress = (item) => {
    // Mark notification as read
    markAsRead(item.id);

    // Navigate based on notification type
    if (item.type === 'order' || item.type === 'delivery' || item.type === 'payment') {
      // For order-related notifications, navigate to order details
      navigation.navigate('OrderDetailScreen', { 
        orderId: item.orderId 
      });
    } else if (item.type === 'promo') {
      // For promotional notifications, navigate to service categories
      navigation.navigate('ServiceCategoryScreen', { 
        promoCode: item.promoCode
      });
    } else if (item.type === 'service') {
      // For service notifications, navigate to the specific service
      navigation.navigate('ServiceDetailScreen', { 
        service: { id: item.serviceId } 
      });
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      "Clear Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          onPress: () => setNotifications([]),
          style: "destructive"
        }
      ]
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Helper function to add a new notification - this could be called from other parts of the app
  const addNotification = (notification) => {
    setNotifications([
      {
        id: Date.now().toString(),
        read: false,
        time: 'Just now',
        ...notification
      },
      ...notifications
    ]);
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read ? styles.readNotification : styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor(item.type) }]}>
        <MaterialIcons name={item.icon} size={24} color="#FFF" />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        
        {item.type === 'promo' && (
          <View style={styles.promoContainer}>
            <Text style={styles.promoCode}>{item.promoCode}</Text>
          </View>
        )}
      </View>
      
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
                <Text style={styles.actionButtonText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={clearAllNotifications}>
              <Text style={styles.actionButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.notificationsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-off" size={80} color="#ddd" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
      </SafeAreaView>
    </ScreenContainer>
  );
};

// Make the function available outside this file
export const addNotification = (notification) => {
  const newNotification = {
    id: Date.now().toString(),
    read: false,
    time: 'Just now',
    ...notification
  };
  
  // Increment the global unread count
  unreadNotificationsCount++;
  
  // In a real app, you'd store this in a state management system or context
  // For this demo, we'll just return the notification object
  return newNotification;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    padding: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadNotification: {
    borderLeftColor: theme.colors.primary,
    backgroundColor: '#fff',
  },
  readNotification: {
    borderLeftColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  promoContainer: {
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  promoCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  }
});

export default NotificationScreen;
