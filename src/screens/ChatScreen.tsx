// src/screens/ChatScreen.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TextInput, Button } from 'react-native';
import React, { useState } from 'react';

export default function ChatScreen() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string>('');

  const addMessage = (msg: string) => {
    setMessages(prevMessages => [...prevMessages, msg]);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage(`Você: ${inputText}`);
      setInputText('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Bluetooth</Text>

      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 ? (
          <Text style={styles.noMessagesText}>Nenhuma mensagem ainda. Conecte-se via Bluetooth!</Text>
        ) : (
          messages.map((msg, index) => (
            <Text key={index} style={styles.messageText}>{msg}</Text>
          ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Digite sua mensagem..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
        />
        <Button title="Enviar" onPress={handleSendMessage} />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messagesContent: {
    justifyContent: 'flex-end',
  },
  noMessagesText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
});
