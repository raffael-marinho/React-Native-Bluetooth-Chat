// src/screens/BluetoothConnectionScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function BluetoothConnectionScreen() {
  const showUnavailable = () => {
    Alert.alert(
      'Bluetooth Indisponível',
      'O suporte a Bluetooth ainda não está disponível no modo Expo. Para usá-lo, será necessário ejetar o app.'
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Conexão Bluetooth</Text>
      <Text style={styles.info}>
        O suporte real a Bluetooth precisa do projeto ejetado.
      </Text>
      <Button title="Ativar Bluetooth" onPress={showUnavailable} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  info: { textAlign: 'center', color: '#666', marginBottom: 20 },
});
