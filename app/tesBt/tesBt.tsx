import React, { useState } from 'react';
import {
  View,
  Button,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  scanPrinters,
  connectToDevice,
  stopScanning,
  disconnectDevice,
  BluetoothDevice,
} from '../../hooks/bt/useBluetoothPrinter';

export default function BluetoothPrinterScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [foundDevices, setFoundDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleStartScan = () => {
    setFoundDevices([]);
    setScanError(null);
    setConnectionError(null);

    scanPrinters(
      // onDeviceFound
      (device: BluetoothDevice) => {
        setFoundDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (!exists) {
            return [...prev, device];
          }
          return prev;
        });
      },
      // onScanStart
      () => {
        setIsScanning(true);
        console.log('Scanning started...');
      },
      // onScanStop
      () => {
        setIsScanning(false);
        console.log('Scanning stopped');
      },
      // onError
      (error: string) => {
        setScanError(error);
        setIsScanning(false);
      },
      15000 // Scan for 15 seconds
    );
  };

  const handleStopScan = () => {
    stopScanning();
    setIsScanning(false);
  };

  const handleConnectToDevice = async (device: BluetoothDevice) => {
    setConnectionError(null);
    
    await connectToDevice(
      device.id,
      // onConnecting
      () => {
        setIsConnecting(true);
      },
      // onConnected
      (connectedDev) => {
        setIsConnecting(false);
        setConnectedDevice({
          ...device,
          bleDevice: connectedDev
        });
        Alert.alert(
          'Success',
          `Successfully connected to ${device.name}`,
          [{ text: 'OK' }]
        );
      },
      // onError
      (error: string) => {
        setIsConnecting(false);
        setConnectionError(error);
        Alert.alert('Connection Error', error, [{ text: 'OK' }]);
      }
    );
  };

  const handleDisconnect = async () => {
    if (connectedDevice) {
      try {
        await disconnectDevice(connectedDevice.id);
        setConnectedDevice(null);
        Alert.alert('Disconnected', 'Device disconnected successfully');
      } catch (error: any) {
        Alert.alert('Disconnect Error', error.message);
      }
    }
  };

  const renderDeviceItem = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleConnectToDevice(item)}
      disabled={isConnecting}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
        {item.rssi && (
          <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>
        )}
      </View>
      <View style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connect</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Printer Scanner</Text>

      {/* Connection Status */}
      {connectedDevice ? (
        <View style={styles.connectedSection}>
          <Text style={styles.connectedTitle}>✅ Connected Device</Text>
          <Text style={styles.connectedName}>{connectedDevice.name}</Text>
          <Text style={styles.connectedId}>ID: {connectedDevice.id}</Text>
          <Button title="Disconnect" onPress={handleDisconnect} color="#ff4444" />
        </View>
      ) : (
        <View style={styles.statusSection}>
          <Text style={styles.statusText}>No device connected</Text>
        </View>
      )}

      {/* Scanner Controls */}
      <View style={styles.controlsSection}>
        {!isScanning ? (
          <Button
            title="Start Scanning for Printers"
            onPress={handleStartScan}
            disabled={isConnecting}
          />
        ) : (
          <View style={styles.scanningSection}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.scanningText}>Scanning for printers...</Text>
            <Button title="Stop Scanning" onPress={handleStopScan} color="#ff4444" />
          </View>
        )}
      </View>

      {/* Connection Loading */}
      {isConnecting && (
        <View style={styles.connectingSection}>
          <ActivityIndicator size="large" color="#00aa00" />
          <Text style={styles.connectingText}>Connecting to device...</Text>
        </View>
      )}

      {/* Error Messages */}
      {scanError && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>Scan Error: {scanError}</Text>
        </View>
      )}

      {connectionError && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>Connection Error: {connectionError}</Text>
        </View>
      )}

      {/* Found Devices */}
      <View style={styles.devicesSection}>
        <Text style={styles.sectionTitle}>
          Found Printers ({foundDevices.length})
        </Text>
        {foundDevices.length === 0 && !isScanning ? (
          <Text style={styles.noDevicesText}>
            No printer devices found. Try scanning again.
          </Text>
        ) : (
          <FlatList
            data={foundDevices}
            renderItem={renderDeviceItem}
            keyExtractor={(item) => item.id}
            style={styles.devicesList}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  connectedSection: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  connectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  connectedName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  connectedId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  statusSection: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  statusText: {
    textAlign: 'center',
    color: '#856404',
    fontWeight: '500',
  },
  controlsSection: {
    marginBottom: 20,
  },
  scanningSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  scanningText: {
    marginVertical: 10,
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  connectingSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  connectingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
  },
  errorSection: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontWeight: '500',
  },
  devicesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noDevicesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  devicesList: {
    flex: 1,
  },
  deviceItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#888',
  },
  connectButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});