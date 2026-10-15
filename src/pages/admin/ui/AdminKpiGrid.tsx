import React from 'react';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react';

interface AdminKpiGridProps {
  totalPaidRevenue: number;
  paidOrdersCount: number;
  totalOrdersCount: number;
  avgTicket: number;
  lowStockCount: number;
}

export const AdminKpiGrid: React.FC<AdminKpiGridProps> = ({
  totalPaidRevenue,
  paidOrdersCount,
  totalOrdersCount,
  avgTicket,
  lowStockCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-[#E9DEE3] space-y-1">
        <div className="flex items-center justify-between text-xs text-[#716A70]">
          <span>Ventas netas pagadas</span>
          <DollarSign className="w-4 h-4 text-[#287A56]" />
        </div>
        <p className="text-2xl font-bold text-[#287A56] font-data">{formatCurrency(totalPaidRevenue)}</p>
        <span className="text-[11px] text-[#716A70]">{paidOrdersCount} pedidos aprobados</span>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#E9DEE3] space-y-1">
        <div className="flex items-center justify-between text-xs text-[#716A70]">
          <span>Total pedidos</span>
          <ShoppingBag className="w-4 h-4 text-[#7A3F65]" />
        </div>
        <p className="text-2xl font-bold text-[#272329] font-data">{totalOrdersCount}</p>
        <span className="text-[11px] text-[#716A70]">Histórico en plataforma</span>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#E9DEE3] space-y-1">
        <div className="flex items-center justify-between text-xs text-[#716A70]">
          <span>Ticket promedio</span>
          <DollarSign className="w-4 h-4 text-[#7A3F65]" />
        </div>
        <p className="text-2xl font-bold text-[#7A3F65] font-data">{formatCurrency(avgTicket)}</p>
        <span className="text-[11px] text-[#716A70]">Por pedido pagado</span>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#E9DEE3] space-y-1">
        <div className="flex items-center justify-between text-xs text-[#716A70]">
          <span>Alertas de stock</span>
          <AlertTriangle className="w-4 h-4 text-[#B43D4C]" />
        </div>
        <p className="text-2xl font-bold text-[#B43D4C] font-data">{lowStockCount}</p>
        <span className="text-[11px] text-[#716A70]">Variantes bajo umbral</span>
      </div>
    </div>
  );
};
