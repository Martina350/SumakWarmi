import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { CreditCard, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

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
  const [simulationState, setSimulationState] = useState<'IDLE' | 'PROCESSING' | 'REJECTED_PREVIEW'>('IDLE');

  const handleAction = (success: boolean) => {
    setIsProcessing(true);
    setSimulationState('PROCESSING');
    setTimeout(() => {
      setIsProcessing(false);
      if (success) {
        onSimulateResult(true);
      } else {
        setSimulationState('REJECTED_PREVIEW');
      }
    }, 850);
  };

  const handleConfirmRejection = () => {
    onSimulateResult(false);
  };

  const handleResetAndRetry = () => {
    setSimulationState('IDLE');
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
        <div className="p-4 bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4] flex justify-between items-center">
          <div>
            <span className="text-xs text-[#665D65]">Pedido a pagar</span>
            <p className="text-sm font-bold text-[#241B24] font-data">{orderNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#665D65]">Total a cobrar</span>
            <p className="text-base font-bold text-[#A91E50] font-data">
              {formatCurrency(amount)}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-[#FFF1D9] border border-[#9A6200]/30 rounded-xl text-xs text-[#9A6200] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#9A6200] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Aviso de demostración:</strong> Este simulador no solicita ni almacena números reales de tarjeta, fecha de vencimiento ni código CVV. Selecciona una acción para comprobar la trazabilidad de eventos.
          </p>
        </div>

        {simulationState === 'REJECTED_PREVIEW' ? (
          <div className="p-4 bg-[#FDEBED] border border-[#B42336]/30 rounded-2xl text-xs text-[#B42336] space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <XCircle className="w-5 h-5 text-[#B42336]" />
              <span>Simulación: Transacción Rechazada por Emisor</span>
            </div>
            <p className="text-[#241B24]">
              El banco simulado reportó: <em>Fondos insuficientes o límite excedido</em>. Puedes reintentar la simulación o guardar el estado en el pedido.
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleResetAndRetry}
                className="flex-1"
              >
                Reintentar prueba
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmRejection}
                className="flex-1"
              >
                Finalizar como Rechazado
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full bg-[#267A59] hover:bg-[#1e6348]"
              isLoading={isProcessing}
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => handleAction(true)}
            >
              Simular Pago APROBADO (Éxito)
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full text-[#B42336] border-[#B42336]/30 hover:bg-[#FDEBED]"
              disabled={isProcessing}
              icon={<XCircle className="w-4 h-4" />}
              onClick={() => handleAction(false)}
            >
              Simular Pago RECHAZADO (Fondos insuficientes)
            </Button>
          </div>
        )}

        <div className="pt-2 border-t border-[#E9DFE4] flex items-center justify-center gap-1.5 text-[11px] text-[#665D65]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#267A59]" />
          <span>Simulador conforme a políticas de seguridad PCI-DSS DEMO</span>
        </div>
      </div>
    </Modal>
  );
};
