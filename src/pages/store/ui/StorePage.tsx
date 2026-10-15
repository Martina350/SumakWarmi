import React, { useState, useMemo } from 'react';
import { useCatalogStore } from '../../../entities/catalog/index.ts';
import { ProductCard } from '../../../features/catalog/ui/ProductCard.tsx';
import { ProductFilterBar } from '../../../features/catalog/ui/ProductFilterBar.tsx';
import { PackageOpen } from 'lucide-react';

interface StorePageProps {
  initialCategory?: string;
  onNavigate: (path: string) => void;
}

export const StorePage: React.FC<StorePageProps> = ({ initialCategory = 'all', onNavigate }) => {
  const { products, categories } = useCatalogStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.variants[0]?.price ?? 9999) - (b.variants[0]?.price ?? 9999));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.variants[0]?.price ?? -1) - (a.variants[0]?.price ?? -1));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif-display font-bold text-[#272329]">
          Catálogo de Bienestar & Cuidado
        </h1>
        <p className="text-sm text-[#716A70] mt-1.5 max-w-2xl leading-relaxed">
          Alternativas íntimas reutilizables, compresas y cuidados cotidianos diseñados con respeto por tu cuerpo.
        </p>
      </div>

      <ProductFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCount={filteredProducts.length}
      />

      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E9DEE3] space-y-3">
          <PackageOpen className="w-12 h-12 text-[#E9DEE3] mx-auto" />
          <h3 className="text-base font-bold text-[#272329]">No encontramos productos con ese filtro</h3>
          <p className="text-xs text-[#716A70] max-w-sm mx-auto">
            Prueba buscando con otros términos o seleccionando otra categoría.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs font-semibold text-[#7A3F65] underline cursor-pointer"
          >
            Limpiar filtros de búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onViewDetail={(slug) => onNavigate(`/producto/${slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
