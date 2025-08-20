import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Vibration } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";

import { send, subscribeLines, getCurrentDevice, BTDevice } from "../services/bluetooth";
import { initDB, saveMessage, getMessages } from "../services/database";
import * as Notifications from "expo-notifications";

type RouteParams = { Chat: { device: BTDevice } };
type Message = { id: string; text: string; sender: "me" | "other" };

export default function ChatScreen() {
  const route = useRoute<RouteProp<RouteParams, "Chat">>();
  const device: BTDevice | null = route.params?.device ?? getCurrentDevice();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initDB();
    if (device) {
      getMessages(device.id, msgs => {
        setMessages(msgs.map(m => ({ id: m.id.toString(), text: m.text, sender: m.sender })));
      });
    }
  }, [device]);

  useEffect(() => {
    if (!device) return;

    const sub = subscribeLines(line => {
      const msg: Message = { id: Date.now().toString(), text: line, sender: "other" };
      setMessages(prev => [...prev, msg]);
      saveMessage(device.id, "other", line);

      Vibration.vibrate(200);
      Notifications.scheduleNotificationAsync({
        content: { title: "Nova mensagem", body: line },
        trigger: null,
      });
    });

    return () => sub.remove();
  }, [device]);

  const handleSend = async () => {
    if (!input.trim() || !device) return;
    try {
      await send(input);
      const msg: Message = { id: Date.now().toString(), text: input, sender: "me" };
      setMessages(prev => [...prev, msg]);
      saveMessage(device.id, "me", input);
      setInput("");
    } catch (e) { console.error("Erro ao enviar:", e); }
  };

  useEffect(() => { if (messages.length) flatListRef.current?.scrollToEnd({ animated: true }); }, [messages]);

  if (!device) return <View style={styles.container}><Text style={styles.errorText}>Nenhum dispositivo conectado.</Text></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
      <View style={styles.header}><Text style={styles.headerText}>Chat com {device.name ?? device.id}</Text></View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === "me" ? styles.myMessage : styles.otherMessage]}>
            <Text style={[item.sender === "me" ? styles.myMessageText : styles.otherMessageText]}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Digite sua mensagem..." value={input} onChangeText={setInput} />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}><Text style={styles.sendButtonText}>Enviar</Text></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: { padding: 16, backgroundColor: "#007bff", alignItems: "center" },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  message: { marginVertical: 6, marginHorizontal: 12, padding: 10, borderRadius: 10, maxWidth: "75%" },
  myMessage: { alignSelf: "flex-end", backgroundColor: "#007bff" },
  myMessageText: { color: "#fff" },
  otherMessage: { alignSelf: "flex-start", backgroundColor: "#e6e6e6" },
  otherMessageText: { color: "#333" },
  inputRow: { flexDirection: "row", padding: 10, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#ddd" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 14, fontSize: 15, marginRight: 8, backgroundColor: "#fff" },
  sendButton: { backgroundColor: "#007bff", borderRadius: 20, paddingHorizontal: 16, justifyContent: "center" },
  sendButtonText: { color: "#fff", fontWeight: "600" },
  errorText: { marginTop: 40, textAlign: "center", color: "#333", fontSize: 16 },
});
