import { orderStore } from './orderStore.ts';
import { Order, OrderItem, Address, Payment } from '../../../shared/types/index.ts';
import { generateId, generateOrderNumber } from '../../../shared/lib/id.ts';

export function createOrderAction(params: {
  customer: { id: string; name: string; email: string; phone: string };
  items: OrderItem[];
  shippingAddress: Address;
  shippingCost: number;
  paymentMethod: 'TRANSFER' | 'PAYPHONE';
}): Order {
  const currentOrders = orderStore.getState().orders;
  const newSequence = currentOrders.length + 101;
  const orderId = generateId('ord');
  const paymentId = generateId('pay');
  const now = new Date().toISOString();

  const subtotal = params.items.reduce((acc, it) => acc + it.subtotal, 0);
  const total = subtotal + params.shippingCost;

  const newOrder: Order = {
    id: orderId,
    orderNumber: generateOrderNumber(newSequence),
    customerId: params.customer.id,
    customerName: params.customer.name,
    customerEmail: params.customer.email,
    customerPhone: params.customer.phone,
    items: params.items,
    subtotal,
    shippingCost: params.shippingCost,
    total,
    status: 'PAYMENT_PENDING',
    paymentStatus: 'PENDING',
    shipmentStatus: 'NOT_CREATED',
    shippingAddressSnapshot: { ...params.shippingAddress },
    paymentMethod: params.paymentMethod,
    createdAt: now,
    updatedAt: now,
    history: [
      {
        id: generateId('hist'),
        orderId,
        eventType: 'ORDER_CREATED',
        previousStatus: 'CREATED',
        newStatus: 'PAYMENT_PENDING',
        createdAt: now,
        actor: params.customer.name,
        origin: 'CUSTOMER',
        comment: `Pedido creado con método ${params.paymentMethod}`,
        isPublic: true,
      },
    ],
  };

  const newPayment: Payment = {
    id: paymentId,
    orderId,
    amount: total,
    method: params.paymentMethod,
    status: 'PENDING',
    history: [
      {
        id: generateId('ph'),
        paymentId,
        previousStatus: 'PENDING',
        newStatus: 'PENDING',
        actor: params.customer.name,
        comment: 'Pago iniciado en checkout',
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  orderStore.setState((prev) => ({
    ...prev,
    orders: [newOrder, ...prev.orders],
    payments: [newPayment, ...prev.payments],
  }));

  return newOrder;
}
