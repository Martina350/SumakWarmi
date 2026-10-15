import React, { useState, useEffect } from 'react';
import { sessionActions } from '../../../entities/session/index.ts';
import { useCheckoutFlow } from '../../../features/checkout/model/useCheckoutFlow.ts';
import { CheckoutCustomerForm } from './CheckoutCustomerForm.tsx';
import { CheckoutAddressStep } from '../../../features/checkout/ui/CheckoutAddressStep.tsx';
import { CheckoutPaymentStep } from '../../../features/checkout/ui/CheckoutPaymentStep.tsx';
import { CheckoutSummary } from './CheckoutSummary.tsx';
import { CheckoutConfirmation } from './CheckoutConfirmation.tsx';
import { PayPhoneModal } from '../../../features/checkout/ui/PayPhoneModal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { ShoppingBag, Check, User, MapPin, CreditCard, CheckCircle, Edit3 } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const {
    items,
    currentUser,
    createdOrder,
    selectedAddress,
    setSelectedAddress,
    paymentMethod,
    setPaymentMethod,
    isPayPhoneModalOpen,
    setIsPayPhoneModalOpen,
    shippingCost,
    placeOrder,
    handlePayPhoneResult,
  } = useCheckoutFlow();

  // Controlled active step: 1 = Datos personales, 2 = Dirección de entrega, 3 = Método de pago, 4 = Confirmación
  const [activeStep, setActiveStep] = useState<number>(() => {
    if (!currentUser) return 1;
    return 2;
  });

  const [cardDetails, setCardDetails] = useState<{ brand: string; last4: string; holder: string } | undefined>(undefined);

  useEffect(() => {
    if (!currentUser) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      setActiveStep(2);
    }
  }, [currentUser]);

  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const total = subtotal + shippingCost;

  const currentStep = createdOrder ? 4 : activeStep;

  const steps = [
    { number: 1, title: 'Datos personales', icon: <User className="w-4 h-4" /> },
    { number: 2, title: 'Dirección de entrega', icon: <MapPin className="w-4 h-4" /> },
    { number: 3, title: 'Método de pago', icon: <CreditCard className="w-4 h-4" /> },
    { number: 4, title: 'Confirmación', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  if (createdOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left">
        {/* Progressive indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#267A59] -z-0" />
            {steps.map((st) => (
              <div key={st.number} className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#267A59] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold mt-2 text-[#267A59]">
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <CheckoutConfirmation
          order={createdOrder}
          onNavigateOrders={() => onNavigate('/mi-cuenta')}
          onOpenPayPhoneModal={() => setIsPayPhoneModalOpen(true)}
        />
        <PayPhoneModal
          isOpen={isPayPhoneModalOpen}
          onClose={() => setIsPayPhoneModalOpen(false)}
          orderNumber={createdOrder.orderNumber}
          amount={createdOrder.total}
          onSimulateResult={handlePayPhoneResult}
          cardSummary={cardDetails}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFF7F9] border border-[#E9DFE4] flex items-center justify-center text-[#EE839F] mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-heading font-bold text-[#241B24]">Tu carrito está vacío</h2>
        <p className="text-xs text-[#665D65]">Agrega productos al carrito para continuar al checkout.</p>
        <Button variant="primary" size="md" onClick={() => onNavigate('/tienda')}>
          Explorar catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left">
      {/* Progressive Step Indicator */}
      <div className="mb-10 max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-[#E9DFE4] -z-0" />
          {steps.map((st) => {
            const isCompleted = st.number < currentStep;
            const isActive = st.number === currentStep;

            return (
              <div
                key={st.number}
                onClick={() => {
                  if (isCompleted && st.number >= 1 && st.number <= 3) {
                    setActiveStep(st.number);
                  }
                }}
                className={`flex flex-col items-center text-center relative z-10 px-1 ${
                  isCompleted ? 'cursor-pointer group' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#267A59] text-white shadow-xs group-hover:scale-105'
                      : isActive
                      ? 'bg-[#D52C69] text-white shadow-xs ring-4 ring-[#FBE7ED]'
                      : 'bg-white border-2 border-[#E9DFE4] text-[#665D65]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : st.number}
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden sm:inline ${
                    isCompleted
                      ? 'text-[#267A59] font-semibold group-hover:underline'
                      : isActive
                      ? 'text-[#A91E50] font-bold'
                      : 'text-[#665D65]'
                  }`}
                >
                  {st.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#241B24]">
          Finalizar tu pedido
        </h1>
        <p className="text-xs text-[#665D65] mt-1">
          {activeStep === 1
            ? 'Ingresa tus datos de contacto para continuar.'
            : activeStep === 2
            ? 'Selecciona o registra tu dirección de entrega con Servientrega en Ecuador.'
            : 'Elige tu método de pago y completa la información de forma segura.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          {/* PASO 1: DATOS PERSONALES */}
          {!currentUser ? (
            <CheckoutCustomerForm onIdentified={() => setActiveStep(2)} />
          ) : activeStep === 2 ? (
            /* PASO 2: DIRECCIÓN DE ENTREGA (AISLADO, SIN MÉTODO DE PAGO ABAJO) */
            <div className="bg-white rounded-[20px] border border-[#E9DFE4] p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E9DFE4] pb-3.5">
                <div>
                  <h3 className="text-xs font-bold text-[#A91E50] uppercase flex items-center gap-1.5 tracking-wider">
                    <MapPin className="w-4 h-4 text-[#D52C69]" />
                    <span>2. Dirección de Entrega (Servientrega Ecuador)</span>
                  </h3>
                  <p className="text-xs text-[#665D65] mt-1">
                    Envíos directos con número de guía oficial para seguimiento en tiempo real.
                  </p>
                </div>
                {selectedAddress && (
                  <span className="text-xs font-semibold text-[#267A59] flex items-center gap-1 bg-[#E8F3EE] px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Lista
                  </span>
                )}
              </div>

              <CheckoutAddressStep
                addresses={currentUser.addresses || []}
                selectedAddressId={selectedAddress?.id || ''}
                onSelectAddress={(addr) => setSelectedAddress(addr)}
                onAddNewAddress={(newAddr) => {
                  sessionActions.addAddressToCurrentUser(newAddr);
                  setSelectedAddress({ ...newAddr, id: 'temp' });
                }}
                onContinueToPayment={() => {
                  if (selectedAddress) {
                    setActiveStep(3);
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }
                }}
              />
            </div>
          ) : (
            /* PASO 3: MÉTODO DE PAGO (DIRECCIÓN EN RESUMEN COMPACTO, SEPARADO Y BIEN ESTRUCTURADO) */
            <div className="space-y-6">
              {/* Tarjeta Resumen de Dirección Confirmada (Elegante y Compacta) */}
              {selectedAddress && (
                <div className="bg-white rounded-[20px] border border-[#E9DFE4] p-4 sm:p-5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E8F3EE] text-[#267A59] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#267A59]">
                            Dirección de Entrega Confirmada
                          </span>
                          <span className="text-[10px] bg-[#FFF7F9] text-[#A91E50] font-semibold px-2 py-0.5 rounded-full border border-[#EE839F]/30">
                            Servientrega
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#241B24] mt-0.5">
                          {selectedAddress.recipientName} · <span className="font-normal text-[#665D65]">{selectedAddress.phone}</span>
                        </p>
                        <p className="text-xs text-[#665D65] mt-0.5">
                          {selectedAddress.mainStreet} {selectedAddress.reference ? `(${selectedAddress.reference})` : ''}, {selectedAddress.city}, {selectedAddress.province}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => setActiveStep(2)}
                      className="text-xs font-semibold shrink-0"
                    >
                      Cambiar dirección
                    </Button>
                  </div>
                </div>
              )}

              {/* Módulo Principal de Método de Pago */}
              <div className="bg-white rounded-[20px] border border-[#E9DFE4] p-6 space-y-5 shadow-2xs">
                <div className="border-b border-[#E9DFE4] pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#A91E50] uppercase flex items-center gap-1.5 tracking-wider">
                      <CreditCard className="w-4 h-4 text-[#D52C69]" />
                      <span>3. Método de Pago</span>
                    </h3>
                    <p className="text-xs text-[#665D65] mt-1">
                      Selecciona y completa tu forma de pago preferida
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#D52C69] bg-[#FBE7ED] px-2.5 py-1 rounded-full">
                    Paso final
                  </span>
                </div>

                <CheckoutPaymentStep
                  method={paymentMethod}
                  onSelectMethod={setPaymentMethod}
                  orderTotal={total}
                  onConfirmOrder={placeOrder}
                  onCardDataChange={(card) => {
                    const cleanNum = card.cardNumber.replace(/\s+/g, '');
                    setCardDetails({
                      brand: cleanNum.startsWith('4') ? 'Visa' : cleanNum.startsWith('5') ? 'Mastercard' : 'Tarjeta',
                      last4: cleanNum.slice(-4) || '4242',
                      holder: card.cardHolder || currentUser.name,
                    });
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA LATERAL: RESUMEN DE COMPRA */}
        <div className="lg:col-span-5">
          <CheckoutSummary
            items={items}
            shippingCost={shippingCost}
            deliveryCity={selectedAddress?.city}
          />
        </div>
      </div>
    </div>
  );
};
