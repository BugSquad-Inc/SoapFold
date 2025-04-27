// Theme configuration for the app
const lightTheme = {
  colors: {
    primary: '#000000',
    secondary: '#FF0000',
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    text: '#000000',
    lightText: '#666666',
    border: '#EEEEEE',
    error: '#FF0000',
    success: '#4CAF50',
    inputBg: '#FFFFFF',
    statusBar: '#222222',
    topSection: '#222222',
    tabBar: '#f8f8f8',
    icon: '#555555',
    switch: '#9C27B0',
    placeholder: '#888888',
    divider: '#F0F0F0',
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

const darkTheme = {
  colors: {
    primary: '#FFFFFF',
    secondary: '#FF0000',
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#FFFFFF',
    lightText: '#BBBBBB',
    border: '#333333',
    error: '#FF6B6B',
    success: '#4CAF50',
    inputBg: '#1E1E1E',
    statusBar: '#222222',
    topSection: '#222222',
    tabBar: '#1E1E1E',
    icon: '#BBBBBB',
    switch: '#9C27B0',
    placeholder: '#888888',
    divider: '#333333',
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
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 16,
      backgroundColor: '#1E1E1E',
      borderRadius: 25,
      borderWidth: 3,
      borderColor: '#333333',
    },
    button: {
      borderRadius: 6,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    }
  }
};

// Export both themes
export const themes = {
  light: lightTheme,
  dark: darkTheme
};

// Default theme
export const theme = lightTheme;

// Helper functions to easily apply typography styles with theme awareness
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
  }
};