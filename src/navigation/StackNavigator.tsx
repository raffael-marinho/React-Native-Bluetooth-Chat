import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BluetoothDesativadoScreen from '../screens/BluetoothDesativadoScreen';
import BluetoothConnectionScreen from '../screens/BluetoothConnectionScreen';
import BluetoothConectadoScreen from '../screens/BluetoothConectadoScreen';
import ChatScreen from '../screens/ChatScreen';
import SplashScreen from '../screens/SplashScreen'; // importe sua splash screen

export type RootStackParamList = {
  BluetoothDesativado: undefined;
  BluetoothConnection: undefined;
  BluetoothConectado: undefined;
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const [bluetoothStatus, setBluetoothStatus] = useState<'checking' | 'off' | 'connecting' | 'connected'>('checking');

  useEffect(() => {
    // Simula a verificação do status Bluetooth (troque pelo seu código real)
    setTimeout(() => {
      // Aqui você pega o status real do Bluetooth
      const status: 'off' | 'connecting' | 'connected' = 'off'; // exemplo fixo, troque para sua lógica real
      setBluetoothStatus(status);
    }, 2000);
  }, []);

  if (bluetoothStatus === 'checking') {
    return <SplashScreen />;
  }

  // Define a rota inicial de acordo com o status do Bluetooth
  let initialRouteName: keyof RootStackParamList = 'BluetoothConnection';
  if (bluetoothStatus === 'off') {
    initialRouteName = 'BluetoothDesativado';
  } else if (bluetoothStatus === 'connecting') {
    initialRouteName = 'BluetoothConnection';
  } else if (bluetoothStatus === 'connected') {
    initialRouteName = 'BluetoothConectado';
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="BluetoothDesativado" component={BluetoothDesativadoScreen} />
      <Stack.Screen name="BluetoothConnection" component={BluetoothConnectionScreen} />
      <Stack.Screen name="BluetoothConectado" component={BluetoothConectadoScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
