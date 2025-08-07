import React, { useEffect, useState, createContext, useContext, useRef, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Device, Characteristic, Service } from 'react-native-ble-plx';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

import BluetoothDesativadoScreen from '../screens/BluetoothDesativadoScreen';
import BluetoothConnectionScreen from '../screens/BluetoothConnectionScreen';
import BluetoothConectadoScreen from '../screens/BluetoothConectadoScreen';
import ChatScreen from '../screens/ChatScreen';
import SplashScreen from '../screens/SplashScreen';

// --- CONFIGURAÇÕES E UUIDs ---
const SERVICE_UUID = '4c48424c-5545-544f-4f54-484154535256';
const CHARACTERISTIC_UUID_RX = '4c48424c-5545-544f-4f54-484154535243';
const CHARACTERISTIC_UUID_TX = '4c48424c-5545-544f-4f54-484154535244';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// --- CONTEXTO DE BLUETOOTH ---
interface BluetoothContextType {
  bluetoothEnabled: boolean;
  scannedDevices: Device[];
  isScanning: boolean;
  connectedDevice: Device | null;
  connectionStatus: string;
  startScan: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => void;
  handleSendMessage: (message: string) => Promise<void>;
  messages: string[];
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (context === undefined) {
    throw new Error('useBluetooth must be used within a BluetoothProvider');
  }
  return context;
};

// --- STACK NAVIGATOR ---
export type RootStackParamList = {
  SplashScreen: undefined;
  BluetoothDesativado: undefined;
  BluetoothConnection: undefined;
  BluetoothConectado: undefined;
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const [messages, setMessages] = useState<string[]>([]);
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(false);
  const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Desconectado');
  const [writeCharacteristic, setWriteCharacteristic] = useState<Characteristic | null>(null);

  const bleManagerRef = useRef<BleManager | null>(null);

  const addMessage = (msg: string) => {
    setMessages(prevMessages => [...prevMessages, msg]);
  };

  const triggerNotificationAndVibrate = useCallback(async (title: string, body: string) => {
    if (Platform.OS === 'android') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de notificação não concedida.');
        return;
      }
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  }, []);

  const checkBluetoothState = useCallback(() => {
    if (!bleManagerRef.current) return;
    const subscription = bleManagerRef.current.onStateChange((state) => {
      if (state === 'PoweredOn') {
        setBluetoothEnabled(true);
      } else {
        setBluetoothEnabled(false);
      }
    }, true);
    return () => subscription.remove();
  }, []);

  const startScan = useCallback(() => {
    if (!bleManagerRef.current || !bluetoothEnabled || connectedDevice) return;
    setIsScanning(true);
    setScannedDevices([]);
    bleManagerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setIsScanning(false);
        return;
      }
      if (device && device.name) {
        setScannedDevices(prevDevices => {
          if (!prevDevices.some(d => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });
    setTimeout(() => {
      if (bleManagerRef.current) {
        bleManagerRef.current.stopDeviceScan();
        setIsScanning(false);
      }
    }, 10000);
  }, [bluetoothEnabled, connectedDevice]);

  const connectToDevice = useCallback(async (device: Device) => {
    if (!bleManagerRef.current) return;
    setIsScanning(false);
    bleManagerRef.current.stopDeviceScan();
    setConnectionStatus(`Conectando a ${device.name || device.id}...`);
    try {
      const connected = await device.connect();
      setConnectedDevice(connected);
      setConnectionStatus(`Conectado a ${connected.name || connected.id}`);
      setScannedDevices([]);
      await connected.discoverAllServicesAndCharacteristics();
      const services = await connected.services();
      let foundService = services.find(s => s.uuid.toLowerCase().includes(SERVICE_UUID.replace(/-/g, '').toLowerCase()));

      if (foundService) {
        const characteristics = await foundService.characteristics();
        const txChar = characteristics.find(c => c.uuid.toLowerCase().includes(CHARACTERISTIC_UUID_TX.replace(/-/g, '').toLowerCase()));
        const rxChar = characteristics.find(c => c.uuid.toLowerCase().includes(CHARACTERISTIC_UUID_RX.replace(/-/g, '').toLowerCase()));
        if (txChar && rxChar) {
          setWriteCharacteristic(txChar);
          rxChar.monitor((error, char) => {
            if (char?.value) {
              const decodedMessage = atob(char.value);
              addMessage(`Outro: ${decodedMessage}`);
              triggerNotificationAndVibrate('Nova Mensagem Bluetooth', decodedMessage);
            }
          });
        }
      }
      connected.onDisconnected(() => {
        setConnectedDevice(null);
        setConnectionStatus('Desconectado');
        setWriteCharacteristic(null);
        setMessages([]);
        startScan();
      });
    } catch (error: any) {
      setConnectionStatus('Falha na conexão');
      setConnectedDevice(null);
      startScan();
    }
  }, [addMessage, startScan, triggerNotificationAndVibrate]);

  const disconnectDevice = useCallback(async () => {
    if (connectedDevice) {
      setConnectionStatus('Desconectando...');
      await connectedDevice.cancelConnection();
    }
  }, [connectedDevice]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (message && writeCharacteristic && connectedDevice && bleManagerRef.current) {
      try {
        const base64Message = btoa(message);
        await bleManagerRef.current.writeCharacteristicWithResponseForDevice(
          connectedDevice.id,
          writeCharacteristic.serviceUUID,
          writeCharacteristic.uuid,
          base64Message
        );
        addMessage(`Você: ${message}`);
      } catch (error) {
        Alert.alert('Erro ao Enviar', 'Não foi possível enviar a mensagem.');
      }
    }
  }, [addMessage, writeCharacteristic, connectedDevice]);

  useEffect(() => {
    if (!bleManagerRef.current) {
      bleManagerRef.current = new BleManager();
    }
    const setupBluetooth = async () => {
      let allPermissionsGranted = false;
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        if (granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED) {
          allPermissionsGranted = true;
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          allPermissionsGranted = true;
        }
      }
      if (allPermissionsGranted) {
        checkBluetoothState();
      } else {
        setBluetoothEnabled(false);
      }
    };
    setupBluetooth();
    return () => {
      if (bleManagerRef.current) {
        bleManagerRef.current.destroy();
        bleManagerRef.current = null;
      }
    };
  }, [checkBluetoothState]);

  let initialRouteName: keyof RootStackParamList = 'SplashScreen';
  if (bluetoothEnabled === null) {
    initialRouteName = 'SplashScreen';
  } else if (connectedDevice) {
    initialRouteName = 'Chat';
  } else if (bluetoothEnabled) {
    initialRouteName = 'BluetoothConnection';
  } else {
    initialRouteName = 'BluetoothDesativado';
  }

  const bluetoothValues = {
    bluetoothEnabled, scannedDevices, isScanning, connectedDevice, connectionStatus,
    startScan, connectToDevice, disconnectDevice, handleSendMessage, messages
  };

  return (
    <BluetoothContext.Provider value={bluetoothValues}>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="BluetoothDesativado" component={BluetoothDesativadoScreen} />
        <Stack.Screen name="BluetoothConnection" component={BluetoothConnectionScreen} />
        <Stack.Screen name="BluetoothConectado" component={BluetoothConectadoScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </BluetoothContext.Provider>
  );
}