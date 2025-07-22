// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/StackNavigator';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      navigation.navigate('BluetoothOff', { username });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Logo 2.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />

      <Text style={styles.label}>Usuário:</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholder="Digite seu nome"
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoImage: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    marginBottom: 32,
    marginTop: -200,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#0a1e2b',
  },
  input: {
    backgroundColor: '#dceaff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    color: '#000',
  },
  button: {
    backgroundColor: '#0a1e2b',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
