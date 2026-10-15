import { Payment } from '../types/index.ts';

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-101',
    orderId: 'ord-101',
    amount: 32.5,
    method: 'TRANSFER',
    status: 'PENDING_VERIFICATION',
    proof: {
      id: 'proof-101',
      paymentId: 'pay-101',
      orderId: 'ord-101',
      fileName: 'comprobante_banco_pichincha_98234.png',
      fileSize: 245000,
      uploadedAt: '2026-10-14T14:35:00.000Z',
      fileUrl: '',
    },
    history: [
      {
        id: 'ph-1',
        paymentId: 'pay-101',
        previousStatus: 'PENDING',
        newStatus: 'PENDING_VERIFICATION',
        actor: 'Martina León',
        comment: 'Comprobante cargado por la clienta',
        createdAt: '2026-10-14T14:35:00.000Z',
      },
    ],
    createdAt: '2026-10-14T14:30:00.000Z',
    updatedAt: '2026-10-14T14:35:00.000Z',
  },
  {
    id: 'pay-102',
    orderId: 'ord-102',
    amount: 34.5,
    method: 'PAYPHONE',
    status: 'APPROVED',
    history: [
      {
        id: 'ph-2',
        paymentId: 'pay-102',
        previousStatus: 'PENDING',
        newStatus: 'APPROVED',
        actor: 'PayPhone Mock Gateway',
        comment: 'Transacción aprobada ID: PP-MOCK-9281',
        createdAt: '2026-10-13T10:02:00.000Z',
      },
    ],
    createdAt: '2026-10-13T10:00:00.000Z',
    updatedAt: '2026-10-13T10:02:00.000Z',
  },
];
