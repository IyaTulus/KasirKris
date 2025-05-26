// hooks/usePurchases.ts
import { useState, useEffect } from 'react';
import { ref, push, set, onValue, off, update, remove } from 'firebase/database';
import { database } from '../../FirebaseConfig';
import { Purchase, ItemPurchase, PurchaseDetail, PaymentHistory } from './index';
import { useSuppliers } from './SuplayersPurchase';
import { useProducts } from './ProductPurchase';

interface PurchaseItem {
  productName: string;
  price: number;
  quantity: number;
  hargaBeli: number;
  hargaJual: number;
}

interface CreatePurchaseData {
  supplierName: string;
  userId: string;
  items: PurchaseItem[];
  paidAmount: number;
  saleDate: string;
}

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { findOrCreateSupplier, suppliers } = useSuppliers();
  const { findOrCreateProduct } = useProducts();

  // Function to get supplier name by ID
  const getSupplierName = async (supplierId: string): Promise<string> => {
    return new Promise((resolve) => {
      const supplierRef = ref(database, `tb_suppliers/${supplierId}`);
      onValue(supplierRef, (snapshot) => {
        const data = snapshot.val();
        resolve(data?.name || 'Unknown Supplier');
      }, { onlyOnce: true });
    });
  };

  useEffect(() => {
    const purchasesRef = ref(database, 'tb_purchases');
    
    const unsubscribe = onValue(purchasesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const purchasesList = Object.keys(data).map(key => ({
          purchase_id: key,
          ...data[key]
        }));
        setPurchases(purchasesList);
        
        // Load purchase details with items and supplier names
        const detailsPromises = purchasesList.map(async (purchase) => {
          const [items, supplierName] = await Promise.all([
            getPurchaseItems(purchase.purchase_id),
            getSupplierName(purchase.supplier_id)
          ]);
          
          return {
            ...purchase,
            supplier_name: supplierName,
            items
          };
        });
        
        const details = await Promise.all(detailsPromises);
        setPurchaseDetails(details);
      } else {
        setPurchases([]);
        setPurchaseDetails([]);
      }
    }, (error) => {
      setError(error.message);
    });

    return () => off(purchasesRef, 'value', unsubscribe);
  }, []); // Removed suppliers dependency since we're fetching supplier names directly

  const getPurchaseItems = async (purchaseId: string): Promise<ItemPurchase[]> => {
    return new Promise((resolve) => {
      const itemsRef = ref(database, 'tb_itemPurchases');
      onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const items = Object.keys(data)
            .filter(key => data[key].purchase_id === purchaseId)
            .map(key => ({
              subCollection_id: key,
              ...data[key]
            }));
          resolve(items);
        } else {
          resolve([]);
        }
      }, { onlyOnce: true });
    });
  };

  const createPurchase = async (purchaseData: CreatePurchaseData) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Find or create supplier
      const supplierId = await findOrCreateSupplier(purchaseData.supplierName);

      // 2. Calculate total amount
      const totalAmount = purchaseData.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );

      // 3. Create purchase record
      const purchasesRef = ref(database, 'tb_purchases');
      const newPurchaseRef = push(purchasesRef);
      const purchaseId = newPurchaseRef.key!;

      const remainingDebt = totalAmount - purchaseData.paidAmount;
      const status = remainingDebt <= 0;

      const newPurchase: Omit<Purchase, 'purchase_id'> = {
        supplier_id: supplierId,
        user_id: purchaseData.userId,
        total_amount: totalAmount,
        paid_amount: purchaseData.paidAmount,
        remaining_debt: remainingDebt,
        status,
        sale_date: purchaseData.saleDate,
        created_at: new Date().toISOString()
      };

      await set(newPurchaseRef, newPurchase);

      // 4. Create item purchases and update/create products
      const itemPromises = purchaseData.items.map(async (item) => {
        // Find or create product and update stock
        const productId = await findOrCreateProduct(
          item.productName,
          item.hargaBeli,
          item.hargaJual,
          item.quantity
        );

        // Create item purchase record
        const itemPurchasesRef = ref(database, 'tb_itemPurchases');
        const newItemRef = push(itemPurchasesRef);

        const itemPurchase: Omit<ItemPurchase, 'subCollection_id'> = {
          purchase_id: purchaseId,
          product_id: productId,
          product_name: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        };

        await set(newItemRef, itemPurchase);
      });

      await Promise.all(itemPromises);

      // 5. Record initial payment if any
      if (purchaseData.paidAmount > 0) {
        await recordPayment(purchaseId, purchaseData.paidAmount);
      }

      return purchaseId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async (purchaseId: string, amount: number) => {
    try {
      setLoading(true);
      
      // Record payment history
      const paymentsRef = ref(database, 'tb_payments');
      const newPaymentRef = push(paymentsRef);
      
      const payment: Omit<PaymentHistory, 'payment_id'> = {
        purchase_id: purchaseId,
        amount,
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      await set(newPaymentRef, payment);

      // Update purchase paid amount and remaining debt
      const purchase = purchases.find(p => p.purchase_id === purchaseId);
      if (purchase) {
        const newPaidAmount = purchase.paid_amount + amount;
        const newRemainingDebt = purchase.total_amount - newPaidAmount;
        const newStatus = newRemainingDebt <= 0;

        const purchaseRef = ref(database, `tb_purchases/${purchaseId}`);
        await update(purchaseRef, {
          paid_amount: newPaidAmount,
          remaining_debt: newRemainingDebt,
          status: newStatus
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentHistory = async (purchaseId: string): Promise<PaymentHistory[]> => {
    return new Promise((resolve) => {
      const paymentsRef = ref(database, 'tb_payments');
      onValue(paymentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const payments = Object.keys(data)
            .filter(key => data[key].purchase_id === purchaseId)
            .map(key => ({
              payment_id: key,
              ...data[key]
            }))
            .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
          resolve(payments);
        } else {
          resolve([]);
        }
      }, { onlyOnce: true });
    });
  };

  const updatePurchase = async (purchaseId: string, updates: Partial<Purchase>) => {
    try {
      setLoading(true);
      const purchaseRef = ref(database, `tb_purchases/${purchaseId}`);
      await update(purchaseRef, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update purchase');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePurchase = async (purchaseId: string) => {
    try {
      setLoading(true);
      
      // Delete purchase items first
      const items = await getPurchaseItems(purchaseId);
      const deleteItemPromises = items.map(item => {
        const itemRef = ref(database, `tb_itemPurchases/${item.subCollection_id}`);
        return remove(itemRef);
      });
      await Promise.all(deleteItemPromises);
      
      // Delete payment history
      const payments = await getPaymentHistory(purchaseId);
      const deletePaymentPromises = payments.map(payment => {
        const paymentRef = ref(database, `tb_payments/${payment.payment_id}`);
        return remove(paymentRef);
      });
      await Promise.all(deletePaymentPromises);
      
      // Delete purchase
      const purchaseRef = ref(database, `tb_purchases/${purchaseId}`);
      await remove(purchaseRef);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete purchase');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPendingPurchases = () => {
    return purchaseDetails.filter(purchase => !purchase.status);
  };

  const getCompletedPurchases = () => {
    return purchaseDetails.filter(purchase => purchase.status);
  };

  // Helper function to refresh purchase details (useful for manual refresh)
  const refreshPurchaseDetails = async () => {
    if (purchases.length > 0) {
      const detailsPromises = purchases.map(async (purchase) => {
        const [items, supplierName] = await Promise.all([
          getPurchaseItems(purchase.purchase_id),
          getSupplierName(purchase.supplier_id)
        ]);
        
        return {
          ...purchase,
          supplier_name: supplierName,
          items
        };
      });
      
      const details = await Promise.all(detailsPromises);
      setPurchaseDetails(details);
    }
  };

  return {
    purchases,
    purchaseDetails,
    loading,
    error,
    createPurchase,
    recordPayment,
    getPaymentHistory,
    updatePurchase,
    deletePurchase,
    getPendingPurchases,
    getCompletedPurchases,
    getPurchaseItems,
    refreshPurchaseDetails
  };
};