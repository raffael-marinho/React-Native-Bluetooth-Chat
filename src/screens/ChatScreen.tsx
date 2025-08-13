import React, { useState, useEffect } from 'react';
import { View, Text, Button, PermissionsAndroid, Alert, Platform, FlatList } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';

export default function ChatScreen() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(false);

  // Pede permissões no Android
  async function requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert('Permissão necessária', 'Ative todas as permissões para usar o Bluetooth.');
          return false;
        }
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    return true; // iOS já pergunta automaticamente
  }

  // Lista dispositivos pareados
  async function loadPairedDevices() {
    setLoading(true);
    try {
      const paired = await RNBluetoothClassic.getBondedDevices();
      setDevices(paired);
    } catch (err) {
      console.error('Erro ao listar dispositivos:', err);
    } finally {
      setLoading(false);
    }
  }

  // Conecta no dispositivo
  async function connect(device: BluetoothDevice) {
    try {
      const isConnected = await RNBluetoothClassic.isDeviceConnected(device.address);
      if (isConnected) {
        Alert.alert('Info', `Já conectado a ${device.name}`);
        return;
      }

      const connected = await device.connect();
      if (connected) {
        Alert.alert('Sucesso', `Conectado a ${device.name}`);
      } else {
        Alert.alert('Erro', 'Não foi possível conectar ao dispositivo.');
      }
    } catch (err) {
      console.error('Erro na conexão:', err);
      Alert.alert('Erro', 'Não foi possível conectar. Verifique se está pareado.');
    }
  }

  useEffect(() => {
    (async () => {
      const hasPermission = await requestPermissions();
      if (hasPermission) {
        loadPairedDevices();
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Dispositivos Pareados
      </Text>

      {loading && <Text>Carregando...</Text>}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: '#ccc',
            }}
          >
            <Text>{item.name || 'Sem nome'}</Text>
            <Text>{item.address}</Text>
            <Button title="Conectar" onPress={() => connect(item)} />
          </View>
        )}
      />
    </View>
  );
}
