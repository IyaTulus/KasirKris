import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { LinearGradient } from 'expo-linear-gradient';
import { navigate } from 'expo-router/build/global-state/routing';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Catat Penjualan Lebih Mudah',
    text: 'Kelola transaksi secara efisien dan akurat dalam genggaman Anda.',
    image: require('../assets/images/sales.png'),
  },
  {
    key: '2',
    title: 'Kelola Hutang Pelanggan',
    text: 'Sistem cicilan otomatis, pantau pembayaran yang belum lunas.',
    image: require('../assets/images/debt.png'),
  },
  {
    key: '3',
    title: 'Cetak Struk & Lacak Barang',
    text: 'Integrasi printer thermal dan manajemen stok otomatis.',
    image: require('../assets/images/receipt.png'),
    isLast: true,
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const renderItem = ({ item }: any) => {
    return (
      <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.slide}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>

        {item.isLast && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigate('/auth/login')} // ubah sesuai nama screen login kamu
          >
            <Text style={styles.startButtonText}>Mulai Sekarang</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    );
  };

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      showNextButton={false}
      showDoneButton={false}
      showSkipButton={false}
      dotStyle={{ backgroundColor: '#90CAF9' }}
      activeDotStyle={{ backgroundColor: '#1976D2', width: 24 }}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D47A1',
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;