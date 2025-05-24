import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from '../FirebaseConfig';
import { useEffect, useState } from 'react';

export const useUserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRef = ref(database, 'tb_user');
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([key, value]: [string, any]) => ({
          ...value,
          key,
        }));
        setUsers(userList);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUser = async (userData: any) => {
    const newRef = push(ref(database, 'tb_user'));
    await set(newRef, { ...userData, user_id: newRef.key });
  };

  const deleteUser = async (userKey: string) => {
    await remove(ref(database, `tb_user/${userKey}`));
  };

  const editUser = async (userKey: string, newData: any) => {
    await update(ref(database, `tb_user/${userKey}`), newData);
  };

  return {
    users,
    loading,
    createUser,
    deleteUser,
    editUser,
  };
};
