import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const EmailLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const errors = React.useMemo(() => ({
    email: touched.email && (!email || !isValidEmail(email)) ? 'Valid email is required' : '',
    password: touched.password && !password ? 'Password is required' : '',
  }), [email, password, touched]);

  const isValid = React.useMemo(() => {
    return isValidEmail(email) && password.length > 0 && !errors.email && !errors.password;
  }, [email, password, errors]);

  const handleLogin = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Let the App.js auth state listener handle the navigation
    } catch (error) {
      Alert.alert('Login Error', error.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Pressable 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>

          <View style={styles.content}>
            <View>
              <Text style={styles.title}>Continue with email</Text>
              <Text style={styles.subtitle}>Sign in to manage your laundry services</Text>

              <View style={styles.form}>
                <View>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={[styles.inputContainer, errors.email && touched.email && styles.inputError]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email address"
                      placeholderTextColor="#666"
                      value={email}
                      onChangeText={setEmail}
                      onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[styles.inputContainer, errors.password && touched.password && styles.inputError]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#666"
                      value={password}
                      onChangeText={setPassword}
                      onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                      secureTextEntry
                    />
                  </View>
                  {errors.password && touched.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.continueButton,
                !isValid && styles.continueButtonDisabled
              ]}
              disabled={!isValid || loading}
              onPress={handleLogin}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={[
                  styles.continueButtonText,
                  !isValid && styles.continueButtonTextDisabled
                ]}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#111',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#333',
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#666',
  },
});

export default EmailLoginScreen; 