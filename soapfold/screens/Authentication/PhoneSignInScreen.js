import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhoneInput from 'react-native-phone-number-input';
import auth from '@react-native-firebase/auth';
import { theme } from '../../utils/theme';

export default function PhoneSignInScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    try {
      setLoading(true);
      
      // Use React Native Firebase phone authentication
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      console.log('Verification code sent successfully');
      
      // Navigate to verification screen with confirmation object
      navigation.navigate('VerifyCode', { 
        phoneNumber: phoneNumber,
        confirmation: confirmation
      });
    } catch (error) {
      console.error('Error sending code:', error);
      let errorMessage = 'Failed to send verification code. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
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

          <Text style={styles.title}>Enter phone number</Text>
          <Text style={styles.subtitle}>
            We'll send you a verification code
          </Text>

          <View style={styles.inputContainer}>
            <PhoneInput
              defaultCode="IN"
              layout="first"
              onChangeFormattedText={text => setPhoneNumber(text)}
              withDarkTheme
              withShadow
              autoFocus
              containerStyle={styles.phoneInput}
              textContainerStyle={styles.phoneTextContainer}
              textInputStyle={styles.phoneTextInput}
              codeTextStyle={styles.phoneCodeText}
            />
          </View>

          <View id="recaptcha-container" style={styles.recaptchaContainer} />

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!phoneNumber || loading) && styles.continueButtonDisabled
            ]}
            onPress={handleSendCode}
            disabled={!phoneNumber || loading}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Sending...' : 'Continue'}
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
  inputContainer: {
    marginBottom: 32,
  },
  phoneInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  phoneTextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
  },
  phoneTextInput: {
    color: '#000',
    fontSize: 16,
  },
  phoneCodeText: {
    color: '#000',
    fontSize: 16,
  },
  recaptchaContainer: {
    display: 'none',
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
}); 