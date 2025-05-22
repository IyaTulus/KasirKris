import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface User {
  name: string;
  username: string;
  role: string;
  user_id: string;
}

interface InfoCardData {
  title: string;
  amount: string;
  color: string;
}

interface TransactionData {
  id: string;
  date: string;
  time: string;
}

const DashboardKasir: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Data untuk info cards
  const infoCardsData: InfoCardData[] = [
    { title: 'Pemasukan', amount: 'Rp 3.250.000', color: '#2ecc71' },
    { title: 'Pengeluaran', amount: 'Rp 800.000', color: '#e74c3c' },
    { title: 'Hutang', amount: 'Rp 1.200.000', color: '#f1c40f' },
    { title: 'Stok Barang', amount: '342 Item', color: '#2980b9' },
  ];

  // Data untuk transaksi terbaru
  const recentTransactions: TransactionData[] = [
    { id: 'INV-001', date: '20 Mei 2023', time: '14:30' },
    { id: 'INV-002', date: '20 Mei 2023', time: '15:45' },
  ];

  // Data untuk pembelian terbaru
  const recentPurchases: TransactionData[] = [
    { id: 'PB-001', date: '19 Mei 2023', time: '13:00' },
    { id: 'PB-002', date: '18 Mei 2023', time: '16:20' },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async (): Promise<void> => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSettingsPress = (): void => {
    navigate('/settings/seting');
  };

  const renderHeader = () => (
    <View style={styles.appBar}>
      <Text style={styles.appBarText}>Dashboard Kasir</Text>
      <TouchableOpacity onPress={handleSettingsPress}>
        <FontAwesome5 name="cog" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderTotalSalesCard = () => (
    <View style={styles.totalSalesCard}>
      <View>
        <Text style={styles.totalSalesLabel}>Total Penjualan Hari Ini</Text>
        <Text style={styles.totalSalesAmount}>Rp 2.450.000</Text>
      </View>
      <FontAwesome5 name="calculator" size={24} color="#fff" />
    </View>
  );

  const renderInfoCard = (item: InfoCardData, index: number) => (
    <View key={index} style={styles.infoCard}>
      <Text style={[styles.infoCardTitle, { color: item.color }]}>
        {item.title}
      </Text>
      <Text style={styles.infoCardAmount}>{item.amount}</Text>
    </View>
  );

  const renderMenuButtons = () => (
    <View style={styles.menuButtonsContainer}>
      {user?.role === 'admin' && (
        <>
          <TouchableOpacity
            style={[styles.menuButton, styles.menuButtonLaporan]}
          >
            <Text style={styles.menuButtonText}>Laporan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuButton, styles.menuButtonOther]}
          >
            <Text style={styles.menuButtonText}>Button</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity
        style={[styles.menuButton, styles.menuButtonKasir]}
      >
        <Text style={styles.menuButtonText}>Kasir</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransactionItem = (item: TransactionData, type: 'sale' | 'purchase') => (
    <View key={item.id} style={styles.transactionItem}>
      <Text style={styles.transactionId}>
        {type === 'sale' ? 'Penjualan' : 'Pembelian'} #{item.id}
      </Text>
      <Text style={styles.transactionDateTime}>
        {item.date} - {item.time}
      </Text>
    </View>
  );

  const renderTransactionSection = (
    title: string,
    data: TransactionData[],
    type: 'sale' | 'purchase'
  ) => (
    <View style={styles.transactionSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.map((item) => renderTransactionItem(item, type))}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          header: renderHeader,
        }}
      />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Penjualan Card */}
        {renderTotalSalesCard()}

        {/* Info Cards Container */}
        <View style={styles.infoCardsContainer}>
          {infoCardsData.map((item, index) => renderInfoCard(item, index))}
        </View>

        {/* Menu Buttons */}
        {renderMenuButtons()}

        {/* Transaksi Terbaru */}
        {renderTransactionSection(
          'Transaksi Terbaru',
          recentTransactions,
          'sale'
        )}

        {/* Pembelian Terbaru */}
        {renderTransactionSection(
          'Pembelian Terbaru',
          recentPurchases,
          'purchase'
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  scrollContent: {
    padding: width * 0.04,
    paddingBottom: width * 0.08,
  },

  // Header Styles
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6c5ce7',
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.025,
    paddingTop: 32,
    height: 90,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  appBarText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },

  // Total Sales Card Styles
  totalSalesCard: {
    flexDirection: 'row',
    backgroundColor: '#6c5ce7',
    padding: width * 0.04,
    marginTop: 10,
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalSalesLabel: {
    color: '#fff',
    fontSize: width * 0.035,
    opacity: 0.9,
  },
  totalSalesAmount: {
    fontSize: width * 0.055,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },

  // Info Cards Styles
  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  infoCard: {
    width: width > 400 ? '48%' : '100%',
    backgroundColor: '#fff',
    padding: width * 0.04,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  infoCardTitle: {
    fontSize: width * 0.035,
    fontWeight: '600',
  },
  infoCardAmount: {
    marginTop: 8,
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#2c3e50',
  },

  // Menu Buttons Styles
  menuButtonsContainer: {
    flexDirection: width > 400 ? 'row' : 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
    gap: 10,
  },
  menuButton: {
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.07,
    borderRadius: 10,
    minWidth: width > 400 ? width * 0.25 : '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButtonLaporan: {
    backgroundColor: '#1abc9c',
  },
  menuButtonOther: {
    backgroundColor: '#e67e22',
  },
  menuButtonKasir: {
    backgroundColor: '#8e44ad',
  },
  menuButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },

  // Transaction Section Styles
  transactionSection: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: width * 0.04,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#6c5ce7',
  },
  transactionId: {
    fontSize: width * 0.038,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  transactionDateTime: {
    fontSize: width * 0.032,
    color: '#7f8c8d',
  },
});

export default DashboardKasir;
