import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

const manager = new BleManager();

export interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi?: number;
  serviceUUIDs?: string[];
  manufacturerData?: string;
  isConnectable?: boolean;
}

export interface ScanStatus {
  isScanning: boolean;
  devicesFound: BluetoothDevice[];
  error: string | null;
}

export interface ConnectionStatus {
  isConnecting: boolean;
  connectedDevice: BluetoothDevice | null;
  error: string | null;
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        console.log('Not all permissions granted:', granted);
        return false;
      }
      return true;
    } catch (error) {
      console.log('Permission request error:', error);
      return false;
    }
  }
  return true;
}

// Fungsi untuk scan semua device Bluetooth
export async function scanAllDevices(
  onDeviceFound: (device: BluetoothDevice) => void,
  onScanStart: () => void,
  onScanStop: () => void,
  onError: (error: string) => void,
  scanDuration: number = 30000, // 30 detik default
  allowDuplicates: boolean = false // Opsi untuk mengizinkan duplikasi
) {
  const permissionGranted = await requestPermissions();
  
  if (!permissionGranted) {
    onError('Bluetooth permissions not granted');
    return;
  }

  onScanStart();
  const foundDevices = new Set<string>(); // Untuk mencegah duplikasi

  const scanTimer = setTimeout(() => {
    manager.stopDeviceScan();
    onScanStop();
    console.log('Scan completed after timeout');
  }, scanDuration);

  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      clearTimeout(scanTimer);
      console.log('Scan error:', error);
      onError(`Scan error: ${error.message}`);
      onScanStop();
      return;
    }

    if (device) {
      // Cek duplikasi jika allowDuplicates = false
      if (!allowDuplicates && foundDevices.has(device.id)) {
        return;
      }

      foundDevices.add(device.id);
      const deviceInfo: BluetoothDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        rssi: device.rssi || undefined,
        serviceUUIDs: device.serviceUUIDs || undefined,
        manufacturerData: device.manufacturerData || undefined,
        isConnectable: device.isConnectable || undefined,
      };
      
      console.log('Found Bluetooth device:', deviceInfo);
      onDeviceFound(deviceInfo);
    }
  });
}

// Fungsi khusus untuk scan printer (tetap dipertahankan)
export async function scanPrinters(
  onDeviceFound: (device: BluetoothDevice) => void,
  onScanStart: () => void,
  onScanStop: () => void,
  onError: (error: string) => void,
  scanDuration: number = 120000
) {
  const permissionGranted = await requestPermissions();
  
  if (!permissionGranted) {
    onError('Bluetooth permissions not granted');
    return;
  }

  onScanStart();
  const foundDevices = new Set<string>();

  const scanTimer = setTimeout(() => {
    manager.stopDeviceScan();
    onScanStop();
    console.log('Scan completed after timeout');
  }, scanDuration);

  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      clearTimeout(scanTimer);
      console.log('Scan error:', error);
      onError(`Scan error: ${error.message}`);
      onScanStop();
      return;
    }

    if (device && device.name && !foundDevices.has(device.id)) {
      // Filter untuk perangkat printer
      const isPrinterDevice = 
        device.name.toLowerCase().includes('pos') ||
        device.name.toLowerCase().includes('printer') ||
        device.name.toLowerCase().includes('print') ||
        device.name.toLowerCase().includes('receipt') ||
        device.name.toLowerCase().includes('thermal');

      if (isPrinterDevice) {
        foundDevices.add(device.id);
        const deviceInfo: BluetoothDevice = {
          id: device.id,
          name: device.name,
          rssi: device.rssi || undefined,
          serviceUUIDs: device.serviceUUIDs || undefined,
          manufacturerData: device.manufacturerData || undefined,
          isConnectable: device.isConnectable || undefined,
        };
        
        console.log('Found printer device:', deviceInfo);
        onDeviceFound(deviceInfo);
      }
    }
  });
}

// Fungsi untuk scan device berdasarkan filter custom
export async function scanDevicesWithFilter(
  onDeviceFound: (device: BluetoothDevice) => void,
  onScanStart: () => void,
  onScanStop: () => void,
  onError: (error: string) => void,
  filterFunction: (device: any) => boolean, // Custom filter function
  scanDuration: number = 30000
) {
  const permissionGranted = await requestPermissions();
  
  if (!permissionGranted) {
    onError('Bluetooth permissions not granted');
    return;
  }

  onScanStart();
  const foundDevices = new Set<string>();

  const scanTimer = setTimeout(() => {
    manager.stopDeviceScan();
    onScanStop();
    console.log('Scan completed after timeout');
  }, scanDuration);

  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      clearTimeout(scanTimer);
      console.log('Scan error:', error);
      onError(`Scan error: ${error.message}`);
      onScanStop();
      return;
    }

    if (device && !foundDevices.has(device.id) && filterFunction(device)) {
      foundDevices.add(device.id);
      const deviceInfo: BluetoothDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        rssi: device.rssi || undefined,
        serviceUUIDs: device.serviceUUIDs || undefined,
        manufacturerData: device.manufacturerData || undefined,
        isConnectable: device.isConnectable || undefined,
      };
      
      console.log('Found filtered device:', deviceInfo);
      onDeviceFound(deviceInfo);
    }
  });
}

export function stopScanning() {
  manager.stopDeviceScan();
}

export async function connectToDevice(
  deviceId: string,
  onConnecting: () => void,
  onConnected: (device: any) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    onConnecting();
    console.log(`Attempting to connect to device: ${deviceId}`);
    
    const device = await manager.connectToDevice(deviceId);
    console.log('Device connected, discovering services...');
    
    await device.discoverAllServicesAndCharacteristics();
    console.log('Services and characteristics discovered');
    
    onConnected(device);
  } catch (error: any) {
    console.log('Connection error:', error);
    onError(`Connection failed: ${error.message}`);
  }
}

export function disconnectDevice(deviceId: string) {
  return manager.cancelDeviceConnection(deviceId);
}