import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
export function PayPhoneModal({
  isOpen,
  onClose,
  orderNumber,
  amount,
  onSimulateResult,
  onSimulateCancelled,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amount: number;
  onSimulateResult: (success: boolean) => void;
  onSimulateCancelled?: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const simulate = (success: boolean) => {
    if (processing) return;
    setProcessing(true);
    window.setTimeout(() => {
      try {
        onSimulateResult(success);
      } finally {
        setProcessing(false);
      }
    }, 650);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!processing) onClose();
      }}
      title="PayPhone · pago simulado"
      description="Demostración local sin conexión bancaria."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-[#FFF7F9] flex justify-between text-sm">
          <strong>{orderNumber}</strong>
          <strong>{formatCurrency(amount)}</strong>
        </div>
        <p className="text-xs text-[#665D65]">
          Elige el resultado de prueba. Cada intento resuelto se conserva en el
          historial. No se solicitan datos reales de tarjeta, CVV ni OTP.
        </p>
        <Button
          className="w-full"
          disabled={processing}
          onClick={() => simulate(true)}
        >
          {processing ? 'Procesando simulación…' : 'Simular pago aprobado'}
        </Button>
        <Button
          className="w-full"
          variant="outline"
          disabled={processing}
          onClick={() => simulate(false)}
        >
          Simular pago fallido
        </Button>
        {onSimulateCancelled && (
          <Button
            className="w-full"
            variant="ghost"
            disabled={processing}
            onClick={onSimulateCancelled}
          >
            Registrar intento cancelado
          </Button>
        )}
        <p className="text-[11px] text-[#665D65]">
          El fallo permite volver a abrir el simulador y crear un nuevo intento
          sin borrar el anterior.
        </p>
      </div>
    </Modal>
  );
}
