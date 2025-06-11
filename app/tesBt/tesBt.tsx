import {
  BluetoothManager,
  BluetoothEscposPrinter,
} from 'react-native-bluetooth-escpos-printer';
import {PermissionsAndroid, Platform} from 'react-native';

// Minta permission (Android 12+)
const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(granted).every(p => p === 'granted');
  }
  return true;
};

// Scan & connect
const scanAndConnect = async () => {
  const permitted = await requestPermissions();
  if (!permitted) return alert('Permission ditolak');

  const pairedDevices = await BluetoothManager.enableBluetooth();
  console.log('Paired:', pairedDevices);

  // Misal ambil printer pertama
  const printer = pairedDevices[0];
  if (printer) {
    await BluetoothManager.connect(printer.address);
    console.log('Connected to printer:', printer.name);

    // Print text
    await BluetoothEscposPrinter.printText('Halo, Aldi!\n\n', {});
  }
};
