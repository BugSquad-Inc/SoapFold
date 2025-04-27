import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';

/**
 * Hook to create themed styles for a component
 * @param {Function} styleCreator - Function that takes theme as argument and returns styles object
 * @returns {Object} - StyleSheet object with theme-aware styles
 */
export const useThemedStyles = (styleCreator) => {
  const { theme } = useTheme();
  
  // Create a StyleSheet with the theme
  return StyleSheet.create(styleCreator(theme));
};

/**
 * Get text styles with appropriate color for the current theme
 * @param {string} type - Font weight type (regular, medium, semiBold, bold)
 * @param {string} size - Font size key (xs, sm, md, lg, xl, xxl, xxxl)
 * @param {string} colorKey - Optional color key from theme (text, lightText, etc.). Defaults to text.
 * @returns {Object} - Text style object
 */
export const useThemedTextStyle = (type = 'regular', size = 'md', colorKey = 'text') => {
  const { theme } = useTheme();
  
  return {
    fontFamily: theme.typography.fontFamily[type],
    fontSize: theme.typography.fontSize[size],
    color: theme.colors[colorKey] || theme.colors.text,
  };
};

/**
 * Common themed styles that can be used across components
 */
export const useCommonThemedStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...theme.common.shadow,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      backgroundColor: theme.colors.inputBg,
      color: theme.colors.text,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: theme.typography.fontSize.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.primary === '#FFFFFF' ? '#000000' : '#FFFFFF', // Contrast with button color
    },
    icon: {
      color: theme.colors.icon,
    }
  });
}; 
 