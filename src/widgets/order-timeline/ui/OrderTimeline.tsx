import React from 'react';
import { Order } from '../../../shared/types/index.ts';
import { formatDate } from '../../../shared/lib/formatters.ts';
import { CheckCircle2, Clock, Truck, Package, AlertCircle, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const isPaymentApproved = order.paymentStatus === 'APPROVED';
  const isPaymentRequiresCorrection = order.paymentStatus === 'REQUIRES_CORRECTION';
  const isPaymentRejected = order.paymentStatus === 'REJECTED';
  const isPaymentPending = order.paymentStatus === 'PENDING_VERIFICATION';

  const isPrepDone =
    order.shipmentStatus === 'PREPARING' ||
    order.shipmentStatus === 'DISPATCHED' ||
    order.shipmentStatus === 'IN_TRANSIT' ||
    order.shipmentStatus === 'DELIVERED';

  const isShippedDone =
    order.shipmentStatus === 'DISPATCHED' ||
    order.shipmentStatus === 'IN_TRANSIT' ||
    order.shipmentStatus === 'DELIVERED';

  const isDeliveredDone = order.shipmentStatus === 'DELIVERED';

  const steps = [
    {
      key: 'received',
      title: 'Pedido recibido',
      subtitle: 'Registrado en sistema',
      done: true,
      active: false,
      statusType: 'done' as const,
      icon: <Package className="w-4 h-4" />,
    },
    {
      key: 'payment',
      title: isPaymentApproved
        ? 'Pago verificado'
        : isPaymentRequiresCorrection
        ? 'Corrección requerida'
        : isPaymentRejected
        ? 'Pago rechazado'
        : isPaymentPending
        ? 'En verificación'
        : 'Esperando comprobante',
      subtitle: isPaymentApproved
        ? 'Abono confirmado'
        : isPaymentRequiresCorrection
        ? 'Revisar datos'
        : isPaymentRejected
        ? 'Pago denegado'
        : isPaymentPending
        ? 'Auditoría en curso'
        : 'Pendiente',
      done: isPaymentApproved,
      active: isPaymentPending || isPaymentRequiresCorrection || isPaymentRejected,
      statusType: isPaymentApproved
        ? ('done' as const)
        : isPaymentRejected
        ? ('error' as const)
        : isPaymentRequiresCorrection || isPaymentPending
        ? ('warning' as const)
        : ('pending' as const),
      icon: isPaymentApproved ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : isPaymentRejected ? (
        <XCircle className="w-4 h-4" />
      ) : isPaymentRequiresCorrection || isPaymentPending ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <Clock className="w-4 h-4" />
      ),
    },
    {
      key: 'prep',
      title: 'En preparación',
      subtitle: 'Control de calidad',
      done: isPrepDone,
      active: isPaymentApproved && !isShippedDone,
      statusType: isPrepDone ? ('done' as const) : isPaymentApproved ? ('active' as const) : ('pending' as const),
      icon: <Clock className="w-4 h-4" />,
    },
    {
      key: 'shipped',
      title: 'Enviado por Servientrega',
      subtitle: 'En ruta a destino',
      done: isShippedDone,
      active: isShippedDone && !isDeliveredDone,
      statusType: isShippedDone ? ('done' as const) : ('pending' as const),
      icon: <Truck className="w-4 h-4" />,
    },
    {
      key: 'delivered',
      title: 'Entregado',
      subtitle: 'Recepción confirmada',
      done: isDeliveredDone,
      active: false,
      statusType: isDeliveredDone ? ('done' as const) : ('pending' as const),
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Modern progressive timeline */}
      <div className="p-5 bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4]">
        <div className="flex items-center justify-between overflow-x-auto pb-2 relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E9DFE4] -z-0 hidden sm:block" />
          {steps.map((step) => {
            let circleClass = 'bg-white border-2 border-[#E9DFE4] text-[#665D65]';
            let labelClass = 'text-[#665D65]';

            if (step.statusType === 'done') {
              circleClass = 'bg-[#267A59] text-white shadow-xs';
              labelClass = 'text-[#267A59] font-semibold';
            } else if (step.statusType === 'active') {
              circleClass = 'bg-[#D52C69] text-white shadow-xs ring-4 ring-[#FBE7ED] animate-pulse';
              labelClass = 'text-[#A91E50] font-bold';
            } else if (step.statusType === 'warning') {
              circleClass = 'bg-[#9A6200] text-white shadow-xs ring-4 ring-[#FFF1D9]';
              labelClass = 'text-[#9A6200] font-bold';
            } else if (step.statusType === 'error') {
              circleClass = 'bg-[#B42336] text-white shadow-xs ring-4 ring-[#FDEBED]';
              labelClass = 'text-[#B42336] font-bold';
            }

            return (
              <div key={step.key} className="flex flex-col items-center text-center relative z-10 px-2 min-w-[110px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${circleClass}`}>
                  {step.icon}
                </div>
                <span className={`text-[11px] mt-2 leading-tight ${labelClass}`}>
                  {step.title}
                </span>
                <span className="text-[10px] text-[#665D65] mt-0.5 hidden sm:inline">
                  {step.subtitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audited events history */}
      <div className="p-4 bg-white rounded-2xl border border-[#E9DFE4] divide-y divide-[#E9DFE4]">
        <h5 className="text-xs font-bold text-[#665D65] uppercase pb-2.5">
          Historial de eventos y trazabilidad auditada
        </h5>
        {order.history.map((h) => (
          <div key={h.id} className="py-2.5 text-xs flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[#241B24]">{h.comment}</p>
              <p className="text-[11px] text-[#665D65] mt-0.5">
                Por: <strong>{h.actor}</strong> · Rol: {h.origin}
              </p>
            </div>
            <span className="text-[11px] text-[#665D65] font-data shrink-0">
              {formatDate(h.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
