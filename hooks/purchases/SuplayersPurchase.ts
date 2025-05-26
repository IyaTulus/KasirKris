// hooks/useSuppliers.ts
import { useState, useEffect } from 'react';
import { ref, push, set, onValue, off } from 'firebase/database';
import { database } from '../../FirebaseConfig';
import { Supplier } from '../purchases/index';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const suppliersRef = ref(database, 'tb_suppliers');
    
    const unsubscribe = onValue(suppliersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const suppliersList = Object.keys(data).map(key => ({
          supplier_id: key,
          ...data[key]
        }));
        setSuppliers(suppliersList);
      } else {
        setSuppliers([]);
      }
    }, (error) => {
      setError(error.message);
    });

    return () => off(suppliersRef, 'value', unsubscribe);
  }, []);

  const addSupplier = async (supplierData: Omit<Supplier, 'supplier_id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const suppliersRef = ref(database, 'tb_suppliers');
      const newSupplierRef = push(suppliersRef);
      
      // Dapatkan supplier_id dari key yang di-generate Firebase
      const supplierId = newSupplierRef.key!;
      
      const newSupplier: Supplier = {
        supplier_id: supplierId, // Tambahkan supplier_id
        ...supplierData,
        created_at: new Date().toISOString()
      };
      
      await set(newSupplierRef, newSupplier);
      return supplierId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add supplier');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const findOrCreateSupplier = async (supplierName: string): Promise<string> => {
    // Cari supplier berdasarkan nama
    const existingSupplier = suppliers.find(s => 
      s.name.toLowerCase() === supplierName.toLowerCase()
    );
    
    if (existingSupplier) {
      return existingSupplier.supplier_id;
    }
    
    // Jika tidak ada, buat supplier baru
    const supplierId = await addSupplier({
      name: supplierName,
      phone: '',
      supplier: supplierName,
      address: ''
    });
    
    return supplierId;
  };

  return {
    suppliers,
    loading,
    error,
    addSupplier,
    findOrCreateSupplier
  };
};