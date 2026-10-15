import React, { useState } from 'react';
import { useSessionStore } from '../../../entities/session/index.ts';
import { useOrderStore, orderShipmentActions } from '../../../entities/order/index.ts';
import { SellerOrdersTable } from './SellerOrdersTable.tsx';
import { SellerKpiGrid } from './SellerKpiGrid.tsx';
import { TransferVerificationModal } from '../../../features/orders/ui/TransferVerificationModal.tsx';
import { ShipmentDispatchModal } from '../../../features/orders/ui/ShipmentDispatchModal.tsx';
import { Order } from '../../../shared/types/index.ts';
import { Tabs } from '../../../shared/ui/Tabs.tsx';
import { ShieldAlert } from 'lucide-react';

export const SellerPanelPage: React.FC = () => {
  const { currentUser } = useSessionStore();
  const { orders, payments } = useOrderStore();
  const [activeTab, setActiveTab] = useState('unassigned');
  const [verifyModalOrder, setVerifyModalOrder] = useState<Order | null>(null);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);

  if (!currentUser || (currentUser.role !== 'SELLER' && currentUser.role !== 'ADMIN')) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-[#B42336] mx-auto" />
        <h2 className="text-xl font-bold font-heading text-[#241B24]">Acceso restringido</h2>
        <p className="text-xs text-[#665D65]">Vista exclusiva para personal comercial autorizado.</p>
      </div>
    );
  }

  const pendingVerificationCount = orders.filter((o) => o.paymentStatus === 'PENDING_VERIFICATION').length;
  const myAssignedOrders = orders.filter((o) => o.assignedSellerId === currentUser.id);
  const toDispatchCount = orders.filter((o) => o.paymentStatus === 'APPROVED' && o.shipmentStatus !== 'DISPATCHED' && o.shipmentStatus !== 'DELIVERED').length;
  const managedSales = myAssignedOrders.filter((o) => o.paymentStatus === 'APPROVED').reduce((sum, o) => sum + o.total, 0);

  let filteredOrders = orders;
  if (activeTab === 'unassigned') filteredOrders = orders.filter((o) => !o.assignedSellerId);
  else if (activeTab === 'my-orders') filteredOrders = myAssignedOrders;
  else if (activeTab === 'pending-payment') filteredOrders = orders.filter((o) => o.paymentStatus === 'PENDING_VERIFICATION');
  else if (activeTab === 'to-dispatch') filteredOrders = orders.filter((o) => o.paymentStatus === 'APPROVED' && o.shipmentStatus !== 'DISPATCHED' && o.shipmentStatus !== 'DELIVERED');
  else if (activeTab === 'dispatched') filteredOrders = orders.filter((o) => o.shipmentStatus === 'DISPATCHED' || o.shipmentStatus === 'DELIVERED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      <div>
        <span className="text-xs font-semibold text-[#A91E50] uppercase tracking-wider">Operación Comercial</span>
        <h1 className="text-3xl font-heading font-bold text-[#241B24] mt-0.5">Panel de Vendedor · {currentUser.name}</h1>
        <p className="text-xs text-[#665D65]">Gestión de pedidos, verificación de transferencias y despachos Servientrega.</p>
      </div>

      <SellerKpiGrid
        pendingVerificationCount={pendingVerificationCount}
        myAssignedCount={myAssignedOrders.length}
        toDispatchCount={toDispatchCount}
        managedSales={managedSales}
      />

      <div className="space-y-4">
        <Tabs
          tabs={[
            { id: 'unassigned', label: 'Sin asignar', count: orders.filter((o) => !o.assignedSellerId).length },
            { id: 'my-orders', label: 'Mis pedidos', count: myAssignedOrders.length },
            { id: 'pending-payment', label: 'Por revisar pago', count: pendingVerificationCount },
            { id: 'to-dispatch', label: 'Por despachar', count: toDispatchCount },
            { id: 'dispatched', label: 'Despachados / Entregados' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <SellerOrdersTable
          orders={filteredOrders}
          currentUserId={currentUser.id}
          onTakeOrder={(id) => orderShipmentActions.assignSeller(id, currentUser.id, currentUser.name, currentUser.name)}
          onOpenVerifyModal={setVerifyModalOrder}
          onOpenDispatchModal={setDispatchModalOrder}
          onMarkDelivered={(id) => orderShipmentActions.updateShipmentStatus(id, 'DELIVERED', currentUser.name)}
        />
      </div>

      {verifyModalOrder && (
        <TransferVerificationModal
          isOpen={Boolean(verifyModalOrder)}
          onClose={() => setVerifyModalOrder(null)}
          order={verifyModalOrder}
          payment={payments.find((p) => p.orderId === verifyModalOrder.id)}
          currentActorName={currentUser.name}
        />
      )}

      {dispatchModalOrder && (
        <ShipmentDispatchModal
          isOpen={Boolean(dispatchModalOrder)}
          onClose={() => setDispatchModalOrder(null)}
          order={dispatchModalOrder}
          currentActorName={currentUser.name}
        />
      )}
    </div>
  );
};
