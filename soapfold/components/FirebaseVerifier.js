import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import verifyFirebaseApiKey from '../utils/verifyFirebaseConfig';
import { getAuth } from 'firebase/auth';

const API_KEY = "AIzaSyA25WB_mlRL8tPj-_WD2-ieNkF7NSHRnuI".trim();

const FirebaseVerifier = () => {
  const [verificationStatus, setVerificationStatus] = useState({ 
    isChecking: true, 
    isValid: false, 
    message: 'Checking Firebase configuration...' 
  });

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // First, check if auth is already initialized
        try {
          const auth = getAuth();
          console.log("Firebase auth is already initialized:", !!auth);
        } catch (authError) {
          console.log("Firebase auth is not initialized yet");
        }
        
        const result = await verifyFirebaseApiKey(API_KEY);
        setVerificationStatus({ 
          isChecking: false, 
          isValid: result.isValid, 
          message: result.message 
        });
      } catch (error) {
        setVerificationStatus({ 
          isChecking: false, 
          isValid: false, 
          message: `Error during verification: ${error.message}` 
        });
      }
    };

    checkApiKey();
  }, []);

  if (!verificationStatus.isChecking && verificationStatus.isValid) {
    // If the verification is successful, we don't need to show anything
    return null;
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Firebase Configuration Status</Text>
        
        {verificationStatus.isChecking ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Text style={[
              styles.status, 
              { color: verificationStatus.isValid ? 'green' : 'red' }
            ]}>
              {verificationStatus.isValid ? 'Valid' : 'Invalid'}
            </Text>
            <Text style={styles.message}>{verificationStatus.message}</Text>
            
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Configuration Details:</Text>
              <Text style={styles.detailsText}>API Key: {API_KEY}</Text>
              <Text style={styles.detailsText}>Length: {API_KEY.length} characters</Text>
              <Text style={styles.detailsText}>
                Firebase Project: soapfold.firebaseapp.com
              </Text>
              
              <Text style={styles.troubleshooting}>
                Troubleshooting Tips:
              </Text>
              <Text style={styles.troubleshootingText}>
                1. Verify the API key is correct
              </Text>
              <Text style={styles.troubleshootingText}>
                2. Enable Email/Password authentication in Firebase console
              </Text>
              <Text style={styles.troubleshootingText}>
                3. Ensure your Firebase project is properly set up
              </Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 6,
    width: '100%',
  },
  detailsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  troubleshooting: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  troubleshootingText: {
    fontSize: 12,
    marginBottom: 4,
  }
});

export default FirebaseVerifier; 