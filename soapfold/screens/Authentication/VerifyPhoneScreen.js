import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import { auth } from '../../config/firebase';
import { PhoneAuthProvider, signInWithCredential } from '@react-native-firebase/auth';

const VerifyPhoneScreen = ({ route, navigation }) => {
  // ... rest of the component code ...
} 