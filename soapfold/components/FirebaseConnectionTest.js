import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { testFirebaseConnection } from '../utils/testFirebaseConnection';
import { auth, firestore, storage } from '../config/firebase';
import { verifyFirebaseInitialized } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FirebaseConnectionTest = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(true);
  const [status, setStatus] = useState('Testing Firebase connection...');
  
  // Add logging helper
  const log = (message) => {
    setLogs(prevLogs => [...prevLogs, message]);
  };
  
  // Run tests on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await testFirebaseConnection();
        if (isConnected) {
          setStatus('Firebase connection successful');
        } else {
          setStatus('Firebase connection failed');
        }
      } catch (error) {
        console.error('Error testing Firebase connection:', error);
        setStatus('Error testing Firebase connection');
      } finally {
        setTesting(false);
      }
    };

    testConnection();
  }, []);
  
  const runTests = async () => {
    setLogs([]);
    log("Starting Firebase connection tests...");
    
    // Test 1: Check Firebase initialization
    log("\n1. Testing Firebase initialization...");
    const status = verifyFirebaseInitialized();
    
    if (status.auth) {
      log("✅ Firebase Auth is initialized");
    } else {
      log("❌ Firebase Auth is not initialized");
    }
    
    if (status.firestore) {
      log("✅ Firestore is initialized");
    } else {
      log("❌ Firestore is not initialized");
    }
    
    if (status.storage) {
      log("✅ Firebase Storage is initialized");
    } else {
      log("❌ Firebase Storage is not initialized");
    }
    
    // Test 2: Test Auth
    log("\n2. Testing Auth...");
    try {
      const currentUser = auth().currentUser;
      log(currentUser ? `✅ User is signed in: ${currentUser.email}` : "✅ No user is signed in");
    } catch (error) {
      log(`❌ Auth error: ${error.message}`);
    }
    
    // Test 3: Test AsyncStorage
    log("\n3. Testing AsyncStorage...");
    try {
      await AsyncStorage.setItem('@test', 'test');
      const value = await AsyncStorage.getItem('@test');
      await AsyncStorage.removeItem('@test');
      log(value === 'test' ? "✅ AsyncStorage is working" : "❌ AsyncStorage test failed");
    } catch (error) {
      log(`❌ AsyncStorage error: ${error.message}`);
    }
    
    // Test 4: Test Firestore
    log("\n4. Testing Firestore...");
    try {
      const testDoc = await firestore()
        .collection('_test')
        .doc('connection_test')
        .set({
          timestamp: firestore.FieldValue.serverTimestamp(),
          test: true
        });
      log("✅ Firestore write successful");
      
      // Clean up test document
      await firestore()
        .collection('_test')
        .doc('connection_test')
        .delete();
      log("✅ Firestore cleanup successful");
    } catch (error) {
      log(`❌ Firestore error: ${error.message}`);
    }
    
    // Test 5: Test Storage
    log("\n5. Testing Storage...");
    try {
      const testRef = storage().ref('_test/connection_test.txt');
      await testRef.putString('test');
      log("✅ Storage write successful");
      
      // Clean up test file
      await testRef.delete();
      log("✅ Storage cleanup successful");
    } catch (error) {
      log(`❌ Storage error: ${error.message}`);
    }
    
    setLoading(false);
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>{status}</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test Results</Text>
      {logs.map((log, index) => (
        <Text key={index} style={styles.logText}>{log}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16
  },
  logText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  }
});

export default FirebaseConnectionTest; 