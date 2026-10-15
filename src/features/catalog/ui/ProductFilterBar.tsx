import React from 'react';
import { Category } from '../../../shared/types/index.ts';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ProductFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalCount: number;
}

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryId,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalCount,
}) => {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#665D65]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, beneficio o categoría..."
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#E9DFE4] rounded-xl text-sm text-[#241B24] placeholder-[#665D65]/50 focus:outline-none focus:ring-2 focus:ring-[#D52C69]/20 focus:border-[#D52C69] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#665D65] hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-11 px-3 bg-white border border-[#E9DFE4] rounded-xl text-xs font-medium text-[#241B24] focus:outline-none focus:ring-2 focus:ring-[#D52C69]/20 focus:border-[#D52C69] cursor-pointer"
          >
            <option value="featured">Destacados</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Alfabético A-Z</option>
          </select>
          <span className="text-xs text-[#665D65] font-data whitespace-nowrap hidden md:inline">
            ({totalCount} productos)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            selectedCategoryId === 'all'
              ? 'bg-[#A91E50] text-white shadow-xs'
              : 'bg-white text-[#665D65] hover:text-[#241B24] border border-[#E9DFE4] hover:border-[#EE839F]'
          }`}
        >
          Todos los productos
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCategory(c.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              selectedCategoryId === c.id
                ? 'bg-[#A91E50] text-white shadow-xs'
                : 'bg-white text-[#665D65] hover:text-[#241B24] border border-[#E9DFE4] hover:border-[#EE839F]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};
