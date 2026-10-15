import { ShipmentStatus } from './models.ts';

export interface ShipmentHistory {
  id: string;
  shipmentId: string;
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  actor: string;
  comment: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: 'Servientrega';
  trackingNumber?: string;
  status: ShipmentStatus;
  cost: number;
  dispatchedAt?: string;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;
  notes?: string;
  history: ShipmentHistory[];
  createdAt: string;
  updatedAt: string;
}
