import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import auth from '@react-native-firebase/auth';
import { createUserInFirestore } from '../../config/firestore';

export default function VerifyCodeScreen({ route, navigation }) {
  const { phoneNumber, confirmation } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmation.confirm(verificationCode);
      const user = result.user;
      
      console.log('[VerifyCodeScreen] Code verification successful:', user.phoneNumber);
      
      // Create or update user in Firestore
      await createUserInFirestore(user.uid, {
        phoneNumber: user.phoneNumber,
        lastLogin: new Date().toISOString(),
        authProvider: 'phone'
      });

      // Navigate to main screen after successful verification
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('[VerifyCodeScreen] Code Verification Error:', error);
      let errorMessage = 'Invalid code. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'The code is incorrect.';
      } else if (error.code === 'auth/session-expired') {
        errorMessage = 'The code has expired. Request a new one.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      
      // Send new verification code
      const newConfirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      // Update confirmation in route params
      navigation.setParams({ confirmation: newConfirmation });
      
      setResendDisabled(true);
      setCountdown(60);
      
      Alert.alert('Success', 'Verification code resent!');
    } catch (error) {
      console.error('Error resending code:', error);
      let errorMessage = 'Failed to resend code. Please try again.';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait before requesting another code.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          Sent to {phoneNumber}
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.codeInput}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            loading && styles.continueButtonDisabled
          ]}
          onPress={handleVerifyCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Verify Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.resendButton,
            (resendDisabled || resendLoading) && styles.resendButtonDisabled
          ]}
          onPress={handleResendCode}
          disabled={resendDisabled || resendLoading}
        >
          {resendLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={styles.resendButtonText}>
              {resendDisabled ? `Resend code in ${countdown}s` : 'Resend code'}
            </Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  safeArea: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeInput: {
    width: 45,
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    height: 52,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 