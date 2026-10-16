import React, { useState } from 'react';
import { useSessionStore, sessionActions } from '../../../entities/session/index.ts';
import { operations } from '../../../shared/domain/operations.ts';
import { useOrderStore } from '../../../entities/order/index.ts';
import { OrderDetailModal } from './OrderDetailModal.tsx';
import { Order } from '../../../shared/types/index.ts';
import { formatCurrency, formatShortDate } from '../../../shared/lib/formatters.ts';
import { getPublicOrderStatus } from '../../../shared/lib/statusLabels.ts';
import { Badge } from '../../../shared/ui/Badge.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { Package, User, ArrowRight } from 'lucide-react';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { currentUser } = useSessionStore();
  const { orders, payments, notifications } = useOrderStore();
  const [actionError, setActionError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 bg-white">
        <div className="w-16 h-16 rounded-full bg-[#FFF7F9] border border-[#E9DFE4] flex items-center justify-center text-[#EE839F] mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-heading text-[#241B24]">Inicia sesión para ver tu cuenta</h2>
        <p className="text-xs text-[#665D65]">Accede a tu historial de pedidos, seguimiento y direcciones.</p>
        <Button variant="primary" size="md" onClick={() => onNavigate('/iniciar-sesion')}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.customerId === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9DFE4]">
        <div>
          <span className="text-xs font-semibold text-[#A91E50] uppercase tracking-wider">Mi cuenta</span>
          <h1 className="text-3xl font-heading font-bold text-[#241B24] mt-0.5">{currentUser.name}</h1>
          <p className="text-xs text-[#665D65]">{currentUser.email} · {currentUser.phone}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onNavigate('/tienda')}>
          Explorar catálogo
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Button variant="ghost" size="sm" onClick={() => { try { sessionActions.setCurrentUser(null); onNavigate('/'); } catch (e) { setActionError(String(e)); } }}>Cerrar sesión de cliente</Button>
        {actionError && <p role="alert" className="text-xs text-[#B42336]">{actionError}</p>}
      </div>
      {notifications.some((n) => n.targetUserId === currentUser.id) && <details className="p-4 border border-[#E9DFE4] rounded-xl text-xs space-y-3"><summary className="cursor-pointer font-semibold">Notificaciones internas ({notifications.filter((n) => n.targetUserId === currentUser.id && !n.read).length} nuevas)</summary>{notifications.filter((n) => n.targetUserId === currentUser.id).slice(0, 10).map((n) => <p key={n.id}><strong>{n.title}</strong> · {n.message}</p>)}<button className="underline text-[#A91E50]" onClick={() => { try { operations.readNotifications(); } catch (e) { setActionError(String(e)); } }}>Marcar como leídas</button></details>}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#241B24] font-heading flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D52C69]" />
            <span>Mis pedidos ({myOrders.length})</span>
          </h2>
        </div>

        {myOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[20px] border border-[#E9DFE4] space-y-3">
            <Package className="w-10 h-10 text-[#E9DFE4] mx-auto" />
            <p className="text-sm font-semibold text-[#241B24] font-heading">Aún no has realizado pedidos</p>
            <p className="text-xs text-[#665D65]">Explora nuestros productos y crea tu primera orden.</p>
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
                  className="bg-white rounded-[20px] border border-[#E9DFE4] p-5 hover:border-[#EE839F] hover:shadow-md transition-all duration-200 cursor-pointer space-y-3 group shadow-2xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-data font-bold text-sm text-[#241B24] group-hover:text-[#D52C69] transition-colors">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-[#665D65] block font-data">
                        {formatShortDate(ord.createdAt)}
                      </span>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>

                  <p className="text-xs text-[#665D65] line-clamp-1">
                    {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                  </p>

                  <div className="pt-2 border-t border-[#E9DFE4]/70 flex justify-between items-center text-xs">
                    <span className="font-bold text-[#A91E50] font-data text-sm">
                      {formatCurrency(ord.total)}
                    </span>
                    <span className="font-semibold text-[#A91E50] flex items-center gap-1 group-hover:text-[#D52C69] group-hover:translate-x-1 transition-all">
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
