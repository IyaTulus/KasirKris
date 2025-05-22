import { ref, set, get, child, push } from 'firebase/database';
import { database } from '../FirebaseConfig';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerUser = async (name: string, username: string, password: string, role: string = 'kasir') => {
  const userRef = ref(database);
  const snapshot = await get(child(userRef, `tb_user`));

  // Cek apakah username sudah ada
  const users = snapshot.val();
  const isUsernameExist = users && Object.values(users).some((user: any) => user.username === username);

  if (isUsernameExist) {
    throw new Error('Username sudah digunakan');
  }

  if (!name || !username || !password) {
    throw new Error('Semua field harus diisi');
  }

  if (password.length <= 5) {
    throw new Error('Password harus lebih dari 5 huruf');
  }

  const newUserRef = push(ref(database, 'tb_user'));
  const user_id = newUserRef.key;

  await set(newUserRef, {
    user_id,
    name,
    username,
    password,
    role,
    created_at: Date.now()
  });

  return { user_id, name, username, role };
};

export const loginUser = async (username: string, password: string) => {
  const userRef = ref(database);
  const snapshot = await get(child(userRef, `tb_user`));

  const users = snapshot.val();
  const isUsernameExist = users && Object.values(users).some((user: any) => user.username === username);
  const isPasswordExist = users && Object.values(users).some((user: any) => user.password === password);

  if (!username || !password) {
    throw new Error('Semua field harus diisi');
  }

  if (!isUsernameExist) {
    throw new Error('Username tidak ditemukan');
  }

  if (!isPasswordExist) {
    throw new Error('Password salah');
  }

  if (isUsernameExist && isPasswordExist) {
    const user = Object.values(users).find(
      (user: any) => user.username === username && user.password === password
    ) as any;

    // Return user_id for navigation to dashboard
    return { user_id: user.user_id };
  }
};

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    };
    checkUser();
  }, []);

  return { user, setUser };
};