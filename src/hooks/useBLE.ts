import { useState, useEffect, useRef } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

export function useBLE() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const managerRef = useRef(new BleManager());

  useEffect(() => {
    return () => {
      managerRef.current.stopDeviceScan();
    };
  }, []);

  async function requestPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
        granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
        granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
      );
    }
    return true;
  }

  async function startScan() {
    const permission = await requestPermissions();
    if (!permission) {
      alert('Permissões negadas');
      return;
    }

    setAllDevices([]);
    setScanning(true);

    managerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Erro no scan:', error);
        setScanning(false);
        return;
      }
      if (device && device.name) {
        setAllDevices((old) => {
          if (old.find((d) => d.id === device.id)) return old;
          return [...old, device];
        });
      }
    });
  }

  function stopScan() {
    managerRef.current.stopDeviceScan();
    setScanning(false);
  }

  return {
    allDevices,
    scanning,
    startScan,
    stopScan,
    manager: managerRef.current,
  };
}
