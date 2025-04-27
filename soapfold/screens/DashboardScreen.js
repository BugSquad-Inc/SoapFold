import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, getUserDataFromLocalStorage, clearUserFromLocalStorage } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../utils/theme';

const DashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Get user data from AsyncStorage
          const userData = await getUserDataFromLocalStorage();
          if (userData) {
            setUserData(userData);
          } else {
            // Fallback to basic data if no detailed data found
            setUserData({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Starting logout process from DashboardScreen...');
      
      // Clear user data from AsyncStorage using the helper
      await clearUserFromLocalStorage();
      
      // Sign out from Firebase
      await signOut(auth);
      console.log('User signed out from Firebase Auth');
      
      // The auth state listener in App.js will handle navigation automatically
      // No need to navigate here as the auth state change will trigger App.js to show the Auth stack
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Dashboard</Text>
      <Text style={styles.email}>Logged in as: {auth.currentUser?.email}</Text>
      
      {userData && (
        <View style={styles.userInfo}>
          <Text style={styles.infoText}>
            Account created: {new Date(userData.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.infoText}>
            Last login: {new Date(userData.lastLogin).toLocaleDateString()}
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 30,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen; 