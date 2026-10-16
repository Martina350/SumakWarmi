import { OrderStatus, PaymentStatus, ShipmentStatus } from './models.ts';
import { Address } from './user.ts';

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  eventType: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  createdAt: string;
  actor: string;
  origin: 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'SYSTEM' | 'MOCK_PROVIDER';
  comment: string;
  isPublic: boolean;
}

export interface Order {
  version?: number;
  salesAttributionSellerId?: string;
  preparedItems?: Record<string, number>;
  packed?: boolean;
  incident?: string;
  bankInstructionsSnapshot?: string;
  subtotalCents?: number;
  shippingCents?: number;
  totalCents?: number;
  refundedCents?: number;
  paymentApprovedAt?: string;
  id: string;
  orderNumber: string; // e.g. SW-000101
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
  shippingAddressSnapshot: Address;
  assignedSellerId?: string;
  assignedSellerName?: string;
  paymentMethod: 'TRANSFER' | 'PAYPHONE';
  createdAt: string;
  updatedAt: string;
  history: OrderStatusHistory[];
}
