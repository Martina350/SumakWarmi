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
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
            method === 'TRANSFER'
              ? 'border-[#D52C69] bg-[#FFF7F9] ring-1 ring-[#D52C69]'
              : 'border-[#E9DFE4] hover:border-[#EE839F] bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#D52C69]" />
              <span className="font-semibold text-sm text-[#241B24]">Transferencia Bancaria</span>
            </div>
            {method === 'TRANSFER' && <Check className="w-4 h-4 text-[#D52C69]" />}
          </div>
          <p className="text-xs text-[#665D65] mt-2 leading-relaxed">
            Banco Pichincha / Guayaquil. Podrás adjuntar tu comprobante de depósito o transferencia directamente.
          </p>
        </div>

        <div
          onClick={() => onSelectMethod('PAYPHONE')}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
            method === 'PAYPHONE'
              ? 'border-[#D52C69] bg-[#FFF7F9] ring-1 ring-[#D52C69]'
              : 'border-[#E9DFE4] hover:border-[#EE839F] bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#D52C69]" />
              <span className="font-semibold text-sm text-[#241B24]">Tarjeta · PayPhone</span>
            </div>
            {method === 'PAYPHONE' && <Check className="w-4 h-4 text-[#D52C69]" />}
          </div>
          <p className="text-xs text-[#665D65] mt-2 leading-relaxed">
            Simulación de pasarela de pago segura PayPhone (tarjetas Visa / Mastercard / Diners).
          </p>
        </div>
      </div>

      {method === 'TRANSFER' && (
        <div className="p-4 bg-[#FFF7F9] rounded-xl border border-[#E9DFE4] text-xs text-[#241B24] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#A91E50]">
            <Building2 className="w-4 h-4 text-[#D52C69]" />
            <span>Datos oficiales de cuenta bancaria para el depósito (Ecuador)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <p><strong>Banco:</strong> Banco Pichincha (Cta. Corriente)</p>
            <p><strong>Beneficiario:</strong> Mercedes Cañizares · SUMAKWARMI</p>
            <p><strong>Número de cuenta:</strong> 2100849201</p>
            <p><strong>RUC / Cédula:</strong> 1718293847001</p>
          </div>
          <p className="text-[#665D65] pt-1 border-t border-[#E9DFE4]">
            Correo de confirmación: <strong>pagos@sumakwarmi.ec</strong>. Al confirmar, recibirás el identificador de pedido para cargar tu archivo de comprobante.
          </p>
        </div>
      )}

      {method === 'PAYPHONE' && (
        <div className="p-4 bg-white rounded-xl border border-[#E9DFE4] text-xs text-[#665D65] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#267A59] shrink-0 mt-0.5" />
          <p>
            Al presionar "Confirmar y generar pedido", se abrirá el simulador controlado de PayPhone para elegir el resultado de la prueba (Aprobado o Rechazado). No se solicitan ni almacenan datos reales de tarjetas.
          </p>
        </div>
      )}
    </div>
  );
};
