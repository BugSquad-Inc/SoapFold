import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhoneInput from 'react-native-phone-number-input';
import { auth } from '../../config/firebase';
import { PhoneAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { theme } from '../../utils/theme';

export default function PhoneSignInScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const recaptchaVerifier = useRef(null);

  const handleSendCode = async () => {
    try {
      setLoading(true);
      
      // Create a phone provider instance
      const phoneProvider = new PhoneAuthProvider(auth);
      
      // Create reCAPTCHA verifier
      if (!recaptchaVerifier.current) {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber
          }
        });
      }
      
      // Send verification code
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      
      navigation.navigate('VerifyCode', { 
        phoneNumber: phoneNumber,
        verificationId: verificationId
      });
    } catch (error) {
      console.error('Error sending code:', error);
      alert(error.message);
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