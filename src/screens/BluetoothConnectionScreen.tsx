import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import { BleManager, Device } from 'react-native-ble-plx';

type BluetoothConnectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BluetoothConnection'
>;

const manager = new BleManager();

export default function BluetoothConnectionScreen() {
  const navigation = useNavigation<BluetoothConnectionScreenNavigationProp>();
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      }
    }

    requestPermissions().then(() => {
      const devicesFound = new Map<string, Device>();

      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.log('Erro no scan:', error);
          return;
        }
        if (device && device.name && !devicesFound.has(device.id)) {
          devicesFound.set(device.id, device);
          setDevices(Array.from(devicesFound.values()));
        }
      });

      // Para o scan após 10 segundos para não ficar sempre ligado
      const timer = setTimeout(() => {
        manager.stopDeviceScan();
      }, 10000);

      // Cleanup ao desmontar a tela
      return () => {
        clearTimeout(timer);
        manager.stopDeviceScan();
      };
    });
  }, []);

  return (
    <FlatList
      data={devices}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.deviceButton}
          onPress={() => navigation.navigate('BluetoothConectado', { deviceId: item.id })}
        >
          <Text style={styles.deviceText}>{item.name}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>Procurando dispositivos...</Text>}
    />
  );
}

const styles = StyleSheet.create({
  deviceButton: {
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginVertical: 6,
  },
  deviceText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});
