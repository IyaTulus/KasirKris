// hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { ref, push, set, onValue, off, update } from 'firebase/database';
import { database } from '../../FirebaseConfig';
import { Product } from '../purchases/index';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productsRef = ref(database, 'tb_product');
    
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList = Object.keys(data).map(key => ({
          product_id: key,
          ...data[key]
        }));
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    }, (error) => {
      setError(error.message);
    });

    return () => off(productsRef, 'value', unsubscribe);
  }, []);

  const addProduct = async (productData: Omit<Product, 'product_id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const productsRef = ref(database, 'tb_product');
      const newProductRef = push(productsRef);
      
      // Get the generated key
      const productId = newProductRef.key;
      if (!productId) {
        throw new Error('Failed to generate product ID');
      }
      
      const newProduct: Product = {
        product_id: productId, // Include the product_id in the object
        ...productData,
        created_at: new Date().toISOString()
      };
      
      await set(newProductRef, newProduct);
      return productId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProductStock = async (productId: string, additionalStock: number) => {
    try {
      const product = products.find(p => p.product_id === productId);
      if (!product) throw new Error('Product not found');
      
      const productRef = ref(database, `tb_product/${productId}`);
      await update(productRef, {
        stock: product.stock + additionalStock
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      throw err;
    }
  };

  const findOrCreateProduct = async (
    productName: string, 
    hargaBeli: number, 
    hargaJual: number, 
    quantity: number
  ): Promise<string> => {
    // Cari produk berdasarkan nama
    const existingProduct = products.find(p => 
      p.name.toLowerCase() === productName.toLowerCase()
    );
    
    if (existingProduct) {
      // Update stock jika produk sudah ada
      await updateProductStock(existingProduct.product_id, quantity);
      return existingProduct.product_id;
    }
    
    // Jika tidak ada, buat produk baru
    const productId = await addProduct({
      name: productName,
      hargaBeli,
      hargaJual,
      stock: quantity
    });
    
    return productId;
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProductStock,
    findOrCreateProduct
  };
};