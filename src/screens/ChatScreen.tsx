// src/screens/ChatScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(), // temporário
      sender: 'me',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={item.sender === 'me' ? styles.myMessage : styles.otherMessage}>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <Text style={styles.dateLabel}>Hoje</Text>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Mensagem"
            placeholderTextColor="#555"
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dateLabel: {
    alignSelf: 'center',
    backgroundColor: '#ddd',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    color: '#333',
    fontWeight: '600',
  },
  messageList: {
    padding: 10,
    paddingBottom: 20,
  },
  myMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ADD8E6',
    padding: 10,
    borderRadius: 14,
    marginVertical: 4,
    maxWidth: '75%',
  },
  otherMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 14,
    marginVertical: 4,
    maxWidth: '75%',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#ccc',
    paddingHorizontal: 16,
    height: 40,
    fontSize: 16,
    color: '#000',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#1E88E5',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
