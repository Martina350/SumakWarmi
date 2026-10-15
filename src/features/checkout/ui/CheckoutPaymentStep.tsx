import React from 'react';
import { CreditCard, Building2, ShieldCheck, Check } from 'lucide-react';

interface CheckoutPaymentStepProps {
  method: 'TRANSFER' | 'PAYPHONE';
  onSelectMethod: (m: 'TRANSFER' | 'PAYPHONE') => void;
  orderTotal: number;
}

export const CheckoutPaymentStep: React.FC<CheckoutPaymentStepProps> = ({
  method,
  onSelectMethod,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          onClick={() => onSelectMethod('TRANSFER')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            method === 'TRANSFER'
              ? 'border-[#7A3F65] bg-[#F9F1F3]/40 ring-1 ring-[#7A3F65]'
              : 'border-[#E9DEE3] hover:border-[#7A3F65]/40 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#7A3F65]" />
              <span className="font-semibold text-sm text-[#272329]">Transferencia Bancaria</span>
            </div>
            {method === 'TRANSFER' && <Check className="w-4 h-4 text-[#7A3F65]" />}
          </div>
          <p className="text-xs text-[#716A70] mt-2 leading-relaxed">
            Banco Pichincha / Guayaquil. Podrás adjuntar tu comprobante de depósito o transferencia.
          </p>
        </div>

        <div
          onClick={() => onSelectMethod('PAYPHONE')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            method === 'PAYPHONE'
              ? 'border-[#7A3F65] bg-[#F9F1F3]/40 ring-1 ring-[#7A3F65]'
              : 'border-[#E9DEE3] hover:border-[#7A3F65]/40 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#7A3F65]" />
              <span className="font-semibold text-sm text-[#272329]">Tarjeta · PayPhone</span>
            </div>
            {method === 'PAYPHONE' && <Check className="w-4 h-4 text-[#7A3F65]" />}
          </div>
          <p className="text-xs text-[#716A70] mt-2 leading-relaxed">
            Simulación de pasarela de pago segura PayPhone (tarjetas Visa / Mastercard / Diners).
          </p>
        </div>
      </div>

      {method === 'TRANSFER' && (
        <div className="p-4 bg-[#F9F1F3] rounded-xl border border-[#E9DEE3] text-xs text-[#272329] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#7A3F65]">
            <Building2 className="w-4 h-4" />
            <span>Datos de cuenta bancaria para el depósito (Ecuador)</span>
          </div>
          <p><strong>Banco:</strong> Banco Pichincha (Cuenta Corriente)</p>
          <p><strong>Beneficiario:</strong> Mercedes Cañizares · Romina Sumak Warmi</p>
          <p><strong>Número de cuenta:</strong> 2100849201</p>
          <p><strong>RUC / Cédula:</strong> 1718293847001 · <strong>Correo:</strong> pagos@sumakwarmi.ec</p>
          <p className="text-[#716A70] pt-1">
            Al confirmar, te facilitaremos el identificador de pedido y el casillero para adjuntar tu comprobante.
          </p>
        </div>
      )}

      {method === 'PAYPHONE' && (
        <div className="p-4 bg-[#FFFDFB] rounded-xl border border-[#E9DEE3] text-xs text-[#716A70] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#287A56] shrink-0 mt-0.5" />
          <p>
            Al presionar "Confirmar y proceder al pago", se abrirá el simulador de PayPhone para elegir el resultado de la prueba (Aprobado o Rechazado). No se solicitan datos reales de tarjetas.
          </p>
        </div>
      )}
    </div>
  );
};
