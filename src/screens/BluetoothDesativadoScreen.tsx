import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/StackNavigator'; // Ajuste o caminho conforme sua estrutura

type BluetoothDesativadoScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  'BluetoothDesativado'
>;

const BluetoothDesativadoScreen = () => {
  const navigation = useNavigation<BluetoothDesativadoScreenProp>();

  const ativarBluetooth = () => {
    // Aqui você pode integrar a ativação real do Bluetooth
    console.log('Bluetooth ativar...');
    navigation.navigate('BluetoothConnection');
  };

  return (
    <View style={styles.container}>
      <Icon name="bluetooth-disabled" size={120} color="#888" />
      <Text style={styles.title}>Bluetooth Desativado</Text>
      <Text style={styles.subtitle}>
        Ative o Bluetooth para procurar e se conectar a outros dispositivos.
      </Text>

      <TouchableOpacity style={styles.button} onPress={ativarBluetooth}>
        <Text style={styles.buttonText}>Ativar Bluetooth</Text>
      </TouchableOpacity>

    </View>
  );
};

export default BluetoothDesativadoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 24,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  
});
