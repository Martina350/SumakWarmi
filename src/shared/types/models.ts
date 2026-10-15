export type UserRole = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'INACTIVE';

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_SHIPMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentStatus =
  | 'PENDING'
  | 'PENDING_VERIFICATION'
  | 'REQUIRES_CORRECTION'
  | 'APPROVED'
  | 'REJECTED'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type ShipmentStatus =
  | 'NOT_CREATED'
  | 'PENDING'
  | 'PREPARING'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERY_FAILED'
  | 'DELIVERED'
  | 'RETURNED';

export type StockReservationStatus =
  | 'ACTIVE'
  | 'CONSUMED'
  | 'RELEASED'
  | 'EXPIRED';

export type PaymentMethod = 'TRANSFER' | 'PAYPHONE';
