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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716A70]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, beneficio o categoría..."
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#E9DEE3] rounded-xl text-sm placeholder-[#716A70]/60 focus:outline-none focus:ring-2 focus:ring-[#7A3F65]/20 focus:border-[#7A3F65]"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#716A70] hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-11 px-3 bg-white border border-[#E9DEE3] rounded-xl text-xs font-medium text-[#272329] focus:outline-none focus:ring-2 focus:ring-[#7A3F65]/20 cursor-pointer"
          >
            <option value="featured">Destacados</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Alfabético A-Z</option>
          </select>
          <span className="text-xs text-[#716A70] font-data whitespace-nowrap hidden md:inline">
            ({totalCount} productos)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            selectedCategoryId === 'all'
              ? 'bg-[#7A3F65] text-white shadow-xs'
              : 'bg-white text-[#716A70] hover:text-[#272329] border border-[#E9DEE3]'
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
                ? 'bg-[#7A3F65] text-white shadow-xs'
                : 'bg-white text-[#716A70] hover:text-[#272329] border border-[#E9DEE3]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};
