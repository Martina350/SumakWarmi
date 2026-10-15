import { createStore } from '../../../shared/lib/createStore.ts';
import { Order, Payment, Shipment, AuditLog } from '../../../shared/types/index.ts';
import { INITIAL_ORDERS, INITIAL_PAYMENTS, INITIAL_SHIPMENTS } from '../../../shared/data/index.ts';

export interface OrderState {
  orders: Order[];
  payments: Payment[];
  shipments: Shipment[];
  auditLogs: AuditLog[];
}

export const orderStore = createStore<OrderState>(
  {
    orders: INITIAL_ORDERS,
    payments: INITIAL_PAYMENTS,
    shipments: INITIAL_SHIPMENTS,
    auditLogs: [
      {
        id: 'aud-1',
        actorId: 'usr-admin-mercedes',
        actorName: 'Mercedes Cañizares',
        actorRole: 'ADMIN',
        action: 'SYSTEM_BOOT',
        entityType: 'SETTINGS',
        entityId: 'sys-init',
        details: 'Carga inicial del sistema SUMAKWARMI con catálogo y pedidos demo',
        createdAt: '2026-10-15T06:00:00.000Z',
      },
    ],
  },
  'sumakwarmi_orders_v1'
);

export const useOrderStore = orderStore.useStore;
