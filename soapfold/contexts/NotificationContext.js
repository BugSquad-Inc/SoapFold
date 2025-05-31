import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
  createNotification, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../config/firestore';

// Create the context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Provider component
export const NotificationProvider = ({ children }) => {
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications when user changes
  useEffect(() => {
    const loadNotifications = async () => {
      if (auth.currentUser) {
        try {
          const userNotifications = await getUserNotifications(auth.currentUser.uid);
          setNotifications(userNotifications);
          setUnreadCount(userNotifications.filter(n => !n.isRead).length);
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    };

    loadNotifications();
  }, [auth.currentUser]);

  // Check for scheduled notifications
  useEffect(() => {
    const checkScheduledNotifications = () => {
      const now = new Date();
      const scheduledNotifications = notifications.filter(
        n => n.scheduledFor && !n.isRead && new Date(n.scheduledFor.toDate()) <= now
      );

      if (scheduledNotifications.length > 0) {
        // Update notifications to show scheduled ones
        setNotifications(prev => 
          prev.map(n => 
            scheduledNotifications.some(sn => sn.id === n.id)
              ? { ...n, isScheduled: false }
              : n
          )
        );
      }
    };

    // Check every minute
    const interval = setInterval(checkScheduledNotifications, 60000);
    return () => clearInterval(interval);
  }, [notifications]);

  // Add a new notification
  const addNotification = async (notificationData) => {
    try {
      const notification = {
        ...notificationData,
        userId: auth.currentUser?.uid,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const id = await createNotification(notification);
      const newNotification = { ...notification, id };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      return id;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (auth.currentUser) {
        await markAllNotificationsAsRead(auth.currentUser.uid);
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getNotificationsByType
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 