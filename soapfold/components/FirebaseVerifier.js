import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { verifyFirebaseConfig } from '../utils/verifyFirebaseConfig';
import { auth, firestore, storage } from '../config/firebase';
import { theme } from '../utils/theme';

const FirebaseVerifier = () => {
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState('Verifying Firebase configuration...');

  useEffect(() => {
    const verifyConfig = async () => {
      try {
        const isConfigured = await verifyFirebaseConfig();
        if (isConfigured) {
          setStatus('Firebase is properly configured');
        } else {
          setStatus('Firebase configuration error');
        }
      } catch (error) {
        console.error('Error verifying Firebase:', error);
        setStatus('Error verifying Firebase configuration');
      } finally {
        setVerifying(false);
      }
    };

    verifyConfig();
  }, []);

  if (!verifying && status === 'Firebase is properly configured') {
    // If the verification is successful, we don't need to show anything
    return null;
  }

  return (
      <View style={styles.container}>
      {verifying ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{status}</Text>
        </View>
      ) : (
        <ScrollView style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Firebase Configuration Error</Text>
          <Text style={styles.errorMessage}>{status}</Text>
          <Text style={styles.errorInstructions}>
            Please check your Firebase configuration and make sure all required services are properly initialized.
            </Text>
        </ScrollView>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text
  },
  errorContainer: {
    flex: 1,
    padding: 20
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 20
  },
  errorInstructions: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20
  }
});

export default FirebaseVerifier; 