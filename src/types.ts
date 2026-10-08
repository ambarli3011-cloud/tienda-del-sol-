export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  image: string;
  isOnline: boolean;
  isPos: boolean;
  featured?: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
}

export type SalesChannel = 'pos' | 'online';
export type PaymentMethod = 'cash' | 'pos_card' | 'transfer' | 'online_card' | 'online_transfer';
export type OrderStatus = 'completed' | 'pending_pickup' | 'shipped';

export interface CustomerInfo {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  deliveryType?: 'pickup' | 'shipping';
}

export interface Order {
  id: string;
  orderNumber: string;
  channel: SalesChannel;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cashReceived?: number;
    changeGiven?: number;
    authCode?: string;
  };
  customer: CustomerInfo;
  status: OrderStatus;
  createdAt: string;
  cashierName?: string;
}

export type AppViewMode = 'dual' | 'online' | 'pos' | 'inventory';
