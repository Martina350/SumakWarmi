import React, { useState } from 'react';
import { Order } from '../../../shared/types/index.ts';
import { orderPaymentActions } from '../../../entities/order/index.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { CheckCircle2, Building2, UploadCloud, ArrowRight, CreditCard, Clock } from 'lucide-react';

interface CheckoutConfirmationProps {
  order: Order;
  onNavigateOrders: () => void;
  onOpenPayPhoneModal: () => void;
}

export const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({
  order,
  onNavigateOrders,
  onOpenPayPhoneModal,
}) => {
  const [proofFileName, setProofFileName] = useState('');
  const [isUploaded, setIsUploaded] = useState(order.paymentStatus === 'PENDING_VERIFICATION');

  const handleUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFileName) return;
    orderPaymentActions.uploadTransferProof(order.id, proofFileName, order.customerName);
    setIsUploaded(true);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E9DEE3] p-8 text-center space-y-6 shadow-xs">
      <div className="w-16 h-16 rounded-full bg-[#287A56]/10 text-[#287A56] flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <span className="text-xs font-semibold text-[#7A3F65] uppercase tracking-wider">¡Pedido generado con éxito!</span>
        <h2 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#272329] mt-1">
          {order.orderNumber}
        </h2>
        <p className="text-xs text-[#716A70] mt-1.5 font-data">
          Total: {formatCurrency(order.total)} · Entregar a: {order.shippingAddressSnapshot.recipientName}
        </p>
      </div>

      {order.paymentMethod === 'TRANSFER' && (
        <div className="p-5 bg-[#F9F1F3] rounded-2xl border border-[#E9DEE3] text-left space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#7A3F65]">
            <Building2 className="w-4 h-4" />
            <span>Datos bancarios para tu transferencia</span>
          </div>
          <p><strong>Banco:</strong> Banco Pichincha (Cta. Corriente 2100849201)</p>
          <p><strong>Titular:</strong> Mercedes Cañizares · <strong>Monto:</strong> {formatCurrency(order.total)}</p>
          
          {isUploaded ? (
            <div className="p-3 bg-[#287A56]/10 border border-[#287A56]/20 rounded-xl text-[#287A56] flex items-center gap-2 font-semibold">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Comprobante recibido. Revisaremos el pago antes de preparar tu pedido.</span>
            </div>
          ) : (
            <form onSubmit={handleUploadProof} className="pt-2 border-t border-[#E9DEE3] space-y-2">
              <label className="font-bold text-[#272329] block">Adjuntar comprobante de depósito / transferencia:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: comprobante_pichincha_123.jpg"
                  required
                  value={proofFileName}
                  onChange={(e) => setProofFileName(e.target.value)}
                  className="flex-1 h-10 px-3 bg-white border border-[#E9DEE3] rounded-xl text-xs"
                />
                <Button type="submit" variant="primary" size="sm" icon={<UploadCloud className="w-4 h-4" />}>
                  Registrar archivo
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {order.paymentMethod === 'PAYPHONE' && order.paymentStatus !== 'APPROVED' && (
        <div className="p-5 bg-[#FFFDFB] rounded-2xl border border-[#E9DEE3] text-center space-y-3">
          <p className="text-xs text-[#716A70]">
            Para completar tu pedido mediante tarjeta, ejecuta la simulación en la pasarela PayPhone DEMO.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={<CreditCard className="w-4 h-4" />}
            onClick={onOpenPayPhoneModal}
          >
            Abrir simulador PayPhone
          </Button>
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="primary"
          size="md"
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={onNavigateOrders}
        >
          Ver en Mis Pedidos y Seguimiento
        </Button>
      </div>
    </div>
  );
};
