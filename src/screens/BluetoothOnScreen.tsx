import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/StackNavigator';

type BluetoothOnRouteProp = RouteProp<RootStackParamList, 'BluetoothOn'>;

export default function BluetoothOnScreen() {
  const route = useRoute<BluetoothOnRouteProp>();
  const { username, connectedUser } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topText}>bluetooth</Text>
        <Image source={require('../../assets/on.png')} style={styles.bluetoothIcon} />
      </View>

      <Image source={require('../../assets/Masculino.png')} style={styles.profile} />
      <Text style={styles.username}>{username}</Text>

      <Text style={styles.label}>Conectado:</Text>

      <View style={styles.connectedCard}>
        <Image source={require('../../assets/Masculino.png')} style={styles.avatar} />
        <Text style={styles.connectedName}>{connectedUser}</Text>
        <Image source={require('../../assets/on.png')} style={styles.arrow} />
      </View>
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
  connectedCard: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: '#8bbbf8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  connectedName: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  arrow: {
    width: 16,
    height: 16,
  },
});
