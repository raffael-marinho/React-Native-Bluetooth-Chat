// src/navigation/StackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ChatScreen from '../screens/ChatScreen';
import BluetoothOnScreen from '../screens/BluetoothOnScreen';
import BluetoothOffScreen from '../screens/BluetoothOffScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Chat: undefined;
  BluetoothOff: { username: string };
  BluetoothOn: { username: string; connectedUser: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="BluetoothOff" component={BluetoothOffScreen} />
      <Stack.Screen name="BluetoothOn" component={BluetoothOnScreen} />
    </Stack.Navigator>
  );
}
