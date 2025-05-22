import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setIsLoggedIn(true);
          router.replace('/dashboard/dashboard');
        }
      } catch (e) {
        console.log('Gagal mengecek login:', e);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (loading) return null;
  if (isLoggedIn) return null;

  return <Stack />;
}
