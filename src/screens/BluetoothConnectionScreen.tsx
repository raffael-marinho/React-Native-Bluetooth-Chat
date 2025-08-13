import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BluetoothConnection'>;

export default function BluetoothConnectionScreen({ navigation }: Props) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBluetooth();
  }, []);

  const checkBluetooth = async () => {
    setLoading(true);
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();

      if (!enabled) {
        // Ignora o erro de tipagem e chama a função
        const turnedOn = await (RNBluetoothClassic as any).requestEnabled();

        if (!turnedOn) {
          Alert.alert('Bluetooth', 'Por favor, ative o Bluetooth para continuar.');
          setLoading(false);
          return;
        }
      }

      const bonded = await RNBluetoothClassic.getBondedDevices();
      setDevices(bonded);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível verificar o Bluetooth.');
    }
    setLoading(false);
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      const connected = await RNBluetoothClassic.connectToDevice(device.address);
      if (connected) {
        navigation.navigate('Chat', { device });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível conectar ao dispositivo.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Dispositivos Bluetooth</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.address}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
              }}
              onPress={() => connectToDevice(item)}
            >
              <Text style={{ fontSize: 16 }}>{item.name || 'Sem nome'}</Text>
              <Text style={{ color: '#666' }}>{item.address}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>Nenhum dispositivo encontrado.</Text>}
        />
      )}
    </View>
  );
}
