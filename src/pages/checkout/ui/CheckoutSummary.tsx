import React from 'react';
import { CartItem } from '../../../entities/cart/index.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { ShieldCheck, Truck } from 'lucide-react';

interface CheckoutSummaryProps {
  items: CartItem[];
  shippingCost: number;
  deliveryCity?: string;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  items,
  shippingCost,
  deliveryCity,
}) => {
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const total = subtotal + shippingCost;

  return (
    <div className="bg-white rounded-2xl border border-[#E9DEE3] p-6 text-left space-y-5 sticky top-28 shadow-xs">
      <h3 className="text-base font-bold text-[#272329] font-serif-display pb-3 border-b border-[#E9DEE3]">
        Resumen de tu pedido
      </h3>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {items.map((it) => (
          <div key={it.variantId} className="flex justify-between items-start text-xs gap-3">
            <div className="min-w-0">
              <span className="font-semibold text-[#272329] line-clamp-1">{it.productName}</span>
              <span className="text-[#716A70] block">{it.variantName} × {it.quantity}</span>
            </div>
            <span className="font-data font-semibold text-[#272329] shrink-0">
              {formatCurrency(it.price * it.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-[#E9DEE3] space-y-2 text-xs">
        <div className="flex justify-between text-[#716A70]">
          <span>Subtotal</span>
          <span className="font-data font-medium text-[#272329]">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[#716A70]">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[#7A3F65]" />
            Envío Servientrega {deliveryCity ? `(${deliveryCity})` : ''}
          </span>
          <span className="font-data font-medium text-[#272329]">{formatCurrency(shippingCost)}</span>
        </div>
        <div className="pt-2 border-t border-[#E9DEE3] flex justify-between items-baseline text-sm font-bold text-[#272329]">
          <span>Total final</span>
          <span className="text-lg text-[#7A3F65] font-data">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="p-3 bg-[#F9F1F3] rounded-xl text-[11px] text-[#716A70] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#287A56] shrink-0" />
        <span>Garantía de compra protegida · Precios en dólares (USD).</span>
      </div>
    </div>
  );
};
