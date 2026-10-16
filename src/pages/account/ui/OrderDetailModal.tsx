import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Order, Payment } from '../../../shared/types/index.ts';
import { useBusinessStore } from '../../../shared/domain/businessStore.ts';
import { operations } from '../../../shared/domain/operations.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import {
  getPublicOrderStatus,
  getShipmentStatusLabel,
} from '../../../shared/lib/statusLabels.ts';
import { OrderTimeline } from '../../../widgets/order-timeline/ui/OrderTimeline.tsx';
import { CustomerPaymentTools } from '../../../features/checkout/ui/CustomerPaymentTools.tsx';
export function OrderDetailModal({
  isOpen,
  onClose,
  order: initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  payment?: Payment;
}) {
  const state = useBusinessStore();
  const order = state.orders.find((o) => o.id === initial.id) || initial;
  const shipment = state.shipments.find((s) => s.orderId === order.id);
  const [error, setError] = useState('');
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pedido ${order.orderNumber}`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-left">
        <div className="p-4 bg-[#FFF7F9] rounded-xl">
          <strong>
            {
              getPublicOrderStatus(
                order.status,
                order.paymentStatus,
                order.shipmentStatus,
              ).label
            }
          </strong>
          <p className="text-sm mt-2">Total: {formatCurrency(order.total)}</p>
          {order.incident && (
            <p className="text-xs text-[#B42336] mt-2">
              Incidencia: {order.incident}
            </p>
          )}
        </div>
        <div className="space-y-2">
          {order.items.map((it) => (
            <div className="flex justify-between text-xs" key={it.variantId}>
              <span>
                {it.productName} · {it.variantName} × {it.quantity}
              </span>
              <strong>{formatCurrency(it.subtotal)}</strong>
            </div>
          ))}
        </div>
        <CustomerPaymentTools orderId={order.id} />
        <div className="p-4 border border-[#E9DFE4] rounded-xl space-y-2 text-xs">
          <strong>Seguimiento interno simulado · Servientrega</strong>
          <p>
            Guía ficticia: {shipment?.trackingNumber || 'Aún sin registrar'}
          </p>
          <p>{getShipmentStatusLabel(order.shipmentStatus).label}</p>
          <p>
            {order.shippingAddressSnapshot.mainStreet},{' '}
            {order.shippingAddressSnapshot.city}
          </p>
        </div>
        <OrderTimeline order={order} />
        {['PAYMENT_PENDING', 'ON_HOLD'].includes(order.status) &&
          order.paymentStatus !== 'APPROVED' && (
            <button
              className="text-xs underline text-[#A91E50]"
              onClick={() => {
                const reason = window.prompt(
                  'Motivo de cancelación del pedido',
                );
                if (!reason) return;
                try {
                  operations.cancel(order.id, reason, order.version!);
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              Cancelar pedido sin pagar y liberar reserva
            </button>
          )}
        {error && (
          <p role="alert" className="text-xs text-[#B42336]">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
