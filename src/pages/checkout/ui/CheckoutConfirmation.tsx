import React, { useState } from 'react';
import { Order } from '../../../shared/types/index.ts';
import { orderPaymentActions } from '../../../entities/order/index.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import {
  CheckCircle2,
  Building2,
  UploadCloud,
  ArrowRight,
  CreditCard,
  Clock,
  FileCheck,
  AlertTriangle,
  XCircle,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';

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
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(order.paymentStatus === 'PENDING_VERIFICATION');

  const handleSelectMockFile = (name: string) => {
    setProofFileName(name);
  };

  const handleUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFileName) return;
    setIsUploading(true);

    setTimeout(() => {
      orderPaymentActions.uploadTransferProof(order.id, proofFileName, order.customerName);
      setIsUploading(false);
      setIsUploaded(true);
    }, 700);
  };

  const renderTransferProofStatus = () => {
    if (order.paymentStatus === 'APPROVED') {
      return (
        <div className="p-4 bg-[#E8F3EE] border border-[#267A59]/30 rounded-2xl text-[#267A59] text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-[#267A59]" />
            <span>Comprobante verificado y aprobado</span>
          </div>
          <p className="text-[#267A59]/90">
            Tu pago ha sido validado exitosamente. Tu pedido ha pasado a la etapa de preparación.
          </p>
        </div>
      );
    }

    if (order.paymentStatus === 'REQUIRES_CORRECTION') {
      return (
        <div className="p-4 bg-[#FFF1D9] border border-[#9A6200]/30 rounded-2xl text-[#9A6200] text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-[#9A6200]" />
            <span>El comprobante requiere corrección</span>
          </div>
          <p>
            El número de transacción o comprobante adjunto no coincide con el depósito registrado en el banco. Por favor vuelve a adjuntar el archivo correcto.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsUploaded(false)}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Subir nuevo comprobante
          </Button>
        </div>
      );
    }

    if (order.paymentStatus === 'REJECTED') {
      return (
        <div className="p-4 bg-[#FDEBED] border border-[#B42336]/30 rounded-2xl text-[#B42336] text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <XCircle className="w-4 h-4 text-[#B42336]" />
            <span>Comprobante rechazado</span>
          </div>
          <p>
            No se pudo verificar el abono para este pedido. Contáctate con nuestra asesora o intenta mediante otro comprobante válido.
          </p>
        </div>
      );
    }

    if (isUploaded || order.paymentStatus === 'PENDING_VERIFICATION') {
      return (
        <div className="p-4 bg-[#FFF1D9] border border-[#9A6200]/30 rounded-2xl text-[#9A6200] text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4 text-[#9A6200] animate-pulse" />
            <span>Comprobante registrado · Pendiente de verificación</span>
          </div>
          <p className="leading-relaxed">
            Hemos recibido tu archivo <strong>{proofFileName || 'comprobante_bancario.jpg'}</strong>. Nuestro equipo comercial confirmará el depósito bancario en horario laboral para despachar tu paquete.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-[#9A6200]/20 text-[11px] font-semibold text-[#9A6200]">
            <FileCheck className="w-3.5 h-3.5" /> Archivo en cola de auditoría
          </div>
        </div>
      );
    }

    // Form states: Sin archivo / Archivo seleccionado / Subiendo
    return (
      <form onSubmit={handleUploadProof} className="pt-3 border-t border-[#E9DFE4] space-y-3">
        <div>
          <label className="font-bold text-[#241B24] text-xs block mb-1">
            Adjuntar comprobante de depósito / transferencia:
          </label>
          <p className="text-[11px] text-[#665D65] mb-2">
            Ingresa el nombre del archivo o selecciona un comprobante de prueba:
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {['comprobante_pichincha_1289.jpg', 'transferencia_guayaquil_402.png', 'deposito_bancario_recibo.pdf'].map((mock) => (
            <button
              key={mock}
              type="button"
              onClick={() => handleSelectMockFile(mock)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                proofFileName === mock
                  ? 'bg-[#FBE7ED] border-[#D52C69] text-[#A91E50] font-semibold'
                  : 'bg-white border-[#E9DFE4] text-[#665D65] hover:border-[#EE839F]'
              }`}
            >
              + {mock}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#665D65]" />
            <input
              type="text"
              placeholder="Ej: comprobante_pichincha_123.jpg"
              required
              value={proofFileName}
              onChange={(e) => setProofFileName(e.target.value)}
              className="w-full h-11 pl-9 pr-3 bg-white border border-[#E9DFE4] rounded-xl text-xs text-[#241B24] focus:outline-none focus:ring-2 focus:ring-[#D52C69]/20 focus:border-[#D52C69]"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isUploading}
            disabled={!proofFileName || isUploading}
            icon={isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          >
            {isUploading ? 'Subiendo...' : 'Registrar archivo'}
          </Button>
        </div>

        {proofFileName && !isUploading && (
          <p className="text-[11px] text-[#267A59] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Archivo seleccionado: <strong>{proofFileName}</strong> (listo para enviar)
          </p>
        )}
      </form>
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[24px] border border-[#E9DFE4] p-8 text-center space-y-6 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-[#E8F3EE] text-[#267A59] flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <span className="text-xs font-semibold text-[#A91E50] uppercase tracking-wider">
          ¡Pedido generado con éxito!
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#241B24] mt-1 font-data">
          {order.orderNumber}
        </h2>
        <p className="text-xs text-[#665D65] mt-1.5 font-data">
          Total: <strong className="text-[#A91E50]">{formatCurrency(order.total)}</strong> · Entregar a: {order.shippingAddressSnapshot.recipientName} ({order.shippingAddressSnapshot.city})
        </p>
      </div>

      {order.paymentMethod === 'TRANSFER' && (
        <div className="p-5 bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4] text-left space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#A91E50]">
            <Building2 className="w-4 h-4 text-[#D52C69]" />
            <span>Datos bancarios para tu transferencia (Banco Pichincha)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#241B24]">
            <p><strong>Banco:</strong> Banco Pichincha (Cta. Corriente)</p>
            <p><strong>Número:</strong> 2100849201</p>
            <p><strong>Titular:</strong> Mercedes Cañizares</p>
            <p><strong>Monto exacto:</strong> {formatCurrency(order.total)}</p>
          </div>

          {renderTransferProofStatus()}
        </div>
      )}

      {order.paymentMethod === 'PAYPHONE' && order.paymentStatus !== 'APPROVED' && (
        <div className="p-5 bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4] text-center space-y-3">
          <p className="text-xs text-[#665D65]">
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
