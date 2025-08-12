import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';

type BluetoothConectadoScreenRouteProp = RouteProp<RootStackParamList, 'BluetoothConectado'>;
type BluetoothConectadoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BluetoothConectado'>;

export default function BluetoothConectadoScreen() {
  const route = useRoute<BluetoothConectadoScreenRouteProp>();
  const navigation = useNavigation<BluetoothConectadoScreenNavigationProp>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Conectado ao dispositivo:</Text>
      <Text style={{ fontWeight: 'bold', marginVertical: 10 }}>{route.params.deviceId}</Text>

      <Button title="Ir para Chat" onPress={() => navigation.navigate('Chat')} />
    </View>
  );
}
