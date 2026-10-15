import React from 'react';
import { CartItem, cartActions } from '../../../entities/cart/index.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  return (
    <div className="flex gap-4 py-4 border-b border-[#E9DFE4]/70 last:border-0 items-start">
      <div className="w-16 h-16 rounded-xl bg-[#FFF7F9] border border-[#E9DFE4] flex items-center justify-center shrink-0 overflow-hidden text-xs text-[#665D65] font-medium text-center p-1">
        {item.productName.slice(0, 10)}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#241B24] truncate font-heading">{item.productName}</h4>
        <p className="text-xs text-[#665D65] mt-0.5 truncate">{item.variantName}</p>
        <p className="text-xs font-semibold text-[#A91E50] mt-1.5 font-data">
          {formatCurrency(item.price)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => cartActions.removeItem(item.variantId)}
          className="text-[#665D65] hover:text-[#B42336] p-1 transition-colors cursor-pointer"
          title="Eliminar producto"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center border border-[#E9DFE4] rounded-lg bg-white overflow-hidden">
          <button
            onClick={() => cartActions.updateQuantity(item.variantId, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center text-[#665D65] hover:bg-[#FFF7F9] cursor-pointer"
            aria-label="Disminuir cantidad"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-7 text-center text-xs font-semibold font-data text-[#241B24]">{item.quantity}</span>
          <button
            onClick={() => cartActions.updateQuantity(item.variantId, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center text-[#665D65] hover:bg-[#FFF7F9] cursor-pointer"
            aria-label="Aumentar cantidad"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
