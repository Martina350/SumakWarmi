import React from 'react';
import { Truck, ShieldCheck, HeartHandshake, RefreshCw } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const pillars = [
    {
      icon: <Truck className="w-5 h-5 text-[#D52C69]" />,
      title: 'Envíos a todo el Ecuador',
      description: 'Gestión asistida con guía de seguimiento Servientrega.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#D52C69]" />,
      title: 'Asesoría empática y cercana',
      description: 'Resolvemos dudas sobre tallas, inserción y materiales.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#267A59]" />,
      title: 'Materiales biocompatibles',
      description: 'Silicona médica hipoalergénica y fórmulas con pH equilibrado.',
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-[#D52C69]" />,
      title: 'Hábitos más sostenibles',
      description: 'Alternativas reutilizables que reducen residuos mes a mes.',
    },
  ];

  return (
    <section className="border-b border-[#E9DFE4] bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => (
            <div key={idx} className="flex items-start gap-3.5 text-left">
              <div className="p-2.5 rounded-xl bg-[#FFF7F9] border border-[#E9DFE4] shrink-0">
                {p.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#241B24] uppercase tracking-wide">
                  {p.title}
                </h4>
                <p className="text-xs text-[#665D65] mt-1 leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
