import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';

export default function VerifyCodeScreen({ route, navigation }) {
  const { phoneNumber, verificationId } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
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
    try {
      setLoading(true);
      const verificationCode = code.join('');
      
      // Create credential
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      
      // Sign in with credential
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Error verifying code:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // Create a phone provider instance
      const phoneProvider = new PhoneAuthProvider(auth);
      
      // Send new verification code
      const newVerificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        auth
      );
      
      // Update verification ID in route params
      navigation.setParams({ verificationId: newVerificationId });
      
      alert('Verification code resent!');
    } catch (error) {
      console.error('Error resending code:', error);
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
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
          style={styles.resendButton}
          onPress={handleResendCode}
        >
          <Text style={styles.resendButtonText}>
            You didn't receive any code? Resend Code
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#1c1c1e',
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  continueButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    padding: 16,
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
}); 