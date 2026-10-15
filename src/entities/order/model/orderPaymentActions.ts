import { orderStore } from './orderStore.ts';
import { generateId } from '../../../shared/lib/id.ts';
import { OrderStatusHistory, PaymentStatus, OrderStatus } from '../../../shared/types/index.ts';

export const orderPaymentActions = {
  uploadTransferProof: (orderId: string, fileName: string, customerName: string) => {
    const now = new Date().toISOString();
    orderStore.setState((prev) => {
      const orders = prev.orders.map((ord) => {
        if (ord.id !== orderId) return ord;
        const newHist: OrderStatusHistory = {
          id: generateId('hist'),
          orderId,
          eventType: 'TRANSFER_UPLOADED',
          previousStatus: ord.status,
          newStatus: 'PAYMENT_PENDING',
          createdAt: now,
          actor: customerName,
          origin: 'CUSTOMER',
          comment: `Comprobante ${fileName} subido para revisión`,
          isPublic: true,
        };
        return {
          ...ord,
          paymentStatus: 'PENDING_VERIFICATION' as const,
          updatedAt: now,
          history: [...ord.history, newHist],
        };
      });

      const payments = prev.payments.map((p) => {
        if (p.orderId !== orderId) return p;
        return {
          ...p,
          status: 'PENDING_VERIFICATION' as const,
          proof: {
            id: generateId('prf'),
            paymentId: p.id,
            orderId,
            fileName,
            fileSize: 180000,
            uploadedAt: now,
          },
          updatedAt: now,
        };
      });

      return { ...prev, orders, payments };
    });
  },

  verifyTransfer: (
    orderId: string,
    outcome: 'APPROVE' | 'REQUIRE_CORRECTION' | 'REJECT',
    actorName: string,
    notes: string
  ) => {
    const now = new Date().toISOString();
    orderStore.setState((prev) => {
      const targetOrder = prev.orders.find((o) => o.id === orderId);
      if (!targetOrder) return prev;

      let newPayStatus: PaymentStatus = targetOrder.paymentStatus;
      let newOrdStatus: OrderStatus = targetOrder.status;

      if (outcome === 'APPROVE') {
        newPayStatus = 'APPROVED';
        newOrdStatus = 'CONFIRMED';
      } else if (outcome === 'REQUIRE_CORRECTION') {
        newPayStatus = 'REQUIRES_CORRECTION';
      } else {
        newPayStatus = 'REJECTED';
        newOrdStatus = 'CANCELLED';
      }

      const newHist: OrderStatusHistory = {
        id: generateId('hist'),
        orderId,
        eventType: `PAYMENT_${outcome}`,
        previousStatus: targetOrder.status,
        newStatus: newOrdStatus,
        createdAt: now,
        actor: actorName,
        origin: 'SELLER',
        comment: notes || `Revisión manual de transferencia: ${outcome}`,
        isPublic: true,
      };

      const orders = prev.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: newOrdStatus, paymentStatus: newPayStatus, updatedAt: now, history: [...o.history, newHist] }
          : o
      );

      const payments = prev.payments.map((p) =>
        p.orderId === orderId ? { ...p, status: newPayStatus, updatedAt: now } : p
      );

      return { ...prev, orders, payments };
    });
  },

  simulatePayPhone: (orderId: string, success: boolean, actorName: string) => {
    const now = new Date().toISOString();
    orderStore.setState((prev) => {
      const target = prev.orders.find((o) => o.id === orderId);
      if (!target) return prev;

      const newPayStatus: PaymentStatus = success ? 'APPROVED' : 'FAILED';
      const newOrdStatus: OrderStatus = success ? 'CONFIRMED' : target.status;

      const newHist: OrderStatusHistory = {
        id: generateId('hist'),
        orderId,
        eventType: success ? 'PAYPHONE_SUCCESS' : 'PAYPHONE_FAILED',
        previousStatus: target.status,
        newStatus: newOrdStatus,
        createdAt: now,
        actor: actorName || 'PayPhone Gateway MOCK',
        origin: 'MOCK_PROVIDER',
        comment: success ? 'Pago aprobado por tarjeta' : 'Transacción rechazada por el banco emisor',
        isPublic: true,
      };

      const orders = prev.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: newOrdStatus, paymentStatus: newPayStatus, updatedAt: now, history: [...o.history, newHist] }
          : o
      );

      const payments = prev.payments.map((p) =>
        p.orderId === orderId ? { ...p, status: newPayStatus, updatedAt: now } : p
      );

      return { ...prev, orders, payments };
    });
  },
};
