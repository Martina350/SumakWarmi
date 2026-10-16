import React, { useState } from 'react';
import { CreditCard, Building2, ShieldCheck, Check, Lock, Copy, Sparkles, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { useBusinessStore } from '../../../shared/domain/businessStore.ts';

export interface CardFormData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  identification: string;
  cardType: 'DEBIT' | 'CREDIT';
  installment: string;
  saveCard: boolean;
}

export interface CheckoutPaymentStepProps {
  method: 'TRANSFER' | 'PAYPHONE';
  onSelectMethod: (m: 'TRANSFER' | 'PAYPHONE') => void;
  orderTotal: number;
  onConfirmOrder?: () => void;
  onCardDataChange?: (card: CardFormData) => void;
}

export function CheckoutPaymentStep({
  method,
  onSelectMethod,
  orderTotal,
  onConfirmOrder,
  onCardDataChange,
}: CheckoutPaymentStepProps) {
  const { settings } = useBusinessStore();
  const transferEnabled = settings?.transferEnabled ?? true;
  const payphoneEnabled = settings?.payphoneEnabled ?? true;

  const [cardType, setCardType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [identification, setIdentification] = useState('');
  const [installment, setInstallment] = useState('CORRIENTE');
  const [saveCard, setSaveCard] = useState(true);

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedRuc, setCopiedRuc] = useState(false);

  // Dynamic card brand detection
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return { name: 'VISA', bg: 'bg-[#1a1f71] text-white' };
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return { name: 'Mastercard', bg: 'bg-[#eb001b] text-white' };
    if (/^3[47]/.test(clean)) return { name: 'AMEX', bg: 'bg-[#007b85] text-white' };
    if (/^3[068]/.test(clean)) return { name: 'Diners', bg: 'bg-[#004a99] text-white' };
    return null;
  };

  const detectedBrand = getCardBrand(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    const formatted = parts ? parts.join(' ') : raw;
    setCardNumber(formatted);
    notifyParent({ cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    let formatted = raw;
    if (raw.length >= 3) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(formatted);
    notifyParent({ expiry: formatted });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(raw);
    notifyParent({ cvv: raw });
  };

  const handleIdentificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setIdentification(raw);
    notifyParent({ identification: raw });
  };

  const notifyParent = (partial: Partial<CardFormData>) => {
    if (onCardDataChange) {
      onCardDataChange({
        cardNumber,
        cardHolder,
        expiry,
        cvv,
        identification,
        cardType,
        installment,
        saveCard,
        ...partial,
      });
    }
  };

  const handleAutofillDemo = () => {
    const demo = {
      cardNumber: '4532 8920 4819 7291',
      cardHolder: 'MARTINA LEON',
      expiry: '08/29',
      cvv: '382',
      identification: '1720394857',
      cardType: 'DEBIT' as const,
      installment: 'CORRIENTE',
      saveCard: true,
    };
    setCardNumber(demo.cardNumber);
    setCardHolder(demo.cardHolder);
    setExpiry(demo.expiry);
    setCvv(demo.cvv);
    setIdentification(demo.identification);
    setCardType(demo.cardType);
    setInstallment(demo.installment);
    setSaveCard(demo.saveCard);
    notifyParent(demo);
  };

  const handleCopy = (text: string, type: 'account' | 'ruc') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedRuc(true);
      setTimeout(() => setCopiedRuc(false), 2000);
    }
  };

  const isCardValid =
    method === 'TRANSFER' ||
    (cardNumber.replace(/\s+/g, '').length >= 15 &&
      cardHolder.trim().length > 3 &&
      expiry.length === 5 &&
      cvv.length >= 3);

  if (!transferEnabled && !payphoneEnabled) {
    return (
      <p role="alert" className="text-sm text-[#B42336] p-4 bg-[#FDEBED] rounded-xl border border-[#B42336]/30">
        No hay métodos de pago habilitados en la plataforma. Contacta al equipo comercial de SUMAKWARMI.
      </p>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Selector de Método de Pago Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Opción Tarjeta */}
        {payphoneEnabled && (
          <div
            onClick={() => onSelectMethod('PAYPHONE')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
              method === 'PAYPHONE'
                ? 'border-[#D52C69] bg-[#FFF7F9] ring-2 ring-[#D52C69]/20 shadow-xs'
                : 'border-[#E9DFE4] hover:border-[#EE839F] bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${method === 'PAYPHONE' ? 'bg-[#FBE7ED] text-[#D52C69]' : 'bg-[#FFF7F9] text-[#665D65]'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#241B24] block">Tarjeta de Débito o Crédito</span>
                  <span className="text-[11px] text-[#A91E50] font-medium">Pasarela segura PayPhone Ecuador</span>
                </div>
              </div>
              {method === 'PAYPHONE' && (
                <div className="w-5 h-5 rounded-full bg-[#D52C69] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
            <p className="text-xs text-[#665D65] mt-3 leading-relaxed">
              Paga directamente con tu tarjeta Visa, Mastercard, Diners o American Express con acreditación en línea inmediata.
            </p>
          </div>
        )}

        {/* Opción Transferencia */}
        {transferEnabled && (
          <div
            onClick={() => onSelectMethod('TRANSFER')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
              method === 'TRANSFER'
                ? 'border-[#D52C69] bg-[#FFF7F9] ring-2 ring-[#D52C69]/20 shadow-xs'
                : 'border-[#E9DFE4] hover:border-[#EE839F] bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${method === 'TRANSFER' ? 'bg-[#FBE7ED] text-[#D52C69]' : 'bg-[#FFF7F9] text-[#665D65]'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#241B24] block">Transferencia Bancaria Directa</span>
                  <span className="text-[11px] text-[#665D65] font-medium">Banco Pichincha / Guayaquil</span>
                </div>
              </div>
              {method === 'TRANSFER' && (
                <div className="w-5 h-5 rounded-full bg-[#D52C69] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
            <p className="text-xs text-[#665D65] mt-3 leading-relaxed">
              Realiza la transferencia desde tu banca web o móvil y sube tu comprobante para validación asistida.
            </p>
          </div>
        )}
      </div>

      {/* DETALLE Y FORMULARIO ORDENADO: TARJETA DE DÉBITO O CRÉDITO */}
      {method === 'PAYPHONE' && payphoneEnabled && (
        <div className="p-6 bg-white rounded-2xl border border-[#E9DFE4] space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9DFE4]">
            <div>
              <h4 className="text-xs font-bold text-[#A91E50] uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#D52C69]" />
                <span>Ingresa los datos de tu tarjeta</span>
              </h4>
              <p className="text-xs text-[#665D65] mt-0.5">
                Aceptamos tarjetas de débito y crédito nacionales e internacionales
              </p>
            </div>

            {/* Badges de tarjetas y botón demo */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1a1f71] text-white">VISA</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#eb001b] text-white">MC</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#004a99] text-white">DINERS</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#007b85] text-white">AMEX</span>
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="text-[11px] font-semibold text-[#D52C69] hover:text-[#A91E50] underline cursor-pointer ml-1"
                title="Llenar datos válidos de prueba para evaluación rápida"
              >
                Autocompletar demo
              </button>
            </div>
          </div>

          {/* Selector Tipo de Tarjeta */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#665D65] block">
              Tipo de plástico
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => {
                  setCardType('DEBIT');
                  notifyParent({ cardType: 'DEBIT' });
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  cardType === 'DEBIT'
                    ? 'border-[#D52C69] bg-[#FFF7F9] text-[#A91E50] ring-1 ring-[#D52C69]'
                    : 'border-[#E9DFE4] text-[#665D65] hover:border-[#EE839F]'
                }`}
              >
                Tarjeta de Débito
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardType('CREDIT');
                  notifyParent({ cardType: 'CREDIT' });
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  cardType === 'CREDIT'
                    ? 'border-[#D52C69] bg-[#FFF7F9] text-[#A91E50] ring-1 ring-[#D52C69]'
                    : 'border-[#E9DFE4] text-[#665D65] hover:border-[#EE839F]'
                }`}
              >
                Tarjeta de Crédito
              </button>
            </div>
          </div>

          {/* Formulario Estructurado */}
          <div className="space-y-4">
            {/* Número de Tarjeta */}
            <Input
              label="Número de la tarjeta"
              required
              placeholder="•••• •••• •••• ••••"
              value={cardNumber}
              onChange={handleCardNumberChange}
              leftIcon={<CreditCard className="w-4 h-4" />}
              rightIcon={
                detectedBrand ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${detectedBrand.bg}`}>
                    {detectedBrand.name}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#665D65] font-data">16 dígitos</span>
                )
              }
            />

            {/* Nombre del Titular */}
            <Input
              label="Nombre y apellido del titular"
              required
              placeholder="TAL COMO APARECE EN LA TARJETA (EJ: MARTINA LEON)"
              value={cardHolder}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setCardHolder(val);
                notifyParent({ cardHolder: val });
              }}
              leftIcon={<User className="w-4 h-4" />}
            />

            {/* Fecha de Expiración y CVV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fecha de expiración"
                required
                placeholder="MM/AA"
                value={expiry}
                onChange={handleExpiryChange}
                leftIcon={<Calendar className="w-4 h-4" />}
                helperText="Mes y año (ej: 08/29)"
              />
              <Input
                label="Código de seguridad (CVV / CVC)"
                required
                type="password"
                maxLength={4}
                placeholder="•••"
                value={cvv}
                onChange={handleCvvChange}
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="3 dígitos al reverso (4 en Amex)"
              />
            </div>

            {/* Cédula/RUC y Modalidad de Cuotas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Cédula o RUC del titular"
                required
                placeholder="1720394857"
                value={identification}
                onChange={handleIdentificationChange}
                leftIcon={<FileText className="w-4 h-4" />}
                helperText="Requerido por SRI Ecuador y PayPhone"
              />

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#665D65]">
                  Modalidad de financiamiento
                </label>
                <select
                  value={installment}
                  onChange={(e) => {
                    setInstallment(e.target.value);
                    notifyParent({ installment: e.target.value });
                  }}
                  className="h-11 px-3.5 bg-white border border-[#E9DFE4] rounded-xl text-xs font-medium text-[#241B24] focus:outline-none focus:ring-2 focus:ring-[#D52C69]/20 focus:border-[#D52C69] cursor-pointer"
                >
                  <option value="CORRIENTE">Pago Corriente (1 solo débito - sin intereses)</option>
                  <option value="3_MESES">Diferido a 3 meses sin intereses</option>
                  <option value="6_MESES">Diferido a 6 meses sin intereses</option>
                  <option value="12_MESES">Diferido a 12 meses con intereses</option>
                </select>
                <p className="text-xs text-[#665D65]">
                  {cardType === 'DEBIT' ? 'Débito directo a cuenta bancaria.' : 'Crédito diferido disponible para tarjetas emitidas en Ecuador.'}
                </p>
              </div>
            </div>

            {/* Checkbox guardar tarjeta */}
            <label className="flex items-center gap-2.5 pt-1 text-xs text-[#241B24] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => {
                  setSaveCard(e.target.checked);
                  notifyParent({ saveCard: e.target.checked });
                }}
                className="w-4 h-4 rounded text-[#D52C69] focus:ring-[#D52C69] accent-[#D52C69] cursor-pointer"
              />
              <span>Guardar esta tarjeta de forma encriptada para mis próximas compras en SUMAKWARMI</span>
            </label>
          </div>

          {/* Sello de seguridad */}
          <div className="p-3 bg-[#FFF7F9] rounded-xl border border-[#EE839F]/30 text-xs text-[#665D65] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#267A59] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Tus transacciones están protegidas con encriptación bancaria SSL/TLS de 256 bits y certificación internacional PCI-DSS Nivel 1 a través de PayPhone Ecuador.
            </p>
          </div>
        </div>
      )}

      {/* DETALLE Y CUENTAS: TRANSFERENCIA BANCARIA */}
      {method === 'TRANSFER' && transferEnabled && (
        <div className="p-6 bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-[#A91E50] border-b border-[#E9DFE4] pb-3">
            <Building2 className="w-5 h-5 text-[#D52C69]" />
            <span>Datos oficiales para transferencia bancaria (Ecuador)</span>
          </div>

          <p className="text-xs text-[#665D65]">
            Realiza tu depósito o transferencia interbancaria a la cuenta oficial de SUMAKWARMI:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-[#E9DFE4]">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#665D65] uppercase font-semibold">Institución Financiera</span>
              <p className="text-xs font-bold text-[#241B24]">Banco Pichincha</p>
              <span className="text-[11px] text-[#665D65]">Cuenta Corriente</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[#665D65] uppercase font-semibold">Beneficiario</span>
              <p className="text-xs font-bold text-[#241B24]">Mercedes Cañizares</p>
              <span className="text-[11px] text-[#665D65]">Romina Sumak Warmi E-commerce</span>
            </div>

            <div className="space-y-0.5 sm:col-span-1">
              <span className="text-[11px] text-[#665D65] uppercase font-semibold">Número de Cuenta</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#241B24] font-data">2100849201</span>
                <button
                  type="button"
                  onClick={() => handleCopy('2100849201', 'account')}
                  className="p-1 rounded hover:bg-[#FFF7F9] text-[#D52C69] cursor-pointer"
                  title="Copiar número de cuenta"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedAccount && <span className="text-[10px] text-[#267A59] font-bold">¡Copiado!</span>}
              </div>
            </div>

            <div className="space-y-0.5 sm:col-span-1">
              <span className="text-[11px] text-[#665D65] uppercase font-semibold">RUC / Cédula</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#241B24] font-data">1718293847001</span>
                <button
                  type="button"
                  onClick={() => handleCopy('1718293847001', 'ruc')}
                  className="p-1 rounded hover:bg-[#FFF7F9] text-[#D52C69] cursor-pointer"
                  title="Copiar RUC"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedRuc && <span className="text-[10px] text-[#267A59] font-bold">¡Copiado!</span>}
              </div>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-[#E9DFE4] text-xs text-[#665D65]">
              Correo de notificación: <strong className="text-[#241B24]">pagos@sumakwarmi.ec</strong>
            </div>
          </div>

          {settings?.bankInstructions && (
            <p className="text-xs p-3 rounded-xl bg-white border border-[#E9DFE4] whitespace-pre-wrap text-[#665D65]">
              {settings.bankInstructions}
            </p>
          )}

          <div className="p-3 bg-white rounded-xl border border-[#E9DFE4] text-xs text-[#665D65] flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#D52C69] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Al confirmar el pedido, recibirás tu código de orden y podrás <strong>adjuntar la captura o comprobante en PDF</strong> para que nuestro equipo lo valide inmediatamente.
            </p>
          </div>
        </div>
      )}

      {/* BOTÓN FINAL DE PAGO Y CONFIRMACIÓN */}
      {onConfirmOrder && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base font-semibold py-4"
            disabled={!isCardValid}
            onClick={onConfirmOrder}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {method === 'PAYPHONE'
              ? `Pagar con tarjeta · ${formatCurrency(orderTotal)}`
              : `Confirmar pedido y generar orden · ${formatCurrency(orderTotal)}`}
          </Button>
          <p className="text-center text-[11px] text-[#665D65] mt-2">
            Al confirmar tu pedido aceptas las políticas de compra responsable y garantía de SUMAKWARMI.
          </p>
        </div>
      )}
    </div>
  );
}
