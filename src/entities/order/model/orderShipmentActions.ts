import { operations } from '../../../shared/domain/operations.ts';
import { businessStore } from '../../../shared/domain/businessStore.ts';
import { ShipmentStatus } from '../../../shared/types/index.ts';
const version = (id: string) => businessStore.getState().orders.find((o) => o.id === id)?.version || 0;
export const orderShipmentActions = {
  assignSeller: (id: string, sellerId: string, _sellerName: string, _actor: string) => operations.assign(id, sellerId, 'Asignación de pedido', version(id)),
  createOrUpdateShipment: (id: string, code: string, _actor: string, notes = '') => operations.registerShipment(id, code, notes, version(id)),
  updateShipmentStatus: (id: string, status: ShipmentStatus, _actor: string) => {
    if (['IN_TRANSIT', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNED'].includes(status)) operations.ship(id, status as 'IN_TRANSIT' | 'DELIVERED' | 'DELIVERY_FAILED' | 'RETURNED', 'Actualización logística DEMO', version(id));
  },
  resetOrders: () => operations.reset(),
};
