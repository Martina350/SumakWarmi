import React from 'react';
import { sessionActions } from '../../../entities/session/index.ts';
import { useCheckoutFlow } from '../../../features/checkout/model/useCheckoutFlow.ts';
import { CheckoutCustomerForm } from './CheckoutCustomerForm.tsx';
import { CheckoutAddressStep } from '../../../features/checkout/ui/CheckoutAddressStep.tsx';
import { CheckoutPaymentStep } from '../../../features/checkout/ui/CheckoutPaymentStep.tsx';
import { CheckoutSummary } from './CheckoutSummary.tsx';
import { CheckoutConfirmation } from './CheckoutConfirmation.tsx';
import { PayPhoneModal } from '../../../features/checkout/ui/PayPhoneModal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { ShoppingBag, ArrowRight, Check, User, MapPin, CreditCard, CheckCircle } from 'lucide-react';

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

  // Progressive step calculation
  // 1: Datos personales, 2: Dirección de entrega, 3: Método de pago, 4: Confirmación
  const currentStep = createdOrder ? 4 : !currentUser ? 1 : !selectedAddress ? 2 : 3;

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
              <div key={st.number} className="flex flex-col items-center text-center relative z-10 px-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#267A59] text-white shadow-xs'
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
                      ? 'text-[#267A59] font-semibold'
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

      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#241B24] mb-8">
        Finalizar tu pedido
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          {!currentUser ? (
            <CheckoutCustomerForm onIdentified={() => {}} />
          ) : (
            <>
              {/* Step 2: Dirección */}
              <div className="bg-white rounded-[20px] border border-[#E9DFE4] p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E9DFE4] pb-3">
                  <h3 className="text-xs font-bold text-[#665D65] uppercase flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#D52C69]" />
                    <span>2. Dirección de Entrega (Servientrega Ecuador)</span>
                  </h3>
                  {selectedAddress && (
                    <span className="text-xs font-semibold text-[#267A59] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Seleccionada
                    </span>
                  )}
                </div>
                <CheckoutAddressStep
                  addresses={currentUser.addresses || []}
                  selectedAddressId={selectedAddress?.id || ''}
                  onSelectAddress={setSelectedAddress}
                  onAddNewAddress={(newAddr) => {
                    sessionActions.addAddressToCurrentUser(newAddr);
                    setSelectedAddress({ ...newAddr, id: 'temp' });
                  }}
                />
              </div>

              {/* Step 3: Método de pago */}
              <div className="bg-white rounded-[20px] border border-[#E9DFE4] p-6 space-y-4 shadow-2xs">
                <div className="border-b border-[#E9DFE4] pb-3">
                  <h3 className="text-xs font-bold text-[#665D65] uppercase flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#D52C69]" />
                    <span>3. Método de Pago</span>
                  </h3>
                </div>
                <CheckoutPaymentStep method={paymentMethod} onSelectMethod={setPaymentMethod} orderTotal={0} />
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-semibold"
                disabled={!selectedAddress}
                onClick={placeOrder}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Confirmar y generar pedido
              </Button>
            </>
          )}
        </div>

        <div className="lg:col-span-5">
          <CheckoutSummary items={items} shippingCost={shippingCost} deliveryCity={selectedAddress?.city} />
        </div>
      </div>
    </div>
  );
};
