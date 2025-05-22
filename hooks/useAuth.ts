import { ref, set, get, child, push } from 'firebase/database';
import { database } from '../FirebaseConfig';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerUser = async (name: string, username: string, password: string, role: string = 'kasir') => {
  const userRef = ref(database);
  const snapshot = await get(child(userRef, 'tb_user'));
  const users = snapshot.val();

  const isUsernameExist = users && Object.values(users).some((user: any) => user.username === username);
  if (isUsernameExist) throw new Error('Username sudah digunakan');

  if (!name || !username || !password) throw new Error('Semua field harus diisi');
  if (password.length <= 5) throw new Error('Password harus lebih dari 5 huruf');

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
  const snapshot = await get(child(userRef, 'tb_user'));
  const users = snapshot.val();

  if (!username || !password) throw new Error('Semua field harus diisi');

  const user = Object.values(users).find(
    (user: any) => user.username === username && user.password === password
  ) as any;

  if (!user) throw new Error('Username atau password salah');

  await AsyncStorage.setItem('user', JSON.stringify(user));
  return {
    user_id: user.user_id,
    name: user.name,
    username: user.username,
    role: user.role,
  };
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem('user');
};

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    };
    checkUser();
  }, []);

  return { user, loading, setUser };
};
