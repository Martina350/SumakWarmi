import React from 'react';
import { Order } from '../../../shared/types/index.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { CustomerPaymentTools } from '../../../features/checkout/ui/CustomerPaymentTools.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
export function CheckoutConfirmation({
  order,
  onNavigateOrders,
  onOpenPayPhoneModal,
}: {
  order: Order;
  onNavigateOrders: () => void;
  onOpenPayPhoneModal: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold">
          Tu pedido está registrado
        </h1>
        <p className="text-sm text-[#665D65] mt-2">
          {order.orderNumber} · {formatCurrency(order.total)}
        </p>
      </div>
      <div className="p-6 border border-[#E9DFE4] rounded-[20px]">
        <CustomerPaymentTools
          orderId={order.id}
          onOpenPayphone={onOpenPayPhoneModal}
        />
      </div>
      <Button onClick={onNavigateOrders}>Ver mis pedidos y seguimiento</Button>
    </div>
  );
}
