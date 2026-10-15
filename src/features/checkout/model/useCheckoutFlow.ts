import { useState } from 'react';
import { useCartStore, cartActions } from '../../../entities/cart/index.ts';
import { useSessionStore } from '../../../entities/session/index.ts';
import { createOrderAction, orderPaymentActions } from '../../../entities/order/index.ts';
import { Address, Order, OrderItem } from '../../../shared/types/index.ts';

export function useCheckoutFlow() {
  const { items } = useCartStore();
  const { currentUser } = useSessionStore();

  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    currentUser?.addresses?.[0] || null
  );
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'PAYPHONE'>('TRANSFER');
  const [isPayPhoneModalOpen, setIsPayPhoneModalOpen] = useState(false);

  const shippingCost = selectedAddress?.province.toLowerCase().includes('pichincha') ? 3.5 : 4.5;

  const placeOrder = () => {
    if (!currentUser || !selectedAddress || items.length === 0) return;

    const orderItems: OrderItem[] = items.map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      productName: it.productName,
      variantName: it.variantName,
      sku: it.sku,
      unitPrice: it.price,
      quantity: it.quantity,
      subtotal: it.price * it.quantity,
      imageUrl: it.imageUrl,
    }));

    const newOrder = createOrderAction({
      customer: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
      },
      items: orderItems,
      shippingAddress: selectedAddress,
      shippingCost,
      paymentMethod,
    });

    cartActions.clearCart();
    setCreatedOrder(newOrder);

    if (paymentMethod === 'PAYPHONE') {
      setIsPayPhoneModalOpen(true);
    }
  };

  const handlePayPhoneResult = (success: boolean) => {
    if (!createdOrder || !currentUser) return;
    orderPaymentActions.simulatePayPhone(createdOrder.id, success, currentUser.name);
    setIsPayPhoneModalOpen(false);
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
  };
}
