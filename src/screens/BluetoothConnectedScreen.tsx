import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/StackNavigator";
import { BTDevice, disconnect } from "../services/bluetooth";
import { Bluetooth } from "lucide-react-native";

type BluetoothConnectedScreenRouteProp = RouteProp<RootStackParamList, "BluetoothConnected">;
type BluetoothConnectedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "BluetoothConnected">;

export default function BluetoothConnectedScreen() {
  const navigation = useNavigation<BluetoothConnectedScreenNavigationProp>();
  const route = useRoute<BluetoothConnectedScreenRouteProp>();
  const device: BTDevice = route.params.device;

  const handleGoChat = () => navigation.navigate("Chat", { device });

  const handleDisconnect = async () => {
    await disconnect();
    Alert.alert("Desconectado", "O dispositivo foi desconectado.");
    navigation.navigate("BluetoothConnection");
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Bluetooth size={64} color="#007bff" />
      </View>
      <Text style={styles.title}>Conectado a:</Text>
      <Text style={styles.deviceName}>{device.name ?? "Sem nome"}</Text>
      <Text style={styles.deviceId}>{device.id}</Text>

      <TouchableOpacity style={styles.chatButton} onPress={handleGoChat}>
        <Text style={styles.chatButtonText}>Ir para Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
        <Text style={styles.disconnectButtonText}>Desconectar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f9f9f9", padding: 20 },
  iconWrapper: { marginBottom: 20, backgroundColor: "#e6f0ff", padding: 20, borderRadius: 50 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 8, color: "#333" },
  deviceName: { fontSize: 20, fontWeight: "bold", color: "#007bff" },
  deviceId: { fontSize: 14, color: "#666", marginBottom: 30 },
  chatButton: { backgroundColor: "#007bff", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginBottom: 15 },
  chatButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disconnectButton: { backgroundColor: "#ff4d4d", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  disconnectButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
