import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { CreditCard, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface PayPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amount: number;
  onSimulateResult: (success: boolean) => void;
}

export const PayPhoneModal: React.FC<PayPhoneModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  amount,
  onSimulateResult,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = (success: boolean) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSimulateResult(success);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pasarela PayPhone · Simulación de Pago"
      description="Entorno de prueba controlado sin conexión real con redes bancarias."
      maxWidth="md"
    >
      <div className="space-y-5 py-2">
        <div className="p-4 bg-[#F9F1F3] rounded-xl border border-[#E9DEE3] flex justify-between items-center">
          <div>
            <span className="text-xs text-[#716A70]">Pedido a pagar</span>
            <p className="text-sm font-bold text-[#272329] font-data">{orderNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#716A70]">Total a cobrar</span>
            <p className="text-base font-bold text-[#7A3F65] font-data">
              {formatCurrency(amount)}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Aviso de demostración:</strong> No ingreses datos reales de tarjeta. Selecciona uno de los resultados simulados para comprobar la reacción del sistema y del historial.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full bg-[#287A56] hover:bg-[#1f6244]"
            isLoading={isProcessing}
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => handleAction(true)}
          >
            Simular Pago APROBADO (Éxito)
          </Button>

          <Button
            variant="outline"
            size="md"
            className="w-full text-[#B43D4C] border-[#B43D4C]/30 hover:bg-[#B43D4C]/10"
            disabled={isProcessing}
            icon={<XCircle className="w-4 h-4" />}
            onClick={() => handleAction(false)}
          >
            Simular Pago RECHAZADO (Fondos insuficientes)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
