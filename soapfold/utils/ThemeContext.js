import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, theme as defaultTheme } from './theme';

// Create Theme Context
const ThemeContext = createContext({
  isDarkMode: false,
  theme: defaultTheme,
  toggleTheme: () => {},
  setDarkMode: () => {}
});

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);

  // Load theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const darkModeValue = await AsyncStorage.getItem('@darkMode');
        const isDark = darkModeValue === 'true';
        
        if (isDark) {
          setIsDarkMode(true);
          setTheme(themes.dark);
        } else {
          setIsDarkMode(false);
          setTheme(themes.light);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      setTheme(newMode ? themes.dark : themes.light);
      await AsyncStorage.setItem('@darkMode', newMode ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Set specific theme mode
  const setDarkMode = async (value) => {
    try {
      setIsDarkMode(value);
      setTheme(value ? themes.dark : themes.light);
      await AsyncStorage.setItem('@darkMode', value ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 
 