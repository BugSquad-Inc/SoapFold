import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuBar = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('@userData');
      await AsyncStorage.removeItem('@user');
      
      // Navigate to Onboarding screen
      navigation.navigate('Onboarding');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logoutButton: {
    padding: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
  },
  logoutText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MenuBar;
