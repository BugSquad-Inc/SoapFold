// Theme configuration for the app
export const theme = {
  colors: {
    primary: '#000000',
    secondary: '#FF0000',
    background: '#FFFFFF',
    text: '#000000',
    lightText: '#666666',
    border: '#EEEEEE',
    error: '#FF0000',
    success: '#4CAF50',
    inputBg: '#FFFFFF',
  },
  
  // Font styles using Open Sans
  typography: {
    fontFamily: {
      regular: 'OpenSans-Regular',
      medium: 'OpenSans-Medium',
      semiBold: 'OpenSans-SemiBold',
      bold: 'OpenSans-Bold',
      light: 'OpenSans-Light',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
    },
  },
  
  // Common style snippets
  common: {
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 25,
      borderWidth: 3,
      borderColor: '#EEEEEE',
    },
    button: {
      borderRadius: 6,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    }
  }
};

// Helper functions to easily apply typography styles
export const getTextStyle = (type = 'regular', size = 'md', color = theme.colors.text) => {
  return {
    fontFamily: theme.typography.fontFamily[type],
    fontSize: theme.typography.fontSize[size],
    color: color,
  };
};

// Export common components styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}; 