import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export async function prepareBluetooth() {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ]);

    const allGranted = Object.values(granted).every(
      v => v === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!allGranted) {
      console.warn('Permissões de Bluetooth não concedidas.');
      return false;
    }

    let enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) {
      enabled = await RNBluetoothClassic.requestBluetoothEnabled();
    }

    return enabled;
  } catch (error) {
    console.error('Erro ao preparar Bluetooth:', error);
    return false;
  }
}
