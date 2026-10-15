import React from 'react';
import { useCatalogStore } from '../../../entities/catalog/index.ts';
import { ProductPurchaseModule } from './ProductPurchaseModule.tsx';
import { ProductCard } from '../../../features/catalog/ui/ProductCard.tsx';
import { ArrowLeft, Sparkles, Shield, Info } from 'lucide-react';

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
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#716A70] hover:text-[#7A3F65] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Volver al catálogo completo</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Product Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-4/3 rounded-3xl bg-gradient-to-br from-[#F9F1F3] via-white to-[#FFFDFB] border border-[#E9DEE3] flex flex-col items-center justify-center p-8 text-center shadow-xs">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-xs border border-[#E9DEE3] flex items-center justify-center text-[#7A3F65] mb-4">
              <Sparkles className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="font-serif-display text-2xl font-bold text-[#272329] max-w-sm">
              {product.name}
            </h2>
            <span className="text-xs text-[#716A70] mt-1">Línea oficial SUMAKWARMI</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E9DEE3] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#272329] uppercase tracking-wide flex items-center gap-2">
              <Info className="w-4 h-4 text-[#7A3F65]" />
              <span>Descripción y beneficios</span>
            </h3>
            <p className="text-sm text-[#716A70] leading-relaxed">{product.description}</p>

            {product.materials && (
              <div className="pt-3 border-t border-[#E9DEE3]">
                <h4 className="text-xs font-bold text-[#716A70] uppercase">Materiales y composición</h4>
                <p className="text-xs text-[#272329] mt-1">{product.materials}</p>
              </div>
            )}

            {product.instructions && (
              <div className="pt-3 border-t border-[#E9DEE3]">
                <h4 className="text-xs font-bold text-[#716A70] uppercase">Instrucciones y cuidados</h4>
                <p className="text-xs text-[#272329] mt-1 leading-relaxed">{product.instructions}</p>
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
        <div className="pt-10 border-t border-[#E9DEE3] space-y-6">
          <h3 className="text-xl font-serif-display font-bold text-[#272329]">
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
