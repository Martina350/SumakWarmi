import React from 'react';
import { useCatalogStore } from '../../../entities/catalog/index.ts';
import { ArrowRight, Moon, Sparkles, Coffee } from 'lucide-react';

interface CategoryTilesProps {
  onSelectCategory: (catId: string) => void;
}

export const CategoryTiles: React.FC<CategoryTilesProps> = ({ onSelectCategory }) => {
  const presets = [
    {
      id: 'cat-menstrual',
      title: 'Cuidado Menstrual',
      description: 'Copas, discos, aplicadores, esterilizadores y pads lavables de larga duración.',
      icon: <Moon className="w-6 h-6 text-[#D52C69]" />,
      bg: 'bg-gradient-to-br from-white to-[#FFF7F9]',
    },
    {
      id: 'cat-corporal',
      title: 'Cuidado Corporal & Higiene',
      description: 'Espuma íntima con caléndula, compresas eléctricas y de gel para descanso pélvico.',
      icon: <Sparkles className="w-6 h-6 text-[#D52C69]" />,
      bg: 'bg-gradient-to-br from-white to-[#FFF7F9]',
    },
    {
      id: 'cat-alimenticio',
      title: 'Alimenticio & Infusiones',
      description: 'Chocolate con cacao fino ecuatoriano e infusiones botánicas para tus momentos de pausa.',
      icon: <Coffee className="w-6 h-6 text-[#D52C69]" />,
      bg: 'bg-gradient-to-br from-white to-[#FFF7F9]',
    },
  ];

  const { categories: storedCategories } = useCatalogStore();
  const categories = storedCategories.map((c) => ({ ...c, title: c.name, icon: presets.find((p) => p.id === c.id)?.icon || <Sparkles className="w-6 h-6 text-[#D52C69]" />, bg: 'bg-white' }));
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
        <div>
          <span className="text-xs font-semibold text-[#A91E50] uppercase tracking-wider">
            Líneas de producto
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#241B24] mt-1">
            Explora por categoría
          </h2>
        </div>
        <p className="text-xs text-[#665D65] max-w-md">
          Presentaciones honestas, información clara de materiales y alternativas para cada preferencia íntima.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectCategory(c.id)}
            className={`p-7 rounded-[20px] border border-[#E9DFE4] ${c.bg} hover:border-[#EE839F] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group`}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E9DFE4] flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 group-hover:border-[#EE839F]/50 transition-all">
                {c.image ? <img src={c.image} alt={c.name} className="w-full h-full rounded-xl object-cover" /> : c.icon}
              </div>
              <h3 className="text-lg font-bold text-[#241B24] group-hover:text-[#D52C69] transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-[#665D65] mt-2 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#A91E50] mt-6 pt-4 border-t border-[#E9DFE4]/70 group-hover:text-[#D52C69]">
              <span>Ver colección</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
