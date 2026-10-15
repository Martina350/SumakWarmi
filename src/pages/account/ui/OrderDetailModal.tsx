import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { OrderTimeline } from '../../../widgets/order-timeline/ui/OrderTimeline.tsx';
import { Order, Payment } from '../../../shared/types/index.ts';
import { orderPaymentActions } from '../../../entities/order/index.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { getPublicOrderStatus } from '../../../shared/lib/statusLabels.ts';
import { Badge } from '../../../shared/ui/Badge.tsx';
import { Truck, UploadCloud, MapPin } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  payment?: Payment;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  payment,
}) => {
  const [newProofName, setNewProofName] = useState('');
  const statusInfo = getPublicOrderStatus(order.status, order.paymentStatus, order.shipmentStatus);

  const handleUploadCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProofName) return;
    orderPaymentActions.uploadTransferProof(order.id, newProofName, order.customerName);
    setNewProofName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Pedido · ${order.orderNumber}`}
      description={`Fecha de creación: ${new Date(order.createdAt).toLocaleDateString('es-EC')}`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-left py-2">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4]">
          <div>
            <span className="text-xs text-[#665D65]">Estado actual:</span>
            <div className="mt-1">
              <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#665D65]">Total del pedido:</span>
            <p className="text-base font-bold text-[#A91E50] font-data">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>

        {/* Carrier / Servientrega info */}
        <div className="p-4 bg-white rounded-2xl border border-[#E9DFE4] space-y-2 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-[#241B24]">
            <Truck className="w-4 h-4 text-[#D52C69]" />
            <span>Transporte: Servientrega Ecuador</span>
          </div>
          <p>
            <strong>Guía de rastreo:</strong>{' '}
            {order.shipmentStatus !== 'NOT_CREATED' ? (
              <span className="font-data font-semibold text-[#A91E50] bg-[#FBE7ED] px-2 py-0.5 rounded">
                SER-8492018
              </span>
            ) : (
              <span className="text-[#665D65]">Número de guía pendiente de asignación por bodega</span>
            )}
          </p>
          <div className="flex items-start gap-1.5 text-[#665D65] pt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#D52C69]" />
            <span>Destino: {order.shippingAddressSnapshot.mainStreet}, {order.shippingAddressSnapshot.city}</span>
          </div>
        </div>

        {/* If requires correction on transfer */}
        {order.paymentStatus === 'REQUIRES_CORRECTION' && (
          <div className="p-4 bg-[#FFF1D9] rounded-2xl border border-[#9A6200]/30 text-xs text-[#9A6200] space-y-2">
            <p className="font-bold">Se solicita corregir el comprobante de pago.</p>
            <p className="text-[#241B24]">Por favor vuelve a subir una fotografía o archivo legible de tu transferencia.</p>
            <form onSubmit={handleUploadCorrection} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="nuevo_comprobante.jpg"
                required
                value={newProofName}
                onChange={(e) => setNewProofName(e.target.value)}
                className="flex-1 h-10 px-3 bg-white border border-[#E9DFE4] rounded-xl text-xs text-[#241B24] focus:outline-none focus:ring-2 focus:ring-[#D52C69]/20 focus:border-[#D52C69]"
              />
              <Button type="submit" variant="primary" size="sm" icon={<UploadCloud className="w-3.5 h-3.5" />}>
                Subir corrección
              </Button>
            </form>
          </div>
        )}

        {/* Interactive Order Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#665D65] uppercase">Trazabilidad del pedido</h4>
          <OrderTimeline order={order} />
        </div>
      </div>
    </Modal>
  );
};
