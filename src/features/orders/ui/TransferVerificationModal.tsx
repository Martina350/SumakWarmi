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
        <div className="p-3.5 bg-[#FFF7F9] rounded-xl border border-[#E9DFE4] text-xs space-y-1">
          <div className="flex justify-between font-bold text-[#241B24]">
            <span>Total esperado:</span>
            <span className="font-data text-[#A91E50]">{formatCurrency(order.total)}</span>
          </div>
          <p><strong>Cliente:</strong> {order.customerName} ({order.customerEmail})</p>
          <div className="flex items-center gap-1.5 text-[#D52C69] pt-1">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-semibold">
              {payment?.proof?.fileName || 'comprobante_bancario_cliente.jpg'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#665D65] uppercase">Resolución operativa</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAction('APPROVE')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                action === 'APPROVE'
                  ? 'bg-[#E8F3EE] border-[#267A59] text-[#267A59] shadow-2xs ring-1 ring-[#267A59]'
                  : 'border-[#E9DFE4] text-[#665D65] hover:bg-[#FFF7F9]'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-[#267A59]" />
              <span>Aprobar pago</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('REQUIRE_CORRECTION')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                action === 'REQUIRE_CORRECTION'
                  ? 'bg-[#FFF1D9] border-[#9A6200] text-[#9A6200] shadow-2xs ring-1 ring-[#9A6200]'
                  : 'border-[#E9DFE4] text-[#665D65] hover:bg-[#FFF7F9]'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-[#9A6200]" />
              <span>Pedir corrección</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('REJECT')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                action === 'REJECT'
                  ? 'bg-[#FDEBED] border-[#B42336] text-[#B42336] shadow-2xs ring-1 ring-[#B42336]'
                  : 'border-[#E9DFE4] text-[#665D65] hover:bg-[#FFF7F9]'
              }`}
            >
              <XCircle className="w-4 h-4 text-[#B42336]" />
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
