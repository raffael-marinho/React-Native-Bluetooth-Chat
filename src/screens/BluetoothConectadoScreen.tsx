// src/screens/BluetoothConectadoScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BluetoothConectadoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Conectado</Text>
      {/* Aqui vai a UI do Bluetooth conectado */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  title: {
    fontSize: 24, fontWeight: 'bold',
  },
});
