import React from 'react';
import { useCatalogStore } from '../../../entities/catalog/index.ts';
import { ProductPurchaseModule } from './ProductPurchaseModule.tsx';
import { ProductCard } from '../../../features/catalog/ui/ProductCard.tsx';
import { ArrowLeft, Sparkles, Info } from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onOpenAdvice: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate, onOpenAdvice }) => {
  const { products } = useCatalogStore();
  const product = products.find((p) => p.slug === slug) || products[0];

  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-12">
      <button
        onClick={() => onNavigate('/tienda')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#665D65] hover:text-[#A91E50] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Volver al catálogo completo</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Product Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-4/3 rounded-[24px] bg-gradient-to-br from-[#FFF7F9] via-white to-[#FFF7F9] border border-[#E9DFE4] flex flex-col items-center justify-center p-8 text-center shadow-xs">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-2xs border border-[#E9DFE4] flex items-center justify-center text-[#D52C69] mb-4">
              <Sparkles className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#241B24] max-w-sm">
              {product.name}
            </h2>
            <span className="text-xs text-[#665D65] mt-1 font-medium">Línea oficial SUMAKWARMI</span>
          </div>

          <div className="bg-white rounded-[20px] border border-[#E9DFE4] p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#241B24] uppercase tracking-wide flex items-center gap-2">
              <Info className="w-4 h-4 text-[#D52C69]" />
              <span>Descripción y beneficios</span>
            </h3>
            <p className="text-sm text-[#665D65] leading-relaxed">{product.description}</p>

            {product.materials && (
              <div className="pt-3 border-t border-[#E9DFE4]">
                <h4 className="text-xs font-bold text-[#665D65] uppercase">Materiales y composición</h4>
                <p className="text-xs text-[#241B24] mt-1">{product.materials}</p>
              </div>
            )}

            {product.instructions && (
              <div className="pt-3 border-t border-[#E9DFE4]">
                <h4 className="text-xs font-bold text-[#665D65] uppercase">Instrucciones y cuidados</h4>
                <p className="text-xs text-[#241B24] mt-1 leading-relaxed">{product.instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sticky Purchase Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <ProductPurchaseModule product={product} onOpenAdvice={onOpenAdvice} />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-[#E9DFE4] space-y-6">
          <h3 className="text-xl font-heading font-bold text-[#241B24]">
            Alternativas y complementos sugeridos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetail={(newSlug) => onNavigate(`/producto/${newSlug}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
