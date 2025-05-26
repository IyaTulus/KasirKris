// types/index.ts
export interface Supplier {
  supplier_id: string;
  name: string;
  phone: string;
  supplier: string;
  address: string;
  created_at: string;
}

export interface Product {
  product_id: string;
  name: string;
  hargaBeli: number;
  hargaJual: number;
  stock: number;
  created_at: string;
}

export interface User {
  user_id: string;
  name: string;
  email?: string;
  created_at: string;
}

export interface Purchase {
  purchase_id: string;
  supplier_id: string;
  user_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_debt: number;
  status: boolean; // true = lunas, false = belum lunas
  sale_date: string;
  created_at: string;
}

export interface ItemPurchase {
  subCollection_id: string;
  purchase_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface PurchaseDetail extends Purchase {
  supplier_name?: string;
  items: ItemPurchase[];
}

export interface PaymentHistory {
  payment_id: string;
  purchase_id: string;
  amount: number;
  payment_date: string;
  created_at: string;
}