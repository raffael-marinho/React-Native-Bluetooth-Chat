// src/screens/BluetoothConnectedScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { disconnect, BTDevice, getCurrentDevice } from "../services/bluetooth";
import { initDB, saveMessage, getMessages } from "../services/sqlite";

type Props = NativeStackScreenProps<RootStackParamList, "BluetoothConnected">;

export default function BluetoothConnectedScreen({ route, navigation }: Props) {
  const device: BTDevice = route.params.device;
  const [messages, setMessages] = useState<{ id: number; sender: "me" | "other"; text: string; timestamp: number }[]>([]);

  // Carrega histórico
  useEffect(() => {
    getMessages(device.id, setMessages);
  }, [device.id]);

  // Desconectar
  const handleDisconnect = async () => {
    try {
      await disconnect();
      Alert.alert("Desconectado", `Dispositivo ${device.name ?? device.id} desconectado.`);
      navigation.navigate("BluetoothConnection");
    } catch (e: any) {
      Alert.alert("Erro", e.message ?? String(e));
    }
  };

  // Simplesmente renderizando mensagens do histórico
  const renderItem = ({ item }: { item: typeof messages[0] }) => (
    <View style={[styles.message, item.sender === "me" ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Conectado a: {device.name ?? device.id}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      <Button title="Desconectar" onPress={handleDisconnect} color="#ff4d4d" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  message: { padding: 10, borderRadius: 8, marginVertical: 4, maxWidth: "80%" },
  myMessage: { backgroundColor: "#007bff", alignSelf: "flex-end" },
  otherMessage: { backgroundColor: "#e0e0e0", alignSelf: "flex-start" },
  messageText: { color: "#fff" },
});
