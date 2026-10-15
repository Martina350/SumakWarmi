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
      <div className="bg-white p-5 rounded-[20px] border border-[#E9DFE4] space-y-1 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#665D65]">
          <span>Ventas netas pagadas</span>
          <DollarSign className="w-4 h-4 text-[#267A59]" />
        </div>
        <p className="text-2xl font-bold text-[#267A59] font-data">{formatCurrency(totalPaidRevenue)}</p>
        <span className="text-[11px] text-[#665D65]">{paidOrdersCount} pedidos aprobados</span>
      </div>

      <div className="bg-white p-5 rounded-[20px] border border-[#E9DFE4] space-y-1 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#665D65]">
          <span>Total pedidos</span>
          <ShoppingBag className="w-4 h-4 text-[#D52C69]" />
        </div>
        <p className="text-2xl font-bold text-[#241B24] font-data">{totalOrdersCount}</p>
        <span className="text-[11px] text-[#665D65]">Histórico en plataforma</span>
      </div>

      <div className="bg-white p-5 rounded-[20px] border border-[#E9DFE4] space-y-1 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#665D65]">
          <span>Ticket promedio</span>
          <DollarSign className="w-4 h-4 text-[#A91E50]" />
        </div>
        <p className="text-2xl font-bold text-[#A91E50] font-data">{formatCurrency(avgTicket)}</p>
        <span className="text-[11px] text-[#665D65]">Por pedido pagado</span>
      </div>

      <div className="bg-white p-5 rounded-[20px] border border-[#E9DFE4] space-y-1 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#665D65]">
          <span>Alertas de stock</span>
          <AlertTriangle className="w-4 h-4 text-[#B42336]" />
        </div>
        <p className="text-2xl font-bold text-[#B42336] font-data">{lowStockCount}</p>
        <span className="text-[11px] text-[#665D65]">Variantes bajo umbral</span>
      </div>
    </div>
  );
};
