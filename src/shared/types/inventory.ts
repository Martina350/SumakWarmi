import { StockReservationStatus } from './models.ts';

export interface InventoryMovement {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  type: 'INITIAL' | 'ORDER_RESERVED' | 'ORDER_CONSUMED' | 'ORDER_RELEASED' | 'MANUAL_ADJUSTMENT';
  quantityDelta: number;
  resultingStock: number;
  reason: string;
  actor: string;
  createdAt: string;
}

export interface StockReservation {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  status: StockReservationStatus;
  expiresAt: string;
  createdAt: string;
}
