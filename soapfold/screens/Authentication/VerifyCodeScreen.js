import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ImageBackground, Alert, ScrollView, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { confirmPhoneCode, signInWithPhoneNumber } from '../../config/authService';
import { theme, getTextStyle } from '../../utils/theme';
import { LoadingContext } from '../../contexts/LoadingContext';
import { CommonActions } from '@react-navigation/native';

export default function VerifyCodeScreen({ route, navigation }) {
  const { phoneNumber, confirmation } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
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
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit verification code.');
      return;
    }

    try {
      console.log('[VerifyCodeScreen] Starting code verification...');
      setLoading(true);
      
      console.log('[VerifyCodeScreen] Calling confirmCode()...');
      const user = await confirmCode(verificationId, code);
      
      console.log('[VerifyCodeScreen] Code verification successful:', user.phoneNumber);
      console.log('[VerifyCodeScreen] User object:', JSON.stringify(user, null, 2));
      
      // Let the auth state change in App.js handle navigation automatically
      console.log('[VerifyCodeScreen] Code verification completed, auth state should trigger navigation');
      console.log('[VerifyCodeScreen] No manual navigation needed - App.js will handle it');
      
    } catch (error) {
      console.error('[VerifyCodeScreen] Code Verification Error:', error);
      console.error('[VerifyCodeScreen] Error details:', JSON.stringify(error, null, 2));
      let errorMessage = 'Failed to verify code. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      Alert.alert('Verification Error', errorMessage);
    } finally {
      console.log('[VerifyCodeScreen] Code verification process completed');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      
      // Send new verification code using React Native Firebase
      const newConfirmation = await signInWithPhoneNumber(phoneNumber);
      
      // Update confirmation in route params
      navigation.setParams({ confirmation: newConfirmation });
      
      Alert.alert('Success', 'Verification code resent!');
    } catch (error) {
      console.error('Error resending code:', error);
      let errorMessage = 'Failed to resend code. Please try again.';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait before requesting another code.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f8f8f8'}}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Enter code</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to your phone{'\n'}
            {phoneNumber}
          </Text>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputs.current[index] = ref}
                style={styles.codeInput}
                value={digit}
                onChangeText={text => handleCodeChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!code.every(digit => digit) || loading) && styles.continueButtonDisabled
            ]}
            onPress={handleVerifyCode}
            disabled={!code.every(digit => digit) || loading}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Verifying...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resendButton,
              resendLoading && styles.resendButtonDisabled
            ]}
            onPress={handleResendCode}
            disabled={resendLoading}
          >
            <Text style={styles.resendButtonText}>
              {resendLoading ? 'Resending...' : 'You didn\'t receive any code? Resend Code'}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
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
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#000',
    fontSize: 24,
    textAlign: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
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
    alignItems: 'center',
    padding: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
}); 