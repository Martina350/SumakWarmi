import React, { useState } from 'react';
import {
  useBusinessStore,
  available,
} from '../../../shared/domain/businessStore.ts';
import { visibleOrders, can } from '../../../shared/domain/operations.ts';
import { report } from '../../../shared/domain/reporting.ts';
import { User, Order } from '../../../shared/types/index.ts';
import { formatDate, formatCurrency } from '../../../shared/lib/formatters.ts';
import { Heading, Field, Empty, money, type Run } from './common.tsx';
import { ModernBarChart, ModernDonutChart } from './WorkspaceCharts.tsx';
import {
  UrgentActionModal,
  type UrgentCategory,
} from './UrgentActionModal.tsx';
import { OrderManagementModal } from './OrderManagementModal.tsx';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Truck,
  AlertCircle,
  Clock,
  UserCheck,
  Package,
  Boxes,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react';

export function Dashboard({
  user,
  navigate,
  run = (action) => {
    action();
    return true;
  },
  reportMode = false,
  sellerId,
}: {
  user: User;
  navigate: (p: string) => void;
  run?: Run;
  reportMode?: boolean;
  sellerId?: string;
}) {
  const s = useBusinessStore();
  const admin = user.role === 'ADMIN';
  const ownId = sellerId || (admin ? undefined : user.id);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [period, setPeriod] = useState('all');

  // Modal states
  const [activeUrgentCategory, setActiveUrgentCategory] =
    useState<UrgentCategory | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const data = report(s, ownId, from, to);
  const orders = visibleOrders(s, user);
  const own = orders.filter((o) => o.assignedSellerId === (ownId || user.id));

  const setPreset = (value: string) => {
    setPeriod(value);
    const end = new Date();
    const start = new Date(end);
    if (value === 'day') start.setDate(end.getDate());
    if (value === 'week') start.setDate(end.getDate() - 6);
    if (value === 'month') start.setDate(1);
    if (value === 'year') {
      start.setMonth(0);
      start.setDate(1);
    }
    setFrom(
      value === 'all'
        ? ''
        : start.toLocaleDateString('en-CA', { timeZone: s.settings.timezone }),
    );
    setTo(
      value === 'all'
        ? ''
        : end.toLocaleDateString('en-CA', { timeZone: s.settings.timezone }),
    );
  };

  // Urgent categories definitions
  const paymentsReviewOrders = orders.filter((o) =>
    ['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(o.paymentStatus),
  );
  const unassignedOrders = orders.filter(
    (o) => !o.assignedSellerId && o.paymentStatus === 'APPROVED',
  );
  const preparingOrders = (admin ? orders : own).filter((o) =>
    ['CONFIRMED', 'PROCESSING'].includes(o.status),
  );
  const dispatchOrders = (admin ? orders : own).filter(
    (o) => o.status === 'READY_FOR_SHIPMENT',
  );
  const incidentOrders = (admin ? orders : own).filter((o) => !!o.incident);
  const criticalVariants = s.products.flatMap((p) =>
    p.variants
      .filter((v) => available(v) <= v.stockMinimo)
      .map((v) => ({ product: p.name, variant: v })),
  );

  const urgentCards = [
    ...(admin || can(user, 'payments.review')
      ? [
          {
            type: 'payments_review' as const,
            title: 'Pagos por revisar',
            description: 'Comprobantes bancarios que requieren verificación.',
            count: paymentsReviewOrders.length,
            icon: Clock,
            badgeClass: 'bg-[#FFF1D9] text-[#9A6200]',
            orders: paymentsReviewOrders,
          },
        ]
      : []),
    {
      type: 'unassigned' as const,
      title: admin ? 'Sin responsable' : 'Cola disponible',
      description: 'Pedidos pagados esperando asignación de vendedor.',
      count: unassignedOrders.length,
      icon: UserCheck,
      badgeClass: 'bg-[#EAF3FF] text-[#2563A6]',
      orders: unassignedOrders,
    },
    {
      type: 'preparing' as const,
      title: 'Por preparar',
      description: 'Productos listos para selección, control y empaque.',
      count: preparingOrders.length,
      icon: Package,
      badgeClass: 'bg-[#FBE7ED] text-[#D52C69]',
      orders: preparingOrders,
    },
    {
      type: 'dispatch' as const,
      title: 'Por despachar',
      description: 'Paquetes preparados esperando guía de transporte.',
      count: dispatchOrders.length,
      icon: Truck,
      badgeClass: 'bg-[#E8F3EE] text-[#267A59]',
      orders: dispatchOrders,
    },
    {
      type: 'incidents' as const,
      title: 'Incidencias',
      description: 'Pedidos con alertas operativas o incidencias reportadas.',
      count: incidentOrders.length,
      icon: AlertCircle,
      badgeClass: 'bg-[#FDEBED] text-[#B42336]',
      orders: incidentOrders,
    },
    ...(admin
      ? [
          {
            type: 'critical_skus' as const,
            title: 'SKU críticos',
            description: 'Productos con existencias inferiores al stock mínimo.',
            count: criticalVariants.length,
            icon: Boxes,
            badgeClass: 'bg-[#FDEBED] text-[#B42336]',
            orders: [],
          },
        ]
      : []),
  ];

  // Active list for the urgent modal
  const activeOrdersForModal =
    activeUrgentCategory?.type === 'payments_review'
      ? paymentsReviewOrders
      : activeUrgentCategory?.type === 'unassigned'
        ? unassignedOrders
        : activeUrgentCategory?.type === 'preparing'
          ? preparingOrders
          : activeUrgentCategory?.type === 'dispatch'
            ? dispatchOrders
            : activeUrgentCategory?.type === 'incidents'
              ? incidentOrders
              : [];

  // Conversion rate percentage
  const conversionRate =
    data.created > 0 ? Math.round((data.paidCount / data.created) * 100) : 100;

  return (
    <div className="space-y-7 text-left">
      {/* Header with Title and Period Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E9DFE4]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241B24] font-heading tracking-tight">
            {reportMode
              ? ownId
                ? 'Rendimiento comercial'
                : 'Reportes del negocio'
              : admin
                ? 'Resumen del negocio'
                : `Hola, ${user.name.split(' ')[0]}`}
          </h1>
          <p className="text-xs sm:text-sm text-[#665D65] mt-1">
            Métricas operativas y financieras actualizadas en tiempo real.
          </p>
        </div>

        {/* Modern Period Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#E9DFE4] shadow-2xs">
          {[
            { id: 'all', label: 'Todo' },
            { id: 'day', label: 'Hoy' },
            { id: 'week', label: '7 días' },
            { id: 'month', label: 'Este mes' },
            { id: 'year', label: 'Año' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPreset(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                period === item.id
                  ? 'bg-[#EE839F] text-white shadow-xs'
                  : 'text-[#665D65] hover:text-[#241B24] hover:bg-[#FFF7F9]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Curated Executive KPIs (High visual depth, clean and focused) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Ventas Netas */}
        <div className="p-5 bg-white rounded-[24px] border border-[#E9DFE4] shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#665D65] uppercase tracking-wider">
              Ventas Netas
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FBE7ED] flex items-center justify-center text-[#D52C69] group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#241B24] font-data">
              {money(data.net)}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-[#267A59]">
                <Sparkles className="w-3 h-3" />
                Bruto: {money(data.gross)}
              </span>
              {data.refunds > 0 && (
                <span className="text-[#B42336] font-medium">
                  Reembolsos: {money(data.refunds)}
                </span>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D52C69] to-[#EE839F]" />
        </div>

        {/* 2. Pedidos Confirmados */}
        <div className="p-5 bg-white rounded-[24px] border border-[#E9DFE4] shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#665D65] uppercase tracking-wider">
              Pedidos Pagados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E8F3EE] flex items-center justify-center text-[#267A59] group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#241B24] font-data">
              {data.paidCount}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-[#665D65]">
              <span className="font-semibold text-[#267A59] bg-[#E8F3EE] px-2 py-0.5 rounded-full">
                {conversionRate}% conversión
              </span>
              <span>de {data.created} pedidos</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#267A59]" />
        </div>

        {/* 3. Ticket Promedio */}
        <div className="p-5 bg-white rounded-[24px] border border-[#E9DFE4] shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#665D65] uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] flex items-center justify-center text-[#2563A6] group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#241B24] font-data">
              {money(data.average)}
            </h3>
            <p className="mt-2 text-xs text-[#665D65]">
              Importe medio por orden liquidada
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2563A6]" />
        </div>

        {/* 4. Envíos y Logística */}
        <div className="p-5 bg-white rounded-[24px] border border-[#E9DFE4] shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#665D65] uppercase tracking-wider">
              Logística Servientrega
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF1D9] flex items-center justify-center text-[#9A6200] group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#241B24] font-data">
              {
                (admin && !ownId ? orders : own).filter(
                  (o) => o.shipmentStatus === 'DELIVERED',
                ).length
              }{' '}
              <span className="text-sm font-normal text-[#665D65]">entregados</span>
            </h3>
            <p className="mt-2 text-xs text-[#665D65]">
              {
                (admin && !ownId ? orders : own).filter((o) =>
                  ['IN_TRANSIT', 'DISPATCHED'].includes(o.shipmentStatus),
                ).length
              }{' '}
              paquetes en tránsito actualmente
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#9A6200]" />
        </div>
      </div>

      {/* Atención Prioritaria (Interactive Action Cards that open Modals) */}
      {!reportMode && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#241B24] font-heading flex items-center gap-2">
              <span>Bandeja de Atención Prioritaria</span>
              <span className="text-xs font-normal text-[#665D65]">
                (Haz clic para resolver directamente en modal)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {urgentCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={() =>
                    setActiveUrgentCategory({
                      type: card.type,
                      title: card.title,
                      description: card.description,
                    })
                  }
                  className="p-4 bg-white hover:bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4] hover:border-[#EE839F] shadow-2xs hover:shadow-md transition-all duration-200 text-left group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#241B24] truncate">
                      {card.title}
                    </span>
                    <Icon className="w-4 h-4 text-[#665D65] group-hover:text-[#D52C69] transition-colors shrink-0" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-data text-[#A91E50]">
                      {card.count}
                    </span>
                    <span className="text-[10px] font-semibold text-[#EE839F] group-hover:translate-x-0.5 transition-transform">
                      Abrir →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Interactive Charts Section (Bar Chart + Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ModernBarChart
            data={data.byDay}
            title="Evolución de Ingresos Confirmados"
            subtitle="Ventas brutas diarias por fecha de aprobación (USD)"
          />
        </div>
        <div className="lg:col-span-5">
          <ModernDonutChart
            data={data.byCategory}
            title="Distribución por Categorías"
            subtitle="Porcentaje y volumen por categoría de producto"
          />
        </div>
      </div>

      {/* Commercial Attribution (Admin only) */}
      {admin && !ownId && (
        <section className="bg-white rounded-[24px] border border-[#E9DFE4] p-5 sm:p-6 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#241B24] font-heading">
              Rendimiento y Atribución por Vendedor
            </h3>
            <p className="text-xs text-[#665D65]">
              Seguimiento de pedidos tomados y volumen de ventas netas por asesor
            </p>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E9DFE4] text-[#665D65]">
                  <th className="pb-3 font-semibold">Responsable comercial</th>
                  <th className="pb-3 font-semibold">Ventas netas</th>
                  <th className="pb-3 font-semibold">Pedidos pagados</th>
                  <th className="pb-3 font-semibold">Abiertos asignados actualmente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0F2]">
                {s.users
                  .filter((u) => u.role === 'SELLER')
                  .map((u) => {
                    const d = report(s, u.id, from, to);
                    return (
                      <tr key={u.id} className="hover:bg-[#FFF7F9] transition-colors">
                        <td className="py-3 font-semibold text-[#241B24]">{u.name}</td>
                        <td className="py-3 font-data font-bold text-[#A91E50]">
                          {money(d.net)}
                        </td>
                        <td className="py-3 font-data">{d.paidCount}</td>
                        <td className="py-3 font-data">
                          {
                            s.orders.filter(
                              (o) =>
                                o.assignedSellerId === u.id &&
                                ![
                                  'COMPLETED',
                                  'CANCELLED',
                                  'EXPIRED',
                                  'RETURNED',
                                ].includes(o.status),
                            ).length
                          }
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Latest Orders List with In-Place Modal Viewer */}
      <section className="bg-white rounded-[24px] border border-[#E9DFE4] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#241B24] font-heading">
              Últimos Pedidos Registrados
            </h3>
            <p className="text-xs text-[#665D65]">
              Haz clic en "Ver pedido" para gestionar pagos, preparación y despacho sin salir
            </p>
          </div>
          <button
            onClick={() => navigate('/ventas')}
            className="text-xs font-semibold text-[#A91E50] hover:text-[#D52C69] transition-colors cursor-pointer"
          >
            Ver todos los pedidos →
          </button>
        </div>

        <div className="divide-y divide-[#E9DFE4]">
          {[...(ownId ? own : orders)]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 5)
            .map((o) => (
              <div
                key={o.id}
                className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-[#FFF7F9] px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-[#241B24] font-heading">
                      {o.orderNumber}
                    </strong>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FBE7ED] text-[#A91E50]">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#665D65] mt-1">
                    {o.customerName} · {formatDate(o.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold font-data text-[#241B24]">
                    {formatCurrency(o.total)}
                  </span>
                  <button
                    onClick={() => setSelectedOrderId(o.id)}
                    className="px-3 py-1.5 bg-[#FFF7F9] hover:bg-[#EE839F] border border-[#EE839F]/40 text-[#A91E50] hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver pedido</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Urgent Action Modal */}
      <UrgentActionModal
        isOpen={!!activeUrgentCategory}
        onClose={() => setActiveUrgentCategory(null)}
        category={activeUrgentCategory}
        orders={activeOrdersForModal}
        criticalVariants={criticalVariants}
        user={user}
        run={run}
        onSelectOrder={(id) => {
          setActiveUrgentCategory(null);
          setSelectedOrderId(id);
        }}
      />

      {/* Order In-Place Management Modal */}
      <OrderManagementModal
        orderId={selectedOrderId}
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        user={user}
        run={run}
      />
    </div>
  );
}
