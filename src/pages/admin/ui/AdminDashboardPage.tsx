import React, { useState } from 'react';
import { useSessionStore } from '../../../entities/session/index.ts';
import { useOrderStore } from '../../../entities/order/index.ts';
import { useCatalogStore } from '../../../entities/catalog/index.ts';
import { AdminKpiGrid } from './AdminKpiGrid.tsx';
import { AdminCatalogTab } from './AdminCatalogTab.tsx';
import { AdminInventoryTab } from './AdminInventoryTab.tsx';
import { AdminSellersTab } from './AdminSellersTab.tsx';
import { SellerOrdersTable } from '../../seller/ui/SellerOrdersTable.tsx';
import { Tabs } from '../../../shared/ui/Tabs.tsx';
import { formatDate } from '../../../shared/lib/formatters.ts';
import { ShieldAlert, History } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser } = useSessionStore();
  const { orders, auditLogs } = useOrderStore();
  const { products } = useCatalogStore();
  const [activeTab, setActiveTab] = useState('orders');

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-[#B43D4C] mx-auto" />
        <h2 className="text-xl font-bold font-serif-display text-[#272329]">Panel exclusivo para Administrador</h2>
        <p className="text-xs text-[#716A70]">Utiliza el selector superior para cambiar al rol de Mercedes Cañizares (ADMIN).</p>
      </div>
    );
  }

  const paidOrders = orders.filter((o) => o.paymentStatus === 'APPROVED');
  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const avgTicket = paidOrders.length > 0 ? totalPaidRevenue / paidOrders.length : 0;
  const lowStockCount = products.reduce((count, p) => count + p.variants.filter((v) => v.stockActual <= v.stockMinimo).length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      <div>
        <span className="text-xs font-semibold text-[#7A3F65] uppercase tracking-wider">Dirección & Control Global</span>
        <h1 className="text-3xl font-serif-display font-bold text-[#272329] mt-0.5">Panel de Administración · SUMAKWARMI</h1>
        <p className="text-xs text-[#716A70]">Métricas comerciales, catálogo de productos, inventario y cuentas de equipo.</p>
      </div>

      <AdminKpiGrid totalPaidRevenue={totalPaidRevenue} paidOrdersCount={paidOrders.length} totalOrdersCount={orders.length} avgTicket={avgTicket} lowStockCount={lowStockCount} />

      <div className="space-y-4">
        <Tabs
          tabs={[
            { id: 'orders', label: 'Todos los pedidos', count: orders.length },
            { id: 'catalog', label: 'Catálogo & Precios', count: products.length },
            { id: 'inventory', label: 'Inventario' },
            { id: 'sellers', label: 'Vendedores & Accesos' },
            { id: 'audit', label: 'Auditoría inmutable' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'orders' && <SellerOrdersTable orders={orders} currentUserId={currentUser.id} onTakeOrder={() => {}} onOpenVerifyModal={() => {}} onOpenDispatchModal={() => {}} onMarkDelivered={() => {}} />}
        {activeTab === 'catalog' && <AdminCatalogTab />}
        {activeTab === 'inventory' && <AdminInventoryTab />}
        {activeTab === 'sellers' && <AdminSellersTab />}
        {activeTab === 'audit' && (
          <div className="p-4 bg-white rounded-2xl border border-[#E9DEE3] space-y-3">
            <h4 className="text-xs font-bold text-[#716A70] uppercase flex items-center gap-1.5"><History className="w-4 h-4 text-[#7A3F65]" /><span>Registro de eventos del sistema (Auditoría inmutable)</span></h4>
            <div className="divide-y divide-[#E9DEE3] text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex justify-between items-start gap-4">
                  <div>
                    <span className="font-bold text-[#272329]">{log.action}</span> · <span className="text-[#716A70]">{log.details}</span>
                    <span className="block text-[11px] text-[#716A70] mt-0.5">Actor: {log.actorName} ({log.actorRole})</span>
                  </div>
                  <span className="font-data text-[#716A70] shrink-0">{formatDate(log.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
