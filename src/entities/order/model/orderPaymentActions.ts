import { operations } from '../../../shared/domain/operations.ts';
import { businessStore } from '../../../shared/domain/businessStore.ts';
import { generateId } from '../../../shared/lib/id.ts';
export const orderPaymentActions = {
  uploadTransferProof: (_orderId: string, _fileName: string, _customerName: string) => { throw new Error('Selecciona un archivo ficticio desde el nuevo cargador de comprobantes.'); },
  verifyTransfer: (orderId: string, outcome: 'APPROVE' | 'REQUIRE_CORRECTION' | 'REJECT', _actor: string, notes: string) => {
    const s = businessStore.getState(); const o = s.orders.find((o) => o.id === orderId); const p = s.payments.find((p) => p.orderId === orderId && ['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(p.status)); if (o && p) operations.review(orderId, p.id, outcome, notes, o.version!);
  },
  simulatePayPhone: (orderId: string, success: boolean, _actor: string) => operations.payphone(orderId, success ? 'SUCCESS' : 'FAILURE', generateId('payphone')),
};
