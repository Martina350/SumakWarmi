import React from 'react';
import { ArrowRight, Moon, Sparkles, Coffee } from 'lucide-react';

interface CategoryTilesProps {
  onSelectCategory: (catId: string) => void;
}

export const CategoryTiles: React.FC<CategoryTilesProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'cat-menstrual',
      title: 'Cuidado Menstrual',
      description: 'Copas, discos, aplicadores, esterilizadores y pads lavables de larga duración.',
      icon: <Moon className="w-6 h-6 text-[#7A3F65]" />,
      bg: 'bg-gradient-to-br from-[#FFFDFB] to-[#F9F1F3]',
    },
    {
      id: 'cat-corporal',
      title: 'Cuidado Corporal & Higiene',
      description: 'Espuma íntima con caléndula, compresas eléctricas y de gel para descanso pélvico.',
      icon: <Sparkles className="w-6 h-6 text-[#7A3F65]" />,
      bg: 'bg-gradient-to-br from-[#FFFDFB] to-[#F9F1F3]',
    },
    {
      id: 'cat-alimenticio',
      title: 'Alimenticio & Infusiones',
      description: 'Chocolate con cacao fino ecuatoriano e infusiones botánicas para tus momentos de pausa.',
      icon: <Coffee className="w-6 h-6 text-[#7A3F65]" />,
      bg: 'bg-gradient-to-br from-[#FFFDFB] to-[#F9F1F3]',
    },
  ];

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
        <div>
          <span className="text-xs font-semibold text-[#7A3F65] uppercase tracking-wider">
            Líneas de producto
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#272329] mt-1">
            Explora por categoría
          </h2>
        </div>
        <p className="text-xs text-[#716A70] max-w-md">
          Presentaciones honestas, información clara de materiales y alternativas para cada preferencia íntima.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectCategory(c.id)}
            className={`p-7 rounded-2xl border border-[#E9DEE3] ${c.bg} hover:border-[#7A3F65]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-left group`}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E9DEE3] flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                {c.icon}
              </div>
              <h3 className="text-lg font-bold text-[#272329] group-hover:text-[#7A3F65] transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-[#716A70] mt-2 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#7A3F65] mt-6 pt-4 border-t border-[#E9DEE3]/70">
              <span>Ver colección</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
