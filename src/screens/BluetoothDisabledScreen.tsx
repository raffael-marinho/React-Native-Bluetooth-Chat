// src/screens/BluetoothDisabledScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function BluetoothDisabledScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth desativado</Text>
      <Text style={styles.subtitle}>
        Por favor, ative o Bluetooth para usar o Blink.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("BluetoothConnection" as never)}
      >
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#007bff" },
  subtitle: { fontSize: 16, color: "#333", textAlign: "center", marginBottom: 20 },
  button: { backgroundColor: "#007bff", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
