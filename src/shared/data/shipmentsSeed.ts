import { Shipment } from '../types/index.ts';

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'ship-102',
    orderId: 'ord-102',
    carrier: 'Servientrega',
    trackingNumber: 'SER-8492018',
    status: 'DISPATCHED',
    cost: 4.5,
    dispatchedAt: '2026-10-13T16:20:00.000Z',
    estimatedDeliveryDate: '2026-10-16',
    notes: 'Entregado en agencia Servientrega Mariscal',
    history: [
      {
        id: 'sh-1',
        shipmentId: 'ship-102',
        previousStatus: 'PREPARING',
        newStatus: 'DISPATCHED',
        actor: 'Andrea Morales',
        comment: 'Guía generada manualmente SER-8492018',
        createdAt: '2026-10-13T16:20:00.000Z',
      },
    ],
    createdAt: '2026-10-13T11:00:00.000Z',
    updatedAt: '2026-10-13T16:20:00.000Z',
  },
];
