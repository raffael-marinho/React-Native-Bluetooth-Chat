import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useBluetooth } from '../navigation/StackNavigator';

export default function BluetoothConnectionScreen() {
  const { 
    bluetoothEnabled,
    scannedDevices,
    isScanning,
    connectToDevice,
    startScan,
    connectionStatus
  } = useBluetooth();

  useEffect(() => {
    if (bluetoothEnabled && !isScanning) {
      startScan();
    }
  }, [bluetoothEnabled, isScanning, startScan]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conexão Bluetooth</Text>
      
      <Text style={styles.statusText}>Status: {connectionStatus}</Text>

      {bluetoothEnabled && (
        <Button
          title={isScanning ? "Escaneando..." : "Escanear Dispositivos"}
          onPress={startScan}
          disabled={isScanning}
        />
      )}
      {!bluetoothEnabled && (
        <Text style={styles.bluetoothOffText}>
          Bluetooth está desligado. Por favor, ative-o nas configurações do seu celular.
        </Text>
      )}

      <Text style={styles.devicesTitle}>Dispositivos Encontrados:</Text>
      <ScrollView style={styles.deviceList}>
        {scannedDevices.length > 0 ? (
          scannedDevices.map(device => (
            <TouchableOpacity key={device.id} style={styles.deviceItem} onPress={() => connectToDevice(device)}>
              <Text style={styles.deviceName}>{device.name || 'Dispositivo Desconhecido'}</Text>
              <Text style={styles.deviceId}>{device.id}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDevicesText}>
            {isScanning ? "Escaneando..." : "Nenhum dispositivo encontrado."}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  bluetoothOffText: {
    textAlign: 'center',
    color: 'red',
    marginBottom: 20,
  },
  devicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
  noDevicesText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  }
});