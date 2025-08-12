import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

import BluetoothDesativadoScreen from '../screens/BluetoothDesativadoScreen';
import BluetoothConnectionScreen from '../screens/BluetoothConnectionScreen';
import BluetoothConectadoScreen from '../screens/BluetoothConectadoScreen';
import ChatScreen from '../screens/ChatScreen';
import SplashScreen from '../screens/SplashScreen';

export type RootStackParamList = {
  Splash: undefined;
  BluetoothDesativado: undefined;
  BluetoothConnection: undefined;
  BluetoothConectado: { deviceId: string };
  Chat: undefined;
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
      } catch (error) {
        console.error('Erro ao checar Bluetooth:', error);
        setBluetoothStatus('off');
      }
    }

    checkBluetooth();
  }, []);

  if (bluetoothStatus === 'checking') {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={bluetoothStatus === 'off' ? 'BluetoothDesativado' : 'BluetoothConnection'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="BluetoothDesativado" component={BluetoothDesativadoScreen} />
      <Stack.Screen name="BluetoothConnection" component={BluetoothConnectionScreen} />
      <Stack.Screen name="BluetoothConectado" component={BluetoothConectadoScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
