import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/StackNavigator';

type BluetoothConnectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BluetoothConnection'
>;

export default function BluetoothConnectionScreen() {
  const navigation = useNavigation<BluetoothConnectionScreenNavigationProp>();
  const [devices, setDevices] = useState<Array<{ id: string; name: string }>>([]);
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    async function fetchDevices() {
      try {
        // Lista dispositivos pareados (bonded)
        const bondedDevices = await RNBluetoothClassic.getBondedDevices();
        setDevices(bondedDevices);
      } catch (error) {
        console.error('Erro ao listar dispositivos pareados:', error);
      }
    }

    fetchDevices();
  }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const foundDevices = await RNBluetoothClassic.startDiscovery();
      setDevices(foundDevices);
    } catch (error) {
      console.error('Erro na descoberta:', error);
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TouchableOpacity style={styles.button} onPress={handleDiscover} disabled={discovering}>
        <Text style={styles.buttonText}>{discovering ? 'Procurando...' : 'Procurar Dispositivos'}</Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deviceButton}
            onPress={() => navigation.navigate('BluetoothConectado', { deviceId: item.id })}
          >
            <Text style={styles.deviceText}>{item.name || item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhum dispositivo encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
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
});
