import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/StackNavigator';

type BluetoothOffRouteProp = RouteProp<RootStackParamList, 'BluetoothOff'>;
type BluetoothOffNavProp = NativeStackNavigationProp<RootStackParamList, 'BluetoothOff'>;

export default function BluetoothOffScreen() {
  const navigation = useNavigation<BluetoothOffNavProp>();
  const route = useRoute<BluetoothOffRouteProp>();
  const { username } = route.params;

  const handleEnableBluetooth = () => {
    const connectedUser = "OutroUsuário"; // Aqui você pode simular ou futuramente buscar via Bluetooth
    navigation.navigate('BluetoothOn', {
      username,
      connectedUser,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topText}>bluetooth</Text>
        <Image source={require('../../assets/off.png')} style={styles.bluetoothIcon} />
      </View>

      <Image source={require('../../assets/Masculino.png')} style={styles.profile} />
      <Text style={styles.username}>{username}</Text>

      <Text style={styles.label}>Conectado:</Text>
      <TouchableOpacity onPress={handleEnableBluetooth}>
        <Text style={styles.enableText}>Ativar Bluetooth para Busca</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  topText: {
    fontSize: 12,
    color: '#777',
  },
  bluetoothIcon: {
    width: 24,
    height: 24,
  },
  profile: {
    width: 80,
    height: 80,
    marginTop: 40,
    borderRadius: 40,
  },
  username: {
    fontSize: 18,
    marginVertical: 10,
  },
  label: {
    marginTop: 40,
    fontSize: 14,
  },
  enableText: {
    marginTop: 16,
    color: '#aaa',
    fontSize: 14,
  },
});
