import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyFirebaseInitialized } from '../config/firebase';

const FirebaseDiagnostic = ({ onDismiss }) => {
  const [status, setStatus] = useState({
    app: false,
    auth: false,
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
        app: firebaseStatus.app,
        auth: firebaseStatus.auth,
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
  
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Firebase Status:</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.item}>App initialized: {status.app ? '✓' : '✗'}</Text>
          <Text style={styles.item}>Auth initialized: {status.auth ? '✓' : '✗'}</Text>
          <Text style={styles.item}>Storage initialized: {status.storage ? '✓' : '✗'}</Text>
        </View>
        
        <Text style={styles.title}>AsyncStorage:</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.item}>User data exists: {status.asyncStorage ? '✓' : '✗'}</Text>
        </View>
        
        {status.userData && (
          <>
            <Text style={styles.title}>User Data:</Text>
            <ScrollView style={styles.dataContainer}>
              <Text style={styles.data}>{JSON.stringify(status.userData, null, 2)}</Text>
            </ScrollView>
          </>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={checkFirebaseStatus}>
            <Text style={styles.buttonText}>Refresh Status</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={checkAsyncStorage}>
            <Text style={styles.buttonText}>Check AsyncStorage</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearUserData}>
            <Text style={styles.buttonText}>Clear User Data</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  item: {
    fontSize: 16,
    marginBottom: 8,
  },
  dataContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    maxHeight: 200,
  },
  data: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#243D6E',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    flex: 1,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#243D6E',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FirebaseDiagnostic; 