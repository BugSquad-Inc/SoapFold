import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

// This function will load all the fonts
export const loadFonts = async () => {
  console.log('Loading font files...');
  try {
    const fontFiles = {
      'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
      'OpenSans-Bold': require('../assets/fonts/OpenSans-Bold.ttf'),
      'OpenSans-SemiBold': require('../assets/fonts/OpenSans-SemiBold.ttf'),
      'OpenSans-Light': require('../assets/fonts/OpenSans-Light.ttf'),
      'OpenSans-Medium': require('../assets/fonts/OpenSans-Medium.ttf'),
    };

    console.log('Font files to load:', Object.keys(fontFiles));
    await Font.loadAsync(fontFiles);
    console.log('All font files loaded successfully');
  } catch (error) {
    console.error('Error in loadFonts:', error);
    throw error; // Re-throw to be handled by useLoadFonts
  }
};

// Custom hook to use in components
export const useLoadFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadAppFonts = async () => {
      console.log('Starting font loading process...');
      try {
        console.log('Attempting to load fonts...');
        await loadFonts();
        console.log('Fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        console.log('Continuing without custom fonts...');
        // Continue even if fonts fail to load
        setFontsLoaded(true);
      }
    };

    loadAppFonts();
  }, []);

  return fontsLoaded;
}; 