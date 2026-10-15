import React from 'react';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { Clock, CheckSquare, Truck, DollarSign } from 'lucide-react';

interface SellerKpiGridProps {
  pendingVerificationCount: number;
  myAssignedCount: number;
  toDispatchCount: number;
  managedSales: number;
}

export const SellerKpiGrid: React.FC<SellerKpiGridProps> = ({
  pendingVerificationCount,
  myAssignedCount,
  toDispatchCount,
  managedSales,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-[20px] border border-[#E9DFE4] space-y-1 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#665D65]">
          <span>Por revisar pago</span>
          <Clock className="w-4 h-4 text-[#9A6200]" />
        </div>
        <p className="text-2xl font-bold text-[#9A6200] font-data">{pendingVerificationCount}</p>
        <span className="text-[11px] text-[#665D65]">Transferencias pendientes</span>
      </div>

      <div className="bg-white p-5 rounded-[20px] border border-[#E9DFE4] space-y-1 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#665D65]">
          <span>Mis pedidos activos</span>
          <CheckSquare className="w-4 h-4 text-[#A91E50]" />
        </div>
        <p className="text-2xl font-bold text-[#A91E50] font-data">{myAssignedCount}</p>
        <span className="text-[11px] text-[#665D65]">Bajo mi responsabilidad</span>
      </div>

      <div className="bg-white p-5 rounded-[20px] border border-[#E9DFE4] space-y-1 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#665D65]">
          <span>Por despachar</span>
          <Truck className="w-4 h-4 text-[#267A59]" />
        </div>
        <p className="text-2xl font-bold text-[#267A59] font-data">{toDispatchCount}</p>
        <span className="text-[11px] text-[#665D65]">Pagos aprobados listos</span>
      </div>

      <div className="bg-white p-5 rounded-[20px] border border-[#E9DFE4] space-y-1 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#665D65]">
          <span>Ventas gestionadas</span>
          <DollarSign className="w-4 h-4 text-[#D52C69]" />
        </div>
        <p className="text-2xl font-bold text-[#241B24] font-data">{formatCurrency(managedSales)}</p>
        <span className="text-[11px] text-[#665D65]">Total pedidos aprobados</span>
      </div>
    </div>
  );
};
