import React from 'react';
import { Order } from '../../../shared/types/index.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { getPaymentStatusLabel, getShipmentStatusLabel } from '../../../shared/lib/statusLabels.ts';
import { Badge } from '../../../shared/ui/Badge.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../../shared/ui/Table.tsx';
import { CheckSquare, Truck, Eye, CheckCircle2 } from 'lucide-react';

interface SellerOrdersTableProps {
  orders: Order[];
  currentUserId: string;
  onTakeOrder: (orderId: string) => void;
  onOpenVerifyModal: (order: Order) => void;
  onOpenDispatchModal: (order: Order) => void;
  onMarkDelivered: (orderId: string) => void;
}

export const SellerOrdersTable: React.FC<SellerOrdersTableProps> = ({
  orders,
  currentUserId,
  onTakeOrder,
  onOpenVerifyModal,
  onOpenDispatchModal,
  onMarkDelivered,
}) => {
  if (orders.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#E9DFE4] text-xs text-[#665D65]">
        No hay pedidos en esta bandeja en este momento.
      </div>
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Pedido</Th>
          <Th>Cliente</Th>
          <Th>Total</Th>
          <Th>Pago</Th>
          <Th>Envío</Th>
          <Th>Responsable</Th>
          <Th className="text-right">Acciones operativas</Th>
        </Tr>
      </Thead>
      <Tbody>
        {orders.map((ord) => {
          const payLabel = getPaymentStatusLabel(ord.paymentStatus);
          const shipLabel = getShipmentStatusLabel(ord.shipmentStatus);
          const isMine = ord.assignedSellerId === currentUserId;

          return (
            <Tr key={ord.id}>
              <Td className="font-data font-bold text-[#241B24]">{ord.orderNumber}</Td>
              <Td>
                <div className="font-semibold text-xs text-[#241B24]">{ord.customerName}</div>
                <div className="text-[11px] text-[#665D65]">{ord.shippingAddressSnapshot.city}</div>
              </Td>
              <Td className="font-data font-bold text-[#A91E50]">{formatCurrency(ord.total)}</Td>
              <Td>
                <Badge tone={payLabel.tone}>{payLabel.label}</Badge>
              </Td>
              <Td>
                <Badge tone={shipLabel.tone}>{shipLabel.label}</Badge>
              </Td>
              <Td className="text-xs">
                {ord.assignedSellerName ? (
                  <span className={isMine ? 'font-bold text-[#A91E50]' : 'text-[#665D65]'}>
                    {ord.assignedSellerName}
                  </span>
                ) : (
                  <span className="text-[#9A6200] font-medium">Sin asignar</span>
                )}
              </Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                  {!ord.assignedSellerId && (
                    <Button variant="outline" size="sm" onClick={() => onTakeOrder(ord.id)} icon={<CheckSquare className="w-3.5 h-3.5" />}>
                      Tomar
                    </Button>
                  )}
                  {ord.paymentStatus === 'PENDING_VERIFICATION' && (
                    <Button variant="primary" size="sm" onClick={() => onOpenVerifyModal(ord)} icon={<Eye className="w-3.5 h-3.5" />}>
                      Revisar pago
                    </Button>
                  )}
                  {ord.paymentStatus === 'APPROVED' && ord.shipmentStatus !== 'DISPATCHED' && ord.shipmentStatus !== 'DELIVERED' && (
                    <Button variant="secondary" size="sm" onClick={() => onOpenDispatchModal(ord)} icon={<Truck className="w-3.5 h-3.5" />}>
                      Despachar
                    </Button>
                  )}
                  {ord.shipmentStatus === 'DISPATCHED' && (
                    <Button variant="outline" size="sm" onClick={() => onMarkDelivered(ord.id)} icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                      Entregado
                    </Button>
                  )}
                </div>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
