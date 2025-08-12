import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import { BleManager, Device } from 'react-native-ble-plx';

type BluetoothConectadoScreenRouteProp = RouteProp<RootStackParamList, 'BluetoothConectado'>;
type BluetoothConectadoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BluetoothConectado'>;

const manager = new BleManager();

export default function BluetoothConectadoScreen() {
  const route = useRoute<BluetoothConectadoScreenRouteProp>();
  const navigation = useNavigation<BluetoothConectadoScreenNavigationProp>();
  const [device, setDevice] = useState<Device | null>(null);
  const [connecting, setConnecting] = useState(true);
  const { deviceId } = route.params;

  useEffect(() => {
    let connectedDevice: Device | null = null;

    const connectDevice = async () => {
      try {
        connectedDevice = await manager.connectToDevice(deviceId);
        await connectedDevice.discoverAllServicesAndCharacteristics();
        setDevice(connectedDevice);
        setConnecting(false);
      } catch (error) {
        console.log('Erro ao conectar:', error);
        setConnecting(false);
      }
    };

    connectDevice();

    return () => {
      // Desconectar se estiver conectado quando o componente desmontar
      if (connectedDevice) {
        connectedDevice.cancelConnection().catch(e => {
          console.log('Erro ao cancelar conexão:', e);
        });
      }
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
      <Text style={{ fontWeight: 'bold', marginVertical: 10 }}>{device.name ?? device.id}</Text>

      <Button title="Ir para Chat" onPress={() => navigation.navigate('Chat')} />
    </View>
  );
}
