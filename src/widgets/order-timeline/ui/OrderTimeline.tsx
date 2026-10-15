import React from 'react';
import { Order } from '../../../shared/types/index.ts';
import { formatDate } from '../../../shared/lib/formatters.ts';
import { CheckCircle2, Clock, Truck, Package, AlertCircle } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const steps = [
    { key: 'received', title: 'Pedido recibido', done: true, icon: <Package className="w-4 h-4" /> },
    {
      key: 'payment',
      title: order.paymentStatus === 'APPROVED' ? 'Pago verificado' : order.paymentStatus === 'REQUIRES_CORRECTION' ? 'Corrección requerida' : 'Esperando verificación',
      done: order.paymentStatus === 'APPROVED',
      active: order.paymentStatus === 'PENDING_VERIFICATION' || order.paymentStatus === 'REQUIRES_CORRECTION',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      key: 'prep',
      title: 'En preparación',
      done: order.shipmentStatus === 'PREPARING' || order.shipmentStatus === 'DISPATCHED' || order.shipmentStatus === 'IN_TRANSIT' || order.shipmentStatus === 'DELIVERED',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      key: 'shipped',
      title: 'Enviado con Servientrega',
      done: order.shipmentStatus === 'DISPATCHED' || order.shipmentStatus === 'IN_TRANSIT' || order.shipmentStatus === 'DELIVERED',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      key: 'delivered',
      title: 'Entregado',
      done: order.shipmentStatus === 'DELIVERED',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between overflow-x-auto pb-2 relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E9DEE3] -z-0 hidden sm:block" />
        {steps.map((step) => (
          <div key={step.key} className="flex flex-col items-center text-center relative z-10 px-2 min-w-[100px]">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                step.done
                  ? 'bg-[#287A56] text-white shadow-xs'
                  : step.active
                  ? 'bg-[#9A6414] text-white animate-pulse'
                  : 'bg-white border-2 border-[#E9DEE3] text-[#716A70]'
              }`}
            >
              {step.icon}
            </div>
            <span className={`text-[11px] font-semibold mt-2 leading-tight ${step.done ? 'text-[#287A56]' : step.active ? 'text-[#9A6414]' : 'text-[#716A70]'}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <div className="p-3 bg-white rounded-xl border border-[#E9DEE3] divide-y divide-[#E9DEE3]">
        <h5 className="text-xs font-bold text-[#716A70] uppercase pb-2">Historial de eventos auditados</h5>
        {order.history.map((h) => (
          <div key={h.id} className="py-2.5 text-xs flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[#272329]">{h.comment}</p>
              <p className="text-[11px] text-[#716A70] mt-0.5">
                Por: {h.actor} · Rol: {h.origin}
              </p>
            </div>
            <span className="text-[11px] text-[#716A70] font-data shrink-0">
              {formatDate(h.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
