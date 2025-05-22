import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { navigate } from 'expo-router/build/global-state/routing';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const WelcomePage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name="cash-register" size={64} color="#1976D2" />
      </View>
      <Text style={styles.title}>Selamat Datang di KasirKris</Text>
      <Text style={styles.subtitle}>Aplikasi kasir profesional untuk UMKM modern</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.loginButton]}
          onPress={() => navigate('/auth/login')}
        >
          <FontAwesome5 name="sign-in-alt" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.registerButton]}
          onPress={() => navigate('/auth/register')}
        >
          <FontAwesome5 name="user-plus" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 24,
  },
  iconWrapper: {
    backgroundColor: '#E3F2FD',
    borderRadius: 40,
    padding: 18,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976D2',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 17,
    color: '#555',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16, // Jika gap tidak didukung, gunakan marginRight di button
  },
  button: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 4,
  },
  loginButton: {
    backgroundColor: '#1976D2',
  },
  registerButton: {
    backgroundColor: '#43A047',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default WelcomePage;