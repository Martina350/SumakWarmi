import { orderStore } from './orderStore.ts';
import { generateId } from '../../../shared/lib/id.ts';
import { Shipment, OrderStatusHistory, ShipmentStatus } from '../../../shared/types/index.ts';
import { INITIAL_ORDERS, INITIAL_PAYMENTS, INITIAL_SHIPMENTS } from '../../../shared/data/index.ts';

export const orderShipmentActions = {
  assignSeller: (orderId: string, sellerId: string, sellerName: string, actorName: string) => {
    const now = new Date().toISOString();
    orderStore.setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              assignedSellerId: sellerId,
              assignedSellerName: sellerName,
              updatedAt: now,
              history: [
                ...o.history,
                {
                  id: generateId('hist'),
                  orderId,
                  eventType: 'SELLER_ASSIGNED',
                  previousStatus: o.status,
                  newStatus: o.status,
                  createdAt: now,
                  actor: actorName,
                  origin: 'SELLER' as const,
                  comment: `Pedido asignado a ${sellerName}`,
                  isPublic: false,
                },
              ],
            }
          : o
      ),
    }));
  },

  createOrUpdateShipment: (
    orderId: string,
    trackingNumber: string,
    actorName: string,
    notes?: string
  ) => {
    const now = new Date().toISOString();
    orderStore.setState((prev) => {
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order) return prev;

      const existingShipment = prev.shipments.find((s) => s.orderId === orderId);
      const newShipment: Shipment = existingShipment
        ? {
            ...existingShipment,
            trackingNumber,
            status: 'DISPATCHED',
            dispatchedAt: now,
            notes: notes || existingShipment.notes,
            updatedAt: now,
          }
        : {
            id: generateId('ship'),
            orderId,
            carrier: 'Servientrega',
            trackingNumber,
            status: 'DISPATCHED',
            cost: order.shippingCost,
            dispatchedAt: now,
            notes: notes || 'Despachado manualmente por vendedor',
            history: [],
            createdAt: now,
            updatedAt: now,
          };

      const newHist: OrderStatusHistory = {
        id: generateId('hist'),
        orderId,
        eventType: 'SHIPMENT_DISPATCHED',
        previousStatus: order.status,
        newStatus: 'READY_FOR_SHIPMENT',
        createdAt: now,
        actor: actorName,
        origin: 'SELLER',
        comment: `Guía Servientrega ${trackingNumber} registrada`,
        isPublic: true,
      };

      const shipments = existingShipment
        ? prev.shipments.map((s) => (s.orderId === orderId ? newShipment : s))
        : [...prev.shipments, newShipment];

      const orders = prev.orders.map((o) =>
        o.id === orderId
          ? { ...o, shipmentStatus: 'DISPATCHED' as const, status: 'READY_FOR_SHIPMENT' as const, updatedAt: now, history: [...o.history, newHist] }
          : o
      );

      return { ...prev, orders, shipments };
    });
  },

  updateShipmentStatus: (orderId: string, newStatus: ShipmentStatus, actorName: string) => {
    const now = new Date().toISOString();
    orderStore.setState((prev) => {
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order) return prev;

      const newOrdStatus = newStatus === 'DELIVERED' ? 'COMPLETED' : order.status;

      const shipments = prev.shipments.map((s) =>
        s.orderId === orderId ? { ...s, status: newStatus, updatedAt: now, deliveredAt: newStatus === 'DELIVERED' ? now : s.deliveredAt } : s
      );

      const newHist: OrderStatusHistory = {
        id: generateId('hist'),
        orderId,
        eventType: `SHIPMENT_${newStatus}`,
        previousStatus: order.status,
        newStatus: newOrdStatus,
        createdAt: now,
        actor: actorName,
        origin: 'SELLER' as const,
        comment: `Estado de logística actualizado a: ${newStatus}`,
        isPublic: true,
      };

      const orders = prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              shipmentStatus: newStatus,
              status: newOrdStatus,
              updatedAt: now,
              history: [...o.history, newHist],
            }
          : o
      );

      return { ...prev, orders, shipments };
    });
  },

  resetOrders: () => {
    orderStore.setState({
      orders: INITIAL_ORDERS,
      payments: INITIAL_PAYMENTS,
      shipments: INITIAL_SHIPMENTS,
      auditLogs: [],
    });
  },
};
