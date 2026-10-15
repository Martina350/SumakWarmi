import React, { useState } from 'react';
import { useSessionStore } from '../../../entities/session/index.ts';
import { useOrderStore } from '../../../entities/order/index.ts';
import { OrderDetailModal } from './OrderDetailModal.tsx';
import { Order } from '../../../shared/types/index.ts';
import { formatCurrency, formatShortDate } from '../../../shared/lib/formatters.ts';
import { getPublicOrderStatus } from '../../../shared/lib/statusLabels.ts';
import { Badge } from '../../../shared/ui/Badge.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { Package, User, MapPin, ArrowRight } from 'lucide-react';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { currentUser } = useSessionStore();
  const { orders, payments } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <User className="w-12 h-12 text-[#E9DEE3] mx-auto" />
        <h2 className="text-xl font-bold font-serif-display text-[#272329]">Inicia sesión para ver tu cuenta</h2>
        <Button variant="primary" size="md" onClick={() => onNavigate('/iniciar-sesion')}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.customerId === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9DEE3]">
        <div>
          <span className="text-xs font-semibold text-[#7A3F65] uppercase tracking-wider">Mi cuenta</span>
          <h1 className="text-3xl font-serif-display font-bold text-[#272329] mt-0.5">{currentUser.name}</h1>
          <p className="text-xs text-[#716A70]">{currentUser.email} · {currentUser.phone}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onNavigate('/tienda')}>
          Explorar catálogo
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#272329] font-serif-display flex items-center gap-2">
            <Package className="w-5 h-5 text-[#7A3F65]" />
            <span>Mis pedidos ({myOrders.length})</span>
          </h2>
        </div>

        {myOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E9DEE3] space-y-3">
            <Package className="w-10 h-10 text-[#E9DEE3] mx-auto" />
            <p className="text-sm font-semibold text-[#272329]">Aún no has realizado pedidos</p>
            <Button variant="primary" size="sm" onClick={() => onNavigate('/tienda')}>
              Ver catálogo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myOrders.map((ord) => {
              const status = getPublicOrderStatus(ord.status, ord.paymentStatus, ord.shipmentStatus);
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className="bg-white rounded-2xl border border-[#E9DEE3] p-5 hover:border-[#7A3F65]/50 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-data font-bold text-sm text-[#272329] group-hover:text-[#7A3F65] transition-colors">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-[#716A70] block font-data">
                        {formatShortDate(ord.createdAt)}
                      </span>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>

                  <p className="text-xs text-[#716A70] line-clamp-1">
                    {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                  </p>

                  <div className="pt-2 border-t border-[#E9DEE3]/70 flex justify-between items-center text-xs">
                    <span className="font-bold text-[#7A3F65] font-data text-sm">
                      {formatCurrency(ord.total)}
                    </span>
                    <span className="font-semibold text-[#7A3F65] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Ver detalle y seguimiento <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          payment={payments.find((p) => p.orderId === selectedOrder.id)}
        />
      )}
    </div>
  );
};
