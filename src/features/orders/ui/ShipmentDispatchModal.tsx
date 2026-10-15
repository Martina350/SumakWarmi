import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { orderShipmentActions } from '../../../entities/order/index.ts';
import { Order } from '../../../shared/types/index.ts';
import { Truck, MapPin } from 'lucide-react';

interface ShipmentDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  currentActorName: string;
}

export const ShipmentDispatchModal: React.FC<ShipmentDispatchModalProps> = ({
  isOpen,
  onClose,
  order,
  currentActorName,
}) => {
  const [trackingNumber, setTrackingNumber] = useState(`SER-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [notes, setNotes] = useState('Entregado en agencia Servientrega');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) return;
    orderShipmentActions.createOrUpdateShipment(order.id, trackingNumber, currentActorName, notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Despacho Servientrega · ${order.orderNumber}`}
      description="Registro manual asistido de número de guía y entrega a transportista."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-[#F9F1F3] rounded-xl border border-[#E9DEE3] text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#7A3F65]">
            <MapPin className="w-3.5 h-3.5" />
            <span>Destino: {order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.province}</span>
          </div>
          <p><strong>Destinatario:</strong> {order.shippingAddressSnapshot.recipientName} ({order.shippingAddressSnapshot.phone})</p>
          <p><strong>Dirección:</strong> {order.shippingAddressSnapshot.mainStreet}</p>
        </div>

        <Input
          label="Transportista asignado"
          disabled
          value="Servientrega Ecuador (Manual asistido)"
        />

        <Input
          label="Número de guía oficial / comprobante"
          required
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Ej: SER-8492018"
        />

        <Input
          label="Notas del despacho / Agencia de entrega"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={<Truck className="w-4 h-4" />}>
            Registrar despacho y notificar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
