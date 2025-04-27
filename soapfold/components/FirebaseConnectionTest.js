import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { auth, storage, verifyFirebaseInitialized } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FirebaseConnectionTest = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add logging helper
  const log = (message) => {
    setLogs(prevLogs => [...prevLogs, message]);
  };
  
  // Run tests on mount
  useEffect(() => {
    runTests();
  }, []);
  
  const runTests = async () => {
    setLogs([]);
    log("Starting Firebase connection tests...");
    
    // Test 1: Check Firebase initialization
    log("\n1. Testing Firebase initialization...");
    const status = verifyFirebaseInitialized();
    
    if (status.app) {
      log("✅ Firebase app is initialized");
    } else {
      log("❌ Firebase app is not initialized");
    }
    
    if (status.auth) {
      log("✅ Firebase Auth is initialized");
    } else {
      log("❌ Firebase Auth is not initialized");
    }
    
    if (status.storage) {
      log("✅ Firebase Storage is initialized");
      log(`Storage type: ${typeof storage}`);
    } else {
      log("❌ Firebase Storage is not initialized");
    }
    
    // Test 3: Test AsyncStorage
    log("\n3. Testing AsyncStorage...");
    try {
      // Generate test data
      const testUser = {
        id: 'test-' + Date.now(),
        name: 'Test User',
        timestamp: new Date().toISOString()
      };
      
      // Try to save to AsyncStorage
      log("Saving test user to AsyncStorage...");
      await AsyncStorage.setItem('@testUser', JSON.stringify(testUser));
      log("✅ Successfully saved user to AsyncStorage");
      
      log("Retrieving user from AsyncStorage...");
      const savedUser = await AsyncStorage.getItem('@testUser');
      
      if (savedUser) {
        log(`✅ Successfully retrieved user: ${savedUser}`);
        // Clean up after the test
        await AsyncStorage.removeItem('@testUser');
        log("✅ Cleaned up test data from AsyncStorage");
      } else {
        log("❌ Could not retrieve user from AsyncStorage");
      }
    } catch (storageError) {
      log(`❌ AsyncStorage error: ${storageError.message}`);
    }
    
    // Test 4: Check auth state
    log("\n4. Testing Auth state...");
    if (auth) {
      const user = auth.currentUser;
      if (user) {
        log(`✅ User is signed in: ${user.email}`);
        log(`User ID: ${user.uid}`);
        log(`Email verified: ${user.emailVerified}`);
      } else {
        log("ℹ️ No user is currently signed in");
      }
    } else {
      log("❌ Auth is not initialized, cannot check user state");
    }

    log("\nTests completed!");
    setLoading(false);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      
      {loading && (
        <ActivityIndicator size="small" color="#0000ff" style={styles.loader} />
      )}
      
      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#eee',
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 12,
  },
  logContainer: {
    maxHeight: 300,
    backgroundColor: '#222',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  logText: {
    color: '#00ff00',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default FirebaseConnectionTest; 