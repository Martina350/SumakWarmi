import { businessStore } from './businessStore.ts';
import { operations } from './operations.ts';

/** Local providers only. No network, bank or carrier credentials. */
export const MockPaymentProvider = {
  createAttempt: (orderId: string, amountCents: number) =>
    operations.beginPayphone(orderId, amountCents),
  process(attemptId: string, scenario: 'SUCCESS' | 'FAILURE' | 'CANCELLED') {
    const attempt = businessStore
      .getState()
      .payments.find((p) => p.id === attemptId);
    if (!attempt) throw new Error('Intento no encontrado.');
    operations.payphone(
      attempt.orderId,
      scenario,
      `mock-payment:${attemptId}`,
      attemptId,
    );
    return MockPaymentProvider.getStatus(attemptId);
  },
  getStatus: (attemptId: string) =>
    businessStore.getState().payments.find((p) => p.id === attemptId)?.status,
  processNew(orderId: string, scenario: 'SUCCESS' | 'FAILURE' | 'CANCELLED') {
    const order = businessStore.getState().orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Pedido no encontrado.');
    const attempt = MockPaymentProvider.createAttempt(
      orderId,
      order.totalCents!,
    );
    return MockPaymentProvider.process(attempt.id, scenario);
  },
};
export const MockServientregaProvider = {
  registerManualShipment: operations.registerShipment,
  recordEvent: operations.ship,
};
