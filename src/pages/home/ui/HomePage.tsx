import React from 'react';
import { HeroSection } from './HeroSection.tsx';
import { TrustStrip } from './TrustStrip.tsx';
import { CategoryTiles } from './CategoryTiles.tsx';
import { NeedSelector } from './NeedSelector.tsx';
import { BrandStorySection } from './BrandStorySection.tsx';
import { ProductCard } from '../../../features/catalog/ui/ProductCard.tsx';
import { useCatalogStore } from '../../../entities/catalog/index.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenAdvice: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAdvice }) => {
  const { products } = useCatalogStore();
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);

  return (
    <div className="space-y-0 text-left">
      <HeroSection
        onExplore={() => onNavigate('/tienda')}
        onOpenAdvice={onOpenAdvice}
      />

      <TrustStrip />

      <CategoryTiles
        onSelectCategory={(catId) => onNavigate(`/tienda?categoria=${catId}`)}
      />

      {/* Featured Products */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A3F65] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Selección destacada</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#272329]">
              Los favoritos de nuestra comunidad
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => onNavigate('/tienda')}
          >
            Ver todos los productos ({products.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onViewDetail={(slug) => onNavigate(`/producto/${slug}`)}
            />
          ))}
        </div>
      </section>

      <NeedSelector
        onGoToGuide={() => onNavigate('/guia')}
        onGoToStore={() => onNavigate('/tienda')}
        onOpenAdvice={onOpenAdvice}
      />

      <BrandStorySection
        onLearnMore={() => onNavigate('/nosotras')}
      />
    </div>
  );
};
