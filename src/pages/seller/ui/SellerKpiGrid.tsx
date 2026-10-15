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
      <div className="bg-white p-5 rounded-2xl border border-[#E9DEE3] space-y-1">
        <div className="flex items-center justify-between text-xs text-[#716A70]">
          <span>Por revisar pago</span>
          <Clock className="w-4 h-4 text-[#9A6414]" />
        </div>
        <p className="text-2xl font-bold text-[#9A6414] font-data">{pendingVerificationCount}</p>
        <span className="text-[11px] text-[#716A70]">Transferencias pendientes</span>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#E9DEE3] space-y-1">
        <div className="flex items-center justify-between text-xs text-[#716A70]">
          <span>Mis pedidos activos</span>
          <CheckSquare className="w-4 h-4 text-[#7A3F65]" />
        </div>
        <p className="text-2xl font-bold text-[#7A3F65] font-data">{myAssignedCount}</p>
        <span className="text-[11px] text-[#716A70]">Bajo mi responsabilidad</span>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#E9DEE3] space-y-1">
        <div className="flex items-center justify-between text-xs text-[#716A70]">
          <span>Por despachar</span>
          <Truck className="w-4 h-4 text-[#287A56]" />
        </div>
        <p className="text-2xl font-bold text-[#287A56] font-data">{toDispatchCount}</p>
        <span className="text-[11px] text-[#716A70]">Pagos aprobados listos</span>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#E9DEE3] space-y-1">
        <div className="flex items-center justify-between text-xs text-[#716A70]">
          <span>Ventas gestionadas</span>
          <DollarSign className="w-4 h-4 text-[#7A3F65]" />
        </div>
        <p className="text-2xl font-bold text-[#272329] font-data">{formatCurrency(managedSales)}</p>
        <span className="text-[11px] text-[#716A70]">Total pedidos aprobados</span>
      </div>
    </div>
  );
};
