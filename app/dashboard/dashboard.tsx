import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const DashboardKasir = () => {
  return (
    <ScrollView style={styles.container}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarText}>Dashboard Kasir</Text>
        <FontAwesome5 name="bell" size={20} color="#fff" />
      </View>

      {/* Total Penjualan */}
      <View style={styles.totalSalesCard}>
        <View>
          <Text style={styles.label}>Total Penjualan Hari Ini</Text>
          <Text style={styles.totalAmount}>Rp 2.450.000</Text>
        </View>
        <FontAwesome5 name="calculator" size={24} color="#fff" />
      </View>

      {/* 4 Info Cards */}
      <View style={styles.infoCardsContainer}>
        <View style={styles.infoCard}>
          <Text style={[styles.infoText, { color: '#2ecc71' }]}>Pemasukan</Text>
          <Text style={styles.infoAmount}>Rp 3.250.000</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={[styles.infoText, { color: '#e74c3c' }]}>Pengeluaran</Text>
          <Text style={styles.infoAmount}>Rp 800.000</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={[styles.infoText, { color: '#f1c40f' }]}>Hutang</Text>
          <Text style={styles.infoAmount}>Rp 1.200.000</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={[styles.infoText, { color: '#2980b9' }]}>Stok Barang</Text>
          <Text style={styles.infoAmount}>342 Item</Text>
        </View>
      </View>

      {/* Menu Buttons */}
      <View style={styles.menuButtons}>
        <TouchableOpacity style={[styles.menuButton, { backgroundColor: '#1abc9c' }]}>
          <Text style={styles.menuText}>Laporan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuButton, { backgroundColor: '#e67e22' }]}>
          <Text style={styles.menuText}>Button</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuButton, { backgroundColor: '#8e44ad' }]}>
          <Text style={styles.menuText}>Kasir</Text>
        </TouchableOpacity>
      </View>

      {/* Transaksi Terbaru */}
      <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
      <View style={styles.transactionItem}>
        <Text>Penjualan #INV-001</Text>
        <Text>20 Mei 2023 - 14:30</Text>
      </View>
      <View style={styles.transactionItem}>
        <Text>Penjualan #INV-002</Text>
        <Text>20 Mei 2023 - 15:45</Text>
      </View>

      {/* Pembelian Terbaru */}
      <Text style={styles.sectionTitle}>Pembelian Terbaru</Text>
      <View style={styles.transactionItem}>
        <Text>Pembelian #PB-001</Text>
        <Text>19 Mei 2023 - 13:00</Text>
      </View>
      <View style={styles.transactionItem}>
        <Text>Pembelian #PB-002</Text>
        <Text>18 Mei 2023 - 16:20</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ecf0f1' },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6c5ce7',
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  appBarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  totalSalesCard: {
    flexDirection: 'row',
    backgroundColor: '#6c5ce7',
    padding: 16,
    marginTop: 10,
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: '#fff' },
  totalAmount: { fontSize: 20, color: '#fff', fontWeight: 'bold' },

  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  infoText: { fontSize: 14, fontWeight: 'bold' },
  infoAmount: { marginTop: 4, fontSize: 16, fontWeight: 'bold' },

  menuButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  menuText: { color: '#fff', fontWeight: 'bold' },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default DashboardKasir;
