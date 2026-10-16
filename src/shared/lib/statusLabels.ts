import { OrderStatus, PaymentStatus, ShipmentStatus } from '../types/models.ts';

export type StatusTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

export function getPublicOrderStatus(
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
  shipmentStatus: ShipmentStatus
): { label: string; tone: StatusTone } {
  if (orderStatus === 'CANCELLED') return { label: 'Cancelado', tone: 'danger' };
  if (orderStatus === 'EXPIRED') return { label: 'Expirado', tone: 'danger' };
  if (shipmentStatus === 'DELIVERY_FAILED' || shipmentStatus === 'INCIDENT') return { label: 'Incidencia de entrega', tone: 'danger' };
  if (orderStatus === 'RETURNED') return { label: 'Devuelto', tone: 'warning' };
  if (shipmentStatus === 'LABEL_REGISTERED') return { label: 'Gestionando entrega', tone: 'brand' };
  if (shipmentStatus === 'HANDED_TO_CARRIER') return { label: 'En camino', tone: 'brand' };
  if (paymentStatus === 'UNDER_REVIEW') return { label: 'Pago en revisión', tone: 'warning' };
  if (shipmentStatus === 'DELIVERED') return { label: 'Entregado', tone: 'success' };
  if (shipmentStatus === 'IN_TRANSIT') return { label: 'En camino', tone: 'brand' };
  if (shipmentStatus === 'DISPATCHED') return { label: 'Enviado', tone: 'brand' };
  if (shipmentStatus === 'PREPARING') return { label: 'Preparando pedido', tone: 'warning' };
  if (paymentStatus === 'REQUIRES_CORRECTION') return { label: 'Necesitamos información', tone: 'warning' };
  if (paymentStatus === 'PENDING_VERIFICATION') return { label: 'Pago por verificar', tone: 'warning' };
  if (paymentStatus === 'APPROVED' || orderStatus === 'CONFIRMED') return { label: 'Pago aprobado', tone: 'success' };
  if (paymentStatus === 'REJECTED' || paymentStatus === 'FAILED') return { label: 'Pago rechazado', tone: 'danger' };
  return { label: 'Esperando pago', tone: 'neutral' };
}

export function getPaymentStatusLabel(status: PaymentStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case 'APPROVED': return { label: 'Aprobado', tone: 'success' };
    case 'PENDING_VERIFICATION': return { label: 'Por verificar', tone: 'warning' };
    case 'REQUIRES_CORRECTION': return { label: 'Requiere corrección', tone: 'warning' };
    case 'PENDING': return { label: 'Pendiente', tone: 'neutral' };
    case 'REJECTED': return { label: 'Rechazado', tone: 'danger' };
    case 'FAILED': return { label: 'Fallido', tone: 'danger' };
    case 'REFUNDED': return { label: 'Reembolsado', tone: 'neutral' };
    case 'UNDER_REVIEW': return { label: 'En revisión', tone: 'warning' };
    case 'PROCESSING': return { label: 'Procesando', tone: 'warning' };
    case 'CANCELLED': return { label: 'Intento cancelado', tone: 'neutral' };
    case 'PARTIALLY_REFUNDED': return { label: 'Reembolso parcial', tone: 'neutral' };
    case 'REFUND_PENDING': return { label: 'Reembolso pendiente', tone: 'warning' };
    default: return { label: status, tone: 'neutral' };
  }
}

export function getShipmentStatusLabel(status: ShipmentStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case 'DELIVERED': return { label: 'Entregado', tone: 'success' };
    case 'IN_TRANSIT': return { label: 'En tránsito', tone: 'brand' };
    case 'DISPATCHED': return { label: 'Despachado', tone: 'brand' };
    case 'PREPARING': return { label: 'En preparación', tone: 'warning' };
    case 'PENDING': return { label: 'Pendiente', tone: 'neutral' };
    case 'DELIVERY_FAILED': return { label: 'Entrega fallida', tone: 'danger' };
    case 'RETURNED': return { label: 'Devuelto', tone: 'danger' };
    case 'LABEL_REGISTERED': return { label: 'Guía demo registrada', tone: 'brand' };
    case 'HANDED_TO_CARRIER': return { label: 'Entregado al transportista', tone: 'brand' };
    case 'INCIDENT': return { label: 'Incidencia', tone: 'danger' };
    case 'RETURNING': return { label: 'En devolución', tone: 'warning' };
    default: return { label: 'Sin guía', tone: 'neutral' };
  }
}
