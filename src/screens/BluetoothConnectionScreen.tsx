import React from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';

type BluetoothConnectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BluetoothConnection'
>;

export default function BluetoothConnectionScreen() {
  const navigation = useNavigation<BluetoothConnectionScreenNavigationProp>();
  const devices = [
    { id: '1', name: 'Dispositivo 1' },
    { id: '2', name: 'Dispositivo 2' },
  ]; // exemplo, substitua pela lista real

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
});
