import React from 'react';
import { useBusinessStore } from '../../../shared/domain/businessStore.ts';
export function CheckoutPaymentStep({
  method,
  onSelectMethod,
}: {
  method: 'TRANSFER' | 'PAYPHONE';
  onSelectMethod: (m: 'TRANSFER' | 'PAYPHONE') => void;
  orderTotal: number;
}) {
  const { settings } = useBusinessStore();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {settings.transferEnabled && (
          <button
            type="button"
            aria-pressed={method === 'TRANSFER'}
            onClick={() => onSelectMethod('TRANSFER')}
            className={`p-4 rounded-xl border text-left ${method === 'TRANSFER' ? 'border-[#D52C69] bg-[#FFF7F9]' : 'border-[#E9DFE4]'}`}
          >
            <strong className="text-sm">Transferencia demo</strong>
            <p className="text-xs text-[#665D65] mt-2">
              Comprobante ficticio y revisión manual simulada.
            </p>
          </button>
        )}
        {settings.payphoneEnabled && (
          <button
            type="button"
            aria-pressed={method === 'PAYPHONE'}
            onClick={() => onSelectMethod('PAYPHONE')}
            className={`p-4 rounded-xl border text-left ${method === 'PAYPHONE' ? 'border-[#D52C69] bg-[#FFF7F9]' : 'border-[#E9DFE4]'}`}
          >
            <strong className="text-sm">PayPhone simulado</strong>
            <p className="text-xs text-[#665D65] mt-2">
              Éxito, fallo y reintento sin tarjeta ni cobro real.
            </p>
          </button>
        )}
      </div>
      {method === 'TRANSFER' && (
        <p className="text-xs p-4 rounded-xl bg-[#FFF7F9] whitespace-pre-wrap">
          {settings.bankInstructions}
        </p>
      )}
      {!settings.transferEnabled && !settings.payphoneEnabled && (
        <p role="alert" className="text-sm text-[#B42336]">
          No hay métodos de pago habilitados. Contacta al equipo.
        </p>
      )}
    </div>
  );
}
