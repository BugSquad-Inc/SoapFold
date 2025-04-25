import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * A container component that adds proper bottom padding to handle the navbar space
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.style - Additional style for the container
 * @param {boolean} props.hasTabBar - Whether the screen has a tab bar at the bottom
 * @param {string} props.backgroundColor - Background color of the screen
 * @returns {React.ReactNode} - The wrapped component with proper padding
 */
const ScreenContainer = ({ 
  children, 
  style, 
  hasTabBar = true, 
  backgroundColor = '#f8f8f8',
  useSafeArea = true
}) => {
  if (useSafeArea) {
    return (
      <SafeAreaView 
        style={[
          styles.safeAreaContainer, 
          { backgroundColor }, 
          style
        ]}
        edges={['top', 'left', 'right']} // Exclude bottom edge which is handled manually
      >
        <View 
          style={[
            styles.innerContainer, 
            hasTabBar && styles.withTabBar, 
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <View 
        style={[
          styles.innerContainer, 
          hasTabBar && styles.withTabBar
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  withTabBar: {
    paddingBottom: 60, // Match the height of the tab bar to prevent content from being hidden
  }
});

export default ScreenContainer; 