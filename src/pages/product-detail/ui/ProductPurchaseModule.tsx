import React, { useState } from 'react';
import { Product, ProductVariant } from '../../../shared/types/index.ts';
import { cartActions } from '../../../entities/cart/index.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { ShoppingBag, Truck, ShieldCheck, Plus, Minus, MessageSquareHeart } from 'lucide-react';

interface ProductPurchaseModuleProps {
  product: Product;
  onOpenAdvice: () => void;
}

export const ProductPurchaseModule: React.FC<ProductPurchaseModuleProps> = ({ product, onOpenAdvice }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const price = selectedVariant?.price;
  const isAvailable = selectedVariant && selectedVariant.stockActual > 0 && price !== null;

  const handleAddToCart = () => {
    if (!isAvailable || price === null) return;
    cartActions.addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantName: selectedVariant.name,
      sku: selectedVariant.sku,
      price,
      quantity,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E9DEE3] p-6 lg:p-8 space-y-6 text-left shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#716A70] mb-1.5">
          <span>{product.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span>SKU: {selectedVariant.sku}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#272329] leading-tight">
          {product.name}
        </h1>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-[#7A3F65] font-data">
            {formatCurrency(price)}
          </span>
          {price === null && (
            <span className="text-xs text-[#9A6414] font-medium">
              Precio sujeto a confirmación
            </span>
          )}
        </div>
      </div>

      {product.variants.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#716A70] uppercase">Selecciona tu variante o talla</label>
          <div className="space-y-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium flex justify-between items-center transition-all ${
                  selectedVariant.id === v.id
                    ? 'border-[#7A3F65] bg-[#F9F1F3] text-[#7A3F65] font-semibold ring-1 ring-[#7A3F65]'
                    : 'border-[#E9DEE3] text-[#272329] hover:bg-[#FFFDFB]'
                }`}
              >
                <span>{v.name}</span>
                <span className="font-data">{formatCurrency(v.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2 border-t border-[#E9DEE3]">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-[#E9DEE3] rounded-xl bg-white overflow-hidden h-12">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-full flex items-center justify-center text-[#716A70] hover:bg-[#F9F1F3]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm font-data">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-full flex items-center justify-center text-[#716A70] hover:bg-[#F9F1F3]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!isAvailable}
            onClick={handleAddToCart}
            icon={<ShoppingBag className="w-4 h-4" />}
          >
            {price === null ? 'Consultar precio' : isAvailable ? 'Añadir al carrito' : 'Sin disponibilidad'}
          </Button>
        </div>

        <button
          onClick={onOpenAdvice}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#7A3F65] hover:underline"
        >
          <MessageSquareHeart className="w-4 h-4" />
          <span>¿Tienes dudas con este producto? Solicita asesoría personalizada</span>
        </button>
      </div>

      <div className="pt-4 border-t border-[#E9DEE3] space-y-2 text-xs text-[#716A70]">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#7A3F65] shrink-0" />
          <span>Entrega por Servientrega en 24 a 72h laborables en Ecuador.</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#287A56] shrink-0" />
          <span>Garantía de originalidad y embalaje discreto de protección.</span>
        </div>
      </div>
    </div>
  );
};
