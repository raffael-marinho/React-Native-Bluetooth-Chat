import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';

import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';

type BluetoothConectadoScreenRouteProp = RouteProp<RootStackParamList, 'BluetoothConectado'>;
type BluetoothConectadoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BluetoothConectado'>;

export default function BluetoothConectadoScreen() {
  const route = useRoute<BluetoothConectadoScreenRouteProp>();
  const navigation = useNavigation<BluetoothConectadoScreenNavigationProp>();
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [connecting, setConnecting] = useState(true);
  const { deviceId } = route.params;

  useEffect(() => {
    async function connectDevice() {
      try {
        const devices = await RNBluetoothClassic.getBondedDevices();
        const foundDevice = devices.find(d => d.id === deviceId);
        if (!foundDevice) throw new Error('Dispositivo não encontrado');
        setDevice(foundDevice);

        const connected = await foundDevice.connect();
        if (!connected) throw new Error('Falha ao conectar');

        setConnecting(false);
      } catch (error) {
        console.log('Erro ao conectar:', error);
        setConnecting(false);
      }
    }

    connectDevice();

    return () => {
      async function cleanup() {
        if (device) {
          const connected = await device.isConnected();
          if (connected) {
            await device.disconnect();
          }
        }
      }
      cleanup();
    };
  }, [deviceId]);

  if (connecting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Conectando ao dispositivo...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Falha ao conectar ao dispositivo.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Conectado ao dispositivo:</Text>
      <Text style={{ fontWeight: 'bold', marginVertical: 10 }}>{device.name || device.id}</Text>
      <Button title="Ir para Chat" onPress={() => navigation.navigate('Chat')} />
    </View>
  );
}
