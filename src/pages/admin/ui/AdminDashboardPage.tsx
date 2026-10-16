import React, { useState } from 'react';
import { useStaffSessionStore } from '../../../entities/session/model/staffSessionStore.ts';
import { useOrderStore } from '../../../entities/order/index.ts';
import { useCatalogStore } from '../../../entities/catalog/index.ts';
import { AdminKpiGrid } from './AdminKpiGrid.tsx';
import { AdminCatalogTab } from './AdminCatalogTab.tsx';
import { AdminInventoryTab } from './AdminInventoryTab.tsx';
import { AdminSellersTab } from './AdminSellersTab.tsx';
import { SellerOrdersTable } from '../../seller/ui/SellerOrdersTable.tsx';
import { StaffLayout } from '../../../widgets/staff-layout/ui/StaffLayout.tsx';
import { formatDate } from '../../../shared/lib/formatters.ts';
import { ShieldAlert, History } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser } = useStaffSessionStore();
  const { orders, auditLogs } = useOrderStore();
  const { products } = useCatalogStore();
  const [activeTab, setActiveTab] = useState('orders');

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-[#B42336] mx-auto" />
        <h2 className="text-xl font-bold font-heading text-[#241B24]">Panel exclusivo para Administrador</h2>
        <p className="text-xs text-[#665D65]">Inicia sesión con una cuenta administrativa activa.</p>
      </div>
    );
  }

  const paidOrders = orders.filter((o) => o.paymentStatus === 'APPROVED');
  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const avgTicket = paidOrders.length > 0 ? totalPaidRevenue / paidOrders.length : 0;
  const lowStockCount = products.reduce((count, p) => count + p.variants.filter((v) => v.stockActual <= v.stockMinimo).length, 0);

  return (
    <StaffLayout
      tabs={[
        { id: 'orders', label: 'Todos los pedidos', count: orders.length },
        { id: 'catalog', label: 'Catálogo & Precios', count: products.length },
        { id: 'inventory', label: 'Inventario' },
        { id: 'sellers', label: 'Vendedores & Accesos' },
        { id: 'audit', label: 'Auditoría inmutable' },
      ]}
      activeTab={activeTab}
      onChange={setActiveTab}
    >
      <div className="space-y-8 text-left">
      <div>
        <span className="text-xs font-semibold text-[#A91E50] uppercase tracking-wider">Dirección & Control Global</span>
        <h1 className="text-3xl font-heading font-bold text-[#241B24] mt-0.5">Panel de Administración · SUMAKWARMI</h1>
        <p className="text-xs text-[#665D65]">Métricas comerciales, catálogo de productos, inventario y cuentas de equipo.</p>
      </div>

      <AdminKpiGrid
        totalPaidRevenue={totalPaidRevenue}
        paidOrdersCount={paidOrders.length}
        totalOrdersCount={orders.length}
        avgTicket={avgTicket}
        lowStockCount={lowStockCount}
      />

      <div className="space-y-4">


        {activeTab === 'orders' && (
          <SellerOrdersTable
            readOnly
            orders={orders}
            currentUserId={currentUser.id}
            onTakeOrder={() => {}}
            onOpenVerifyModal={() => {}}
            onOpenDispatchModal={() => {}}
            onMarkDelivered={() => {}}
          />
        )}
        {activeTab === 'catalog' && <AdminCatalogTab />}
        {activeTab === 'inventory' && <AdminInventoryTab />}
        {activeTab === 'sellers' && <AdminSellersTab />}
        {activeTab === 'audit' && (
          <div className="p-5 bg-white rounded-[20px] border border-[#E9DFE4] space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold text-[#665D65] uppercase flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#D52C69]" />
              <span>Registro de eventos del sistema (Auditoría inmutable)</span>
            </h4>
            <div className="divide-y divide-[#E9DFE4] text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex justify-between items-start gap-4">
                  <div>
                    <span className="font-bold text-[#241B24]">{log.action}</span> ·{' '}
                    <span className="text-[#665D65]">{log.details}</span>
                    <span className="block text-[11px] text-[#665D65] mt-0.5">
                      Actor: <strong>{log.actorName}</strong> ({log.actorRole})
                    </span>
                  </div>
                  <span className="font-data text-[#665D65] shrink-0">{formatDate(log.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};
