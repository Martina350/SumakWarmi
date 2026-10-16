import React, { useState } from 'react';
import { Product, ProductVariant } from '../../../shared/types/index.ts';
import { cartActions } from '../../../entities/cart/index.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { Sparkles, ShoppingBag, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetail: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetail,
}) => {
  const [selectedVariantId] = useState(product.variants[0]?.id);
  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];
  const [error, setError] = useState('');
  const [failedImage, setFailedImage] = useState('');
  const availableUnits = Math.max(
    0,
    (selectedVariant?.stockActual || 0) -
      (selectedVariant?.stockReservado || 0),
  );

  const price = selectedVariant?.price;
  const isAvailable =
    selectedVariant &&
    selectedVariant.active !== false &&
    selectedVariant.stockActual - selectedVariant.stockReservado > 0 &&
    price !== null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable || price === null) return;
    try {
      cartActions.addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        variantName: selectedVariant.name,
        sku: selectedVariant.sku,
        price,
        quantity: 1,
        imageUrl: product.featuredImage,
      });
      setError('');
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div
      onClick={() => onViewDetail(product.slug)}
      className="group flex flex-col bg-white rounded-[20px] border border-[#E9DFE4] hover:border-[#EE839F] hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-4/3 bg-gradient-to-br from-[#FFF7F9] to-white flex flex-col items-center justify-center p-6 text-center border-b border-[#E9DFE4]/70 group-hover:scale-[1.01] transition-transform">
        {product.featuredImage && failedImage !== product.featuredImage ? (
          <img
            src={product.featuredImage}
            onError={() => setFailedImage(product.featuredImage!)}
            alt={product.imageAlt || product.name}
            className="absolute inset-0 w-full h-full object-contain bg-white p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-white shadow-2xs border border-[#E9DFE4] flex items-center justify-center text-[#D52C69] mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="text-xs font-heading font-medium text-[#241B24] max-w-[160px] line-clamp-1">
              {product.name}
            </span>
            <span className="text-[11px] text-[#665D65] mt-0.5">
              Sin imagen · SUMAKWARMI
            </span>
          </>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        {error && (
          <p role="alert" className="text-xs text-[#B42336]">
            {error}
          </p>
        )}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#665D65] mb-1">
            <span>{product.categoryName}</span>
          </div>
          <h3 className="font-semibold text-base text-[#241B24] group-hover:text-[#D52C69] transition-colors line-clamp-1 font-heading">
            {product.name}
          </h3>
          <p className="text-xs text-[#665D65] mt-1.5 line-clamp-2 leading-relaxed">
            {product.summary}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-[#E9DFE4]/70">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-[#A91E50] font-data">
              {formatCurrency(price)}
            </span>
            {price === null ? (
              <span className="text-[11px] text-[#9A6200] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Precio por confirmar
              </span>
            ) : availableUnits === 0 ? (
              <span className="text-[11px] text-[#665D65]">Agotado</span>
            ) : availableUnits <= 3 ? (
              <span className="text-[11px] text-[#9A6200] font-medium">
                ¡Últimas {availableUnits} unid.!
              </span>
            ) : (
              <span className="text-[11px] text-[#267A59] font-medium">
                Disponible
              </span>
            )}
          </div>

          <Button
            variant={isAvailable ? 'primary' : 'outline'}
            size="sm"
            className="w-full"
            disabled={!isAvailable}
            onClick={handleAddToCart}
            icon={<ShoppingBag className="w-3.5 h-3.5" />}
          >
            {price === null
              ? 'Consultar precio'
              : isAvailable
                ? 'Añadir al carrito'
                : 'Sin stock'}
          </Button>
        </div>
      </div>
    </div>
  );
};
