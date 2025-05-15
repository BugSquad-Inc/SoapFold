import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CardStyleInterpolators } from '@react-navigation/stack';

// Import order-related screens
import RecentOrdersScreen from '../screens/Order/RecentOrdersScreen';
import OrderDetailScreen from '../screens/Order/OrderDetailScreen';
import PaymentSuccessScreen from '../screens/Payment/PaymentSuccessScreen';

const Stack = createStackNavigator();

const OrdersNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
        },
        cardStyle: { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
      }}
      initialRouteName="RecentOrders"
    >
      <Stack.Screen 
        name="RecentOrders" 
        component={RecentOrdersScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen} 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="PaymentSuccess" 
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default OrdersNavigator;
