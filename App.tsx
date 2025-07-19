import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TextInput, Button, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';

export default function App() {
  // Estado para armazenar as mensagens do chat
  const [messages, setMessages] = useState<string[]>([]);
  // Estado para o texto que o usuário está digitando
  const [inputText, setInputText] = useState<string>('');

  // Função para adicionar uma nova mensagem (por enquanto, apenas para testes)
  const addMessage = (msg: string) => {
    setMessages(prevMessages => [...prevMessages, msg]);
  };

  // Função para lidar com o envio de uma mensagem (será via Bluetooth depois)
  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage(`Você: ${inputText}`);
      setInputText('');
      // Aqui, no futuro, enviaremos a mensagem via Bluetooth
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Bluetooth</Text>

      {/* Área de Mensagens */}
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 ? (
          <Text style={styles.noMessagesText}>Nenhuma mensagem ainda. Conecte-se via Bluetooth!</Text>
        ) : (
          messages.map((msg, index) => (
            <Text key={index} style={styles.messageText}>{msg}</Text>
          ))
        )}
      </ScrollView>

      {/* Campo de Entrada e Botão de Enviar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Digite sua mensagem..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage} // Envia ao pressionar Enter no teclado
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
    backgroundColor: '#f0f0f0', // Fundo levemente cinza
    paddingTop: 50, // Espaçamento superior para não cobrir a barra de status
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
    justifyContent: 'flex-end', // Alinha as mensagens ao final (como em um chat)
  },
  noMessagesText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 'auto', // Centraliza verticalmente quando não há mensagens
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