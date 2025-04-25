import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

/**
 * A component to display when there are no orders to show
 * @param {Object} props Component props
 * @param {Function} props.onBrowseServices Function to call when browse services button is pressed
 * @returns {React.ReactNode} The component
 */
const EmptyOrdersPlaceholder = ({ onBrowseServices }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="inbox" size={80} color="#ddd" />
      </View>
      
      <Text style={styles.title}>No Orders Yet</Text>
      
      <Text style={styles.message}>
        You haven't placed any orders yet. Start by browsing our laundry services.
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={onBrowseServices}
      >
        <Text style={styles.buttonText}>Browse Services</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 50,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EmptyOrdersPlaceholder; 