import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

// This function will load all the fonts
export const loadFonts = async () => {
  await Font.loadAsync({
    'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-Bold': require('../assets/fonts/OpenSans-Bold.ttf'),
    'OpenSans-SemiBold': require('../assets/fonts/OpenSans-SemiBold.ttf'),
    'OpenSans-Light': require('../assets/fonts/OpenSans-Light.ttf'),
    'OpenSans-Medium': require('../assets/fonts/OpenSans-Medium.ttf'),
  });
};

// Custom hook to use in components
export const useLoadFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadAppFonts = async () => {
      try {
        await loadFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Continue even if fonts fail to load
        setFontsLoaded(true);
      }
    };

    loadAppFonts();
  }, []);

  return fontsLoaded;
}; 