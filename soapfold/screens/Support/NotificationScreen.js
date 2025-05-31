import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/ThemeContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNotifications } from '../../contexts/NotificationContext';

const groupByDate = (notifications) => {
  const groups = {};
  notifications.forEach((notif) => {
    // Convert Firestore timestamp to date string
    const date = notif.createdAt?.toDate?.() || new Date();
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(notif);
  });
  return groups;
};

const NotificationScreen = ({ navigation }) => {
  const { theme: activeTheme } = useTheme();
  const { notifications, markAsRead } = useNotifications();
  const grouped = groupByDate(notifications);
  const dateSections = Object.keys(grouped);

  const handleNotificationPress = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'order_placed':
        return {
          icon: 'shopping-bag',
          color: '#FF6B6B',
          gradient: ['#FF6B6B', '#FF8E8E']
        };
      case 'payment_success':
        return {
          icon: 'check-circle',
          color: '#4CAF50',
          gradient: ['#4CAF50', '#66BB6A']
        };
      case 'payment_failed':
        return {
          icon: 'alert-circle',
          color: '#FF4D67',
          gradient: ['#FF4D67', '#FF6B6B'],
          errorStyle: true
        };
      case 'pickup_reminder':
        return {
          icon: 'clock',
          color: '#FFD600',
          gradient: ['#FFD600', '#FFE44D']
        };
      default:
        return {
          icon: 'bell',
          color: '#4CAF50',
          gradient: ['#4CAF50', '#66BB6A']
        };
    }
  };

  const renderNotificationContent = (notif) => {
    const style = getNotificationStyle(notif.type);
    
    // Special handling for payment failed notifications
    if (notif.type === 'payment_failed') {
      return (
        <View style={styles.textBlock}>
          <Text style={styles.titleText}>
            {notif.emoji ? `${notif.emoji} ` : ''}{notif.title}
          </Text>
          <Text style={styles.subtitleText}>{notif.subtitle}</Text>
          {notif.data?.errorCode && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorCode}>Error Code: {notif.data.errorCode}</Text>
              <Text style={styles.errorDescription}>{notif.data.errorDescription}</Text>
            </View>
          )}
        </View>
      );
    }

    // Default notification content
    return (
      <View style={styles.textBlock}>
        <Text style={styles.titleText}>
          {notif.emoji ? `${notif.emoji} ` : ''}{notif.title}
        </Text>
        <Text style={styles.subtitleText}>{notif.subtitle}</Text>
      </View>
    );
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
            {grouped[date].map((notif) => {
              const style = getNotificationStyle(notif.type);
              return (
                <TouchableOpacity 
                  key={notif.id} 
                  style={[
                    styles.card,
                    !notif.isRead && styles.unreadCard,
                    style.errorStyle && styles.errorCard
                  ]}
                  onPress={() => handleNotificationPress(notif)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: style.color }]}> 
                    <Feather name={style.icon} size={22} color="#fff" />
                  </View>
                  {renderNotificationContent(notif)}
                  {!notif.isRead && (
                    <View style={[styles.unreadDot, { backgroundColor: style.color }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, backgroundColor: '#F5F1FF' },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 18, 
    paddingBottom: 18, 
    backgroundColor: 'transparent' 
  },
  backButton: { padding: 4, marginRight: 8 },
  header: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#222', 
    flex: 1, 
    textAlign: 'center' 
  },
  sectionTitle: { 
    color: '#222', 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginTop: 24, 
    marginBottom: 10, 
    marginLeft: 18 
  },
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
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  unreadCard: {
    backgroundColor: '#F8F8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    transform: [{ scale: 1.02 }]
  },
  iconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
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
    fontSize: 13,
    lineHeight: 18
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8
  },
  errorCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF4D67',
    backgroundColor: '#FFF5F5'
  },
  errorDetails: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0'
  },
  errorCode: {
    fontSize: 12,
    color: '#FF4D67',
    fontWeight: '600',
    marginBottom: 4
  },
  errorDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16
  }
});

export default NotificationScreen;
