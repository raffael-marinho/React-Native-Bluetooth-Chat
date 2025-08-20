import React, { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RNBluetoothClassic from "react-native-bluetooth-classic";

import BluetoothDisabledScreen from "../screens/BluetoothDisabledScreen";
import BluetoothConnectionScreen from "../screens/BluetoothConnectionScreen";
import BluetoothConnectedScreen from "../screens/BluetoothConnectedScreen";
import ChatScreen from "../screens/ChatScreen";
import SplashScreen from "../screens/SplashScreen";

import type { BTDevice } from "../services/bluetooth";

export type RootStackParamList = {
  Splash: undefined;
  BluetoothDisabled: undefined;
  BluetoothConnection: undefined;
  BluetoothConnected: { device: BTDevice };
  Chat: { device: BTDevice };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const [bluetoothStatus, setBluetoothStatus] = useState<'checking' | 'off' | 'ready'>('checking');

  useEffect(() => {
    async function checkBluetooth() {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      }
      try {
        const enabled = await RNBluetoothClassic.isBluetoothEnabled();
        setBluetoothStatus(enabled ? 'ready' : 'off');
      } catch {
        setBluetoothStatus('off');
      }
    }
    checkBluetooth();
  }, []);

  if (bluetoothStatus === 'checking') {
  return <SplashScreen />; // Splash só exibe enquanto checa Bluetooth
  } 

  return (
    <Stack.Navigator
      initialRouteName={bluetoothStatus === 'off' ? 'BluetoothDisabled' : 'BluetoothConnection'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="BluetoothDisabled" component={BluetoothDisabledScreen} />
      <Stack.Screen name="BluetoothConnection" component={BluetoothConnectionScreen} />
      <Stack.Screen name="BluetoothConnected" component={BluetoothConnectedScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
