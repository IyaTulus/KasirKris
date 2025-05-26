import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from '../../FirebaseConfig';
import { useEffect, useState } from 'react';

export const useSupplierManagement = () => {
    const [suppliers, setSupplier] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const supplierRef = ref(database, 'tb_suppliers');
        const unsubscribe = onValue(supplierRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const supplierList = Object.entries(data).map(([key, value]: [string, any]) => ({
            ...value,
            key,
            }));
            setSupplier(supplierList);
        } else {
            setSupplier([]);
        }
        setLoading(false);
        });
    
        return () => unsubscribe();
    }, []);
    
    const createSupplier = async (supplierData: any) => {
        const newRef = push(ref(database, 'tb_suppliers'));
        await set(newRef, { ...supplierData, supplier_id: newRef.key });
    };
    
    const deleteSupplier = async (supplierKey: string) => {
        await remove(ref(database, `tb_suppliers/${supplierKey}`));
    };
    
    const editSupplier = async (supplierKey: string, newData: any) => {
        await update(ref(database, `tb_suppliers/${supplierKey}`), newData);
    };
    
    return {
        suppliers,
        loading,
        createSupplier,
        deleteSupplier,
        editSupplier,
    };
}