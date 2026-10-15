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
import { ShoppingBag, ArrowRight } from 'lucide-react';

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

  if (createdOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left">
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
        <ShoppingBag className="w-12 h-12 text-[#E9DEE3] mx-auto" />
        <h2 className="text-xl font-serif-display font-bold text-[#272329]">Tu carrito está vacío</h2>
        <Button variant="primary" size="md" onClick={() => onNavigate('/tienda')}>
          Explorar catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left">
      <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#272329] mb-8">Finalizar tu pedido</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          {!currentUser ? (
            <CheckoutCustomerForm onIdentified={() => {}} />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-[#E9DEE3] p-6 space-y-4">
                <h3 className="text-xs font-bold text-[#716A70] uppercase">Entrega Servientrega</h3>
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

              <div className="bg-white rounded-2xl border border-[#E9DEE3] p-6 space-y-4">
                <h3 className="text-xs font-bold text-[#716A70] uppercase">Método de pago</h3>
                <CheckoutPaymentStep method={paymentMethod} onSelectMethod={setPaymentMethod} orderTotal={0} />
              </div>

              <Button variant="primary" size="lg" className="w-full" disabled={!selectedAddress} onClick={placeOrder} icon={<ArrowRight className="w-4 h-4" />}>
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
