import React, { createContext, useContext, useState, useEffect } from 'react';
import { theme as defaultTheme } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dark theme colors
const darkTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '#FFFFFF',
    secondary: '#FF0000',
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#FFFFFF',
    lightText: '#AAAAAA',
    border: '#333333',
    error: '#FF3B30',
    success: '#4CAF50',
    inputBg: '#2A2A2A',
    statusBar: '#000000',
    topSection: '#000000',
    tabBar: '#121212',
    icon: '#CCCCCC',
    switch: '#9C27B0',
    placeholder: '#888888',
    divider: '#333333',
  },
};

// Create Theme Context
const ThemeContext = createContext({
  theme: defaultTheme,
  isDarkMode: false,
  toggleDarkMode: () => {},
});

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);

  // Load saved theme preference from AsyncStorage
  // Note: Using AsyncStorage for theme preferences is intentional as it's app-level configuration
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_preference');
        if (savedTheme !== null) {
          const isDark = savedTheme === 'dark';
          setIsDarkMode(isDark);
          setTheme(isDark ? darkTheme : defaultTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Toggle dark mode and save preference to AsyncStorage
  const toggleDarkMode = async () => {
    try {
      const newIsDarkMode = !isDarkMode;
      setIsDarkMode(newIsDarkMode);
      setTheme(newIsDarkMode ? darkTheme : defaultTheme);
      await AsyncStorage.setItem('@theme_preference', newIsDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 
 