import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';

const AppStack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(false);

  console.log('[AppNavigator] Rendering AppNavigator');

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#f8f8f8' },
        animationEnabled: true,
        gestureEnabled: false,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
      }}
    >
      <AppStack.Screen 
        name="Main" 
        component={BottomTabNavigator}
        options={{ 
          animation: 'fade', 
          headerShown: false,
          gestureEnabled: false,
          tabBarStyle: { display: isLoading ? 'none' : 'flex' }
        }}
      />
    </AppStack.Navigator>
  );
};

export default AppNavigator; 