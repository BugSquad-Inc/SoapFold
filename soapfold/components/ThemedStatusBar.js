import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

/**
 * ThemedStatusBar - A component to handle StatusBar with theme preferences
 * 
 * @param {Object} props - Additional props to pass to StatusBar
 * @returns {React.Component} - A themed StatusBar component
 */
const ThemedStatusBar = (props) => {
  const { isDarkMode, theme } = useTheme();
  
  // StatusBar styles based on theme
  const barStyle = 'light-content'; // Always use light content for dark status bar
  
  // On Android we need to set backgroundColor, iOS gets it from the SafeAreaView
  const backgroundColor = Platform.OS === 'android' 
    ? '#222222' // Use #222222 for the status bar color
    : undefined;
  
  return (
    <StatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      {...props}
    />
  );
};

export default ThemedStatusBar; 
 