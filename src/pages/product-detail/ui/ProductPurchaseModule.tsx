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
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const setSelectedVariant = (variant: ProductVariant) => setSelectedVariantId(variant.id);
  const [quantity, setQuantity] = useState(1);

  const price = selectedVariant?.price;
  const isAvailable = selectedVariant && selectedVariant.active !== false && (selectedVariant.stockActual - selectedVariant.stockReservado) >= quantity && price !== null;

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
    <div className="bg-white rounded-[20px] border border-[#E9DFE4] p-6 lg:p-8 space-y-6 text-left shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#665D65] mb-1.5 font-medium">
          <span>{product.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span>SKU: {selectedVariant.sku}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#241B24] leading-tight">
          {product.name}
        </h1>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-[#A91E50] font-data">
            {formatCurrency(price)}
          </span>
          {price === null && (
            <span className="text-xs text-[#9A6200] font-medium">
              Precio sujeto a confirmación
            </span>
          )}
        </div>
      </div>

      {product.variants.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#665D65] uppercase">Selecciona tu variante o talla</label>
          <div className="space-y-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium flex justify-between items-center transition-all cursor-pointer ${
                  selectedVariant.id === v.id
                    ? 'border-[#D52C69] bg-[#FBE7ED] text-[#A91E50] font-semibold ring-1 ring-[#D52C69]'
                    : 'border-[#E9DFE4] text-[#241B24] hover:bg-[#FFF7F9]'
                }`}
              >
                <span>{v.name}</span>
                <span className="font-data">{formatCurrency(v.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2 border-t border-[#E9DFE4]">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-[#E9DFE4] rounded-xl bg-white overflow-hidden h-11">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-full flex items-center justify-center text-[#665D65] hover:bg-[#FFF7F9] cursor-pointer"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm font-data text-[#241B24]">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-full flex items-center justify-center text-[#665D65] hover:bg-[#FFF7F9] cursor-pointer"
              aria-label="Aumentar cantidad"
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
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#A91E50] hover:text-[#D52C69] hover:underline cursor-pointer"
        >
          <MessageSquareHeart className="w-4 h-4 text-[#D52C69]" />
          <span>¿Tienes dudas con este producto? Solicita asesoría personalizada</span>
        </button>
      </div>

      <div className="pt-4 border-t border-[#E9DFE4] space-y-2 text-xs text-[#665D65]">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#A91E50] shrink-0" />
          <span>Entrega por Servientrega en 24 a 72h laborables en Ecuador.</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#267A59] shrink-0" />
          <span>Garantía de originalidad y embalaje discreto de protección.</span>
        </div>
      </div>
    </div>
  );
};
