export type UserRole = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'INACTIVE' | 'ARCHIVED';

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_SHIPMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED' | 'DISPATCHED' | 'ON_HOLD' | 'RETURN_REQUESTED' | 'RETURNED' | 'CLOSED_WITH_INCIDENT';

export type PaymentStatus =
  | 'PENDING'
  | 'PENDING_VERIFICATION'
  | 'REQUIRES_CORRECTION'
  | 'APPROVED'
  | 'REJECTED'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED' | 'UNDER_REVIEW' | 'PROCESSING' | 'CANCELLED';

export type ShipmentStatus =
  | 'NOT_CREATED'
  | 'PENDING'
  | 'PREPARING'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERY_FAILED'
  | 'DELIVERED'
  | 'RETURNED' | 'LABEL_REGISTERED' | 'HANDED_TO_CARRIER' | 'INCIDENT' | 'RETURNING';

export type StockReservationStatus =
  | 'ACTIVE'
  | 'CONSUMED'
  | 'RELEASED'
  | 'EXPIRED' | 'HELD' | 'COMMITTED';

export type PaymentMethod = 'TRANSFER' | 'PAYPHONE';
