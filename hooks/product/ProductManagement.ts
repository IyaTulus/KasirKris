import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from '../../FirebaseConfig';
import { useEffect, useState } from 'react';

export const useProductManagement = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const productRef = ref(database, 'tb_product');
        const unsubscribe = onValue(productRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const productList = Object.entries(data).map(([key, value]: [string, any]) => ({
            ...value,
            key,
            }));
            setProducts(productList);
        } else {
            setProducts([]);
        }
        setLoading(false);
        });
    
        return () => unsubscribe();
    }, []);
    
    const createProduct = async (productData: any) => {
        const newRef = push(ref(database, 'tb_product'));
        await set(newRef, { ...productData, product_id: newRef.key });
    };
    
    const deleteProduct = async (productKey: string) => {
        await remove(ref(database, `tb_product/${productKey}`));
    };
    
    const editProduct = async (productKey: string, newData: any) => {
        await update(ref(database, `tb_product/${productKey}`), newData);
    };
    
    return {
        products,
        loading,
        createProduct,
        deleteProduct,
        editProduct,
    };
}