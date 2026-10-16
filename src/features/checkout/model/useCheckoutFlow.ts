import { useRef, useState, useEffect } from 'react';
import { useCartStore, cartActions } from '../../../entities/cart/index.ts';
import { useSessionStore } from '../../../entities/session/index.ts';
import {
  useBusinessStore,
  cents,
} from '../../../shared/domain/businessStore.ts';
import {
  operations,
  shippingCents,
} from '../../../shared/domain/operations.ts';
import { MockPaymentProvider } from '../../../shared/domain/providers.ts';
import { generateId } from '../../../shared/lib/id.ts';
import { Address } from '../../../shared/types/index.ts';

export function useCheckoutFlow() {
  const { items } = useCartStore();
  const { currentUser } = useSessionStore();
  const state = useBusinessStore();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const createdOrder = state.orders.find((o) => o.id === createdId) || null;
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    currentUser?.addresses?.[0] || null,
  );
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'PAYPHONE'>(
    state.settings.transferEnabled ? 'TRANSFER' : 'PAYPHONE',
  );
  const [isPayPhoneModalOpen, setIsPayPhoneModalOpen] = useState(false);
  const [error, setError] = useState('');
  const operationId = useRef(generateId('checkout'));
  const shippingCost =
    shippingCents(selectedAddress?.province || '', state.settings) / 100;
  useEffect(() => {
    if (!selectedAddress && currentUser?.addresses?.length)
      setSelectedAddress(currentUser.addresses[0]);
  }, [currentUser?.id, currentUser?.addresses]);
  const pricesChanged = items.some((it) => {
    const v = state.products
      .find((p) => p.id === it.productId)
      ?.variants.find((v) => v.id === it.variantId);
    return v && v.price !== null && cents(v.price) !== cents(it.price);
  });
  const refreshPrices = () => {
    try {
      cartActions.refreshCatalog();
      setError('');
    } catch (e) {
      setError(String(e));
    }
  };
  const placeOrder = () => {
    if (!currentUser || !selectedAddress || !items.length) return;
    setError('');
    try {
      const order = operations.createOrder({
        items: items.map((it) => ({ ...it, unitPrice: it.price })),
        shippingAddress: selectedAddress,
        paymentMethod,
        operationId: operationId.current,
      });
      setCreatedId(order.id);
      cartActions.clearCart();
      if (paymentMethod === 'PAYPHONE') setIsPayPhoneModalOpen(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo generar el pedido.',
      );
    }
  };
  const handlePayPhoneResult = (success: boolean) => {
    if (!createdOrder) return;
    try {
      MockPaymentProvider.processNew(
        createdOrder.id,
        success ? 'SUCCESS' : 'FAILURE',
      );
      setIsPayPhoneModalOpen(false);
    } catch (e) {
      setError(String(e));
      setIsPayPhoneModalOpen(false);
    }
  };
  const handlePayPhoneCancelled = () => {
    if (!createdOrder) return;
    try {
      MockPaymentProvider.processNew(createdOrder.id, 'CANCELLED');
      setIsPayPhoneModalOpen(false);
    } catch (e) {
      setError(String(e));
      setIsPayPhoneModalOpen(false);
    }
  };
  return {
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
    handlePayPhoneCancelled,
    error,
    pricesChanged,
    refreshPrices,
  };
}
