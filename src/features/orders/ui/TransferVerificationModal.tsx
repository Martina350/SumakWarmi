import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { Textarea } from '../../../shared/ui/Textarea.tsx';
import { orderPaymentActions } from '../../../entities/order/index.ts';
import { Order, Payment } from '../../../shared/types/index.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface TransferVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  payment?: Payment;
  currentActorName: string;
}

export const TransferVerificationModal: React.FC<TransferVerificationModalProps> = ({
  isOpen,
  onClose,
  order,
  payment,
  currentActorName,
}) => {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'APPROVE' | 'REQUIRE_CORRECTION' | 'REJECT'>('APPROVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    orderPaymentActions.verifyTransfer(order.id, action, currentActorName, comment);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Revisión de Transferencia · ${order.orderNumber}`}
      description="Auditoría manual de comprobante de pago bancario."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-[#F9F1F3] rounded-xl border border-[#E9DEE3] text-xs space-y-1">
          <div className="flex justify-between font-bold text-[#272329]">
            <span>Total esperado:</span>
            <span className="font-data text-[#7A3F65]">{formatCurrency(order.total)}</span>
          </div>
          <p><strong>Cliente:</strong> {order.customerName} ({order.customerEmail})</p>
          <div className="flex items-center gap-1.5 text-[#7A3F65] pt-1">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium">
              {payment?.proof?.fileName || 'comprobante_bancario_cliente.jpg'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#716A70] uppercase">Resolución operativa</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAction('APPROVE')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                action === 'APPROVE'
                  ? 'bg-[#287A56]/10 border-[#287A56] text-[#287A56]'
                  : 'border-[#E9DEE3] text-[#716A70] hover:bg-[#F9F1F3]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Aprobar pago</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('REQUIRE_CORRECTION')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                action === 'REQUIRE_CORRECTION'
                  ? 'bg-[#9A6414]/10 border-[#9A6414] text-[#9A6414]'
                  : 'border-[#E9DEE3] text-[#716A70] hover:bg-[#F9F1F3]'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Pedir corrección</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('REJECT')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                action === 'REJECT'
                  ? 'bg-[#B43D4C]/10 border-[#B43D4C] text-[#B43D4C]'
                  : 'border-[#E9DEE3] text-[#716A70] hover:bg-[#F9F1F3]'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Rechazar</span>
            </button>
          </div>
        </div>

        <Textarea
          label="Observaciones de auditoría (quedará registrado)"
          placeholder="Ej: Monto verificado en cuenta Banco Pichincha, número de movimiento #49102"
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Guardar resolución
          </Button>
        </div>
      </form>
    </Modal>
  );
};
