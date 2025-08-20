import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  ensureEnabled,
  listPaired,
  discover,
  connect,
  disconnect,
  getCurrentDevice,
  BTDevice,
} from "../services/bluetooth";
import { RootStackParamList } from "../navigation/StackNavigator";

type BluetoothConnectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BluetoothConnection"
>;

export default function BluetoothConnectionScreen() {
  const navigation = useNavigation<BluetoothConnectionScreenNavigationProp>();
  const [devices, setDevices] = useState<BTDevice[]>([]);
  const [loading, setLoading] = useState(false);

  /** Verifica se o Bluetooth está ativo ao abrir a tela */
  useEffect(() => {
    (async () => {
      try {
        const enabled = await ensureEnabled();
        if (!enabled) {
          Alert.alert(
            "Bluetooth desativado",
            "Por favor, ative o Bluetooth para continuar.",
            [{ text: "OK", onPress: () => navigation.navigate("BluetoothDisabled") }]
          );
          return;
        }

        const bonded = await listPaired();
        setDevices(bonded);
      } catch (err) {
        console.error("Erro ao verificar Bluetooth:", err);
        Alert.alert("Erro", "Não foi possível verificar o status do Bluetooth.");
      }
    })();
  }, []);

  /** Faz descoberta de dispositivos */
  const handleScan = async () => {
    setLoading(true);
    try {
      const found = await discover(8000);
      setDevices((prev) => {
        const ids = new Set(prev.map((d) => d.id));
        return [...prev, ...found.filter((d) => !ids.has(d.id))];
      });
    } catch (err) {
      console.error("Erro na descoberta de dispositivos:", err);
      Alert.alert("Erro", "Falha ao buscar dispositivos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  /** Conecta ao dispositivo selecionado */
  const handleConnect = async (device: BTDevice) => {
    const MAX_RETRIES = 3;
    let attempt = 0;
    setLoading(true);

    while (attempt < MAX_RETRIES) {
      attempt++;
      try {
        console.log(`Tentativa ${attempt} de conexão com ${device.name ?? device.id}`);

        // Desconecta o dispositivo atual se houver
        const current = getCurrentDevice();
        if (current) {
          try {
            await disconnect();
            console.log("Dispositivo anterior desconectado:", current.id);
          } catch (err) {
            console.warn("Erro ao desconectar device atual:", err);
          }
        }

        // Pequeno delay antes de conectar para evitar falhas de socket
        await new Promise((res) => setTimeout(res, 1000));

        const connected = await connect(device.id);
        console.log("Dispositivo conectado:", connected);

        setLoading(false);
        Alert.alert("Conectado", `Conectado a ${connected.name ?? connected.id}`);
        navigation.navigate("BluetoothConnected", { device: connected });
        return;
      } catch (err: any) {
        console.warn(`Falha na tentativa ${attempt}:`, err.message ?? err);
        if (attempt >= MAX_RETRIES) {
          setLoading(false);
          Alert.alert(
            "Erro ao conectar",
            `Não foi possível conectar a ${device.name ?? device.id} após ${MAX_RETRIES} tentativas.\nErro: ${err.message ?? err}`
          );
          return;
        }
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleScan} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Procurando..." : "Buscar dispositivos"}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#007bff" />}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.deviceItem} onPress={() => handleConnect(item)}>
            <Text style={styles.deviceName}>{item.name ?? "Sem nome"}</Text>
            <Text style={styles.deviceId}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Nenhum dispositivo encontrado</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  deviceItem: {
    padding: 14,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  deviceName: { fontSize: 16, fontWeight: "600", color: "#333" },
  deviceId: { fontSize: 13, color: "#666" },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 14, color: "#777" },
});
