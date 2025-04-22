import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MenuBar = ({ onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 20,
    // Add any additional styling here
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#fff',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#f00',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default MenuBar;
