import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Order, Payment } from '../../../shared/types/index.ts';
import { useBusinessStore } from '../../../shared/domain/businessStore.ts';
import { operations } from '../../../shared/domain/operations.ts';
import { formatCurrency, formatDate } from '../../../shared/lib/formatters.ts';
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

  const statusInfo = getPublicOrderStatus(
    order.status,
    order.paymentStatus,
    order.shipmentStatus,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pedido ${order.orderNumber}`}
      description={`Realizado el ${formatDate(order.createdAt)} · Consulta el estado, productos y trazabilidad.`}
      maxWidth="lg"
    >
      <div className="space-y-5 text-left">
        {/* Status & Total Banner */}
        <div className="p-4 sm:p-5 bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4] flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-[#665D65] block uppercase tracking-wider">
              Estado general
            </span>
            <span className="text-base sm:text-lg font-bold text-[#A91E50]">
              {statusInfo.label}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-[#665D65] block uppercase tracking-wider">
              Total del pedido
            </span>
            <span className="text-lg sm:text-xl font-bold text-[#241B24] font-data">
              {formatCurrency(order.total)}
            </span>
          </div>
          {order.incident && (
            <div className="w-full pt-2.5 mt-1 border-t border-[#E9DFE4] text-xs text-[#B42336] font-medium flex items-center gap-1.5">
              <span>Incidencia reportada: {order.incident}</span>
            </div>
          )}
        </div>

        {/* Product items */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9DFE4] space-y-3">
          <span className="text-xs font-bold text-[#665D65] uppercase tracking-wider block">
            Productos ({order.items.reduce((acc, it) => acc + it.quantity, 0)})
          </span>
          <div className="divide-y divide-[#E9DFE4]">
            {order.items.map((it) => (
              <div
                className="py-2.5 flex justify-between items-center text-xs sm:text-sm gap-2"
                key={it.variantId}
              >
                <span className="text-[#241B24]">
                  {it.productName} ·{' '}
                  <span className="text-[#665D65]">
                    {it.variantName} × {it.quantity}
                  </span>
                </span>
                <strong className="text-[#241B24] font-data shrink-0">
                  {formatCurrency(it.subtotal)}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Payment Tools */}
        <CustomerPaymentTools orderId={order.id} />

        {/* Servientrega Delivery Info */}
        <div className="p-4 sm:p-5 bg-white border border-[#E9DFE4] rounded-2xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <strong className="text-[#241B24] font-bold text-sm">
              Seguimiento Servientrega
            </strong>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FBE7ED] text-[#A91E50]">
              {getShipmentStatusLabel(order.shipmentStatus).label}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#665D65] pt-1">
            <div>
              <span className="block text-[11px] text-[#8C828A]">Guía de transporte:</span>
              <span className="font-data font-semibold text-[#241B24]">
                {shipment?.trackingNumber || 'Aún sin registrar'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-[#8C828A]">Dirección de entrega:</span>
              <span className="text-[#241B24]">
                {order.shippingAddressSnapshot.mainStreet},{' '}
                {order.shippingAddressSnapshot.city}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline & Audit */}
        <OrderTimeline order={order} />

        {['PAYMENT_PENDING', 'ON_HOLD'].includes(order.status) &&
          order.paymentStatus !== 'APPROVED' && (
            <div className="pt-2">
              <button
                className="text-xs underline text-[#A91E50] hover:text-[#D52C69] cursor-pointer"
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
            </div>
          )}
        {error && (
          <p role="alert" className="text-xs text-[#B42336] font-medium">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
