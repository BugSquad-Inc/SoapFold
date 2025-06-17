import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore, storage } from '../config/firebase';
import { verifyFirebaseInitialized } from '../config/firebase';
import { testFirebaseConnection } from '../utils/testFirebaseConnection';

const FirebaseDiagnostic = ({ onDismiss }) => {
  const [status, setStatus] = useState({
    auth: false,
    firestore: false,
    storage: false,
    asyncStorage: false,
    userData: null
  });
  
  useEffect(() => {
    checkFirebaseStatus();
    checkAsyncStorage();
  }, []);
  
  const checkFirebaseStatus = () => {
    try {
      const firebaseStatus = verifyFirebaseInitialized();
      setStatus(prevStatus => ({
        ...prevStatus,
        auth: firebaseStatus.auth,
        firestore: firebaseStatus.firestore,
        storage: firebaseStatus.storage
      }));
    } catch (error) {
      console.error('Firebase status check error:', error);
    }
  };
  
  const checkAsyncStorage = async () => {
    try {
      // Check if user data exists in AsyncStorage
      const userData = await AsyncStorage.getItem('@userData');
      setStatus(prevStatus => ({
        ...prevStatus,
        asyncStorage: !!userData,
        userData: userData ? JSON.parse(userData) : null
      }));
    } catch (error) {
      console.error('AsyncStorage error:', error);
    }
  };
  
  const clearUserData = async () => {
    try {
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('@userData');
      // Update status
      checkAsyncStorage();
      alert('User data cleared from AsyncStorage');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const getStatusColor = (isActive) => isActive ? '#4CAF50' : '#F44336';
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Diagnostic</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Auth:</Text>
          <Text style={[styles.status, { color: getStatusColor(status.auth) }]}>
            {status.auth ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Firestore:</Text>
          <Text style={[styles.status, { color: getStatusColor(status.firestore) }]}>
            {status.firestore ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Storage:</Text>
          <Text style={[styles.status, { color: getStatusColor(status.storage) }]}>
            {status.storage ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>AsyncStorage:</Text>
          <Text style={[styles.status, { color: getStatusColor(status.asyncStorage) }]}>
            {status.asyncStorage ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {status.userData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Data</Text>
          <Text style={styles.userData}>
            {JSON.stringify(status.userData, null, 2)}
          </Text>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearUserData}
          >
            <Text style={styles.clearButtonText}>Clear User Data</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.dismissButton}
        onPress={onDismiss}
      >
        <Text style={styles.dismissButtonText}>Dismiss</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 16
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  userData: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12
  },
  clearButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  dismissButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default FirebaseDiagnostic; 