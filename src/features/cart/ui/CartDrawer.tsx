import React from 'react';
import { useCartStore, cartActions } from '../../../entities/cart/index.ts';
import { CartItemRow } from './CartItemRow.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  onNavigateCheckout: () => void;
  onNavigateStore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateCheckout,
  onNavigateStore,
}) => {
  const { items, isDrawerOpen } = useCartStore();

  if (!isDrawerOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-[#241B24]/60 backdrop-blur-xs transition-opacity"
        onClick={cartActions.closeDrawer}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E9DFE4]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D52C69]" />
              <h2 className="text-lg font-bold text-[#241B24] font-heading">Tu Carrito</h2>
              <span className="text-xs bg-[#FBE7ED] text-[#A91E50] px-2.5 py-0.5 rounded-full font-semibold font-data">
                {items.length}
              </span>
            </div>
            <button
              onClick={cartActions.closeDrawer}
              className="p-2 text-[#665D65] hover:text-[#241B24] rounded-lg hover:bg-[#FBE7ED] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 divide-y divide-[#E9DFE4]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#FFF7F9] border border-[#E9DFE4] flex items-center justify-center text-[#EE839F] mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-[#241B24] font-heading">Tu carrito está esperando algo especial</p>
                <p className="text-xs text-[#665D65] mt-1 mb-6 max-w-xs leading-relaxed">
                  Explora nuestras alternativas para tu bienestar menstrual y autocuidado diario.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    cartActions.closeDrawer();
                    onNavigateStore();
                  }}
                >
                  Explorar catálogo
                </Button>
              </div>
            ) : (
              items.map((it) => <CartItemRow key={it.variantId} item={it} />)
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-[#E9DFE4] p-6 bg-[#FFF7F9] space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#665D65] font-medium">Subtotal</span>
                <span className="font-bold text-lg text-[#A91E50] font-data">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-xs text-[#665D65]">El envío se calculará al ingresar tu dirección de entrega en Ecuador.</p>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  cartActions.closeDrawer();
                  onNavigateCheckout();
                }}
              >
                Continuar al pago
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
