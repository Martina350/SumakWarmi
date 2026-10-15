import React from 'react';
import { Truck, ShieldCheck, HeartHandshake, RefreshCw } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const pillars = [
    {
      icon: <Truck className="w-5 h-5 text-[#7A3F65]" />,
      title: 'Envíos a todo el Ecuador',
      description: 'Gestión asistida con guía de seguimiento Servientrega.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#7A3F65]" />,
      title: 'Asesoría empática y cercana',
      description: 'Resolvemos dudas sobre tallas, inserción y materiales.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#7A3F65]" />,
      title: 'Materiales biocompatibles',
      description: 'Silicona médica hipoalergénica y fórmulas con pH equilibrado.',
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-[#7A3F65]" />,
      title: 'Hábitos más sostenibles',
      description: 'Alternativas reutilizables que reducen residuos mes a mes.',
    },
  ];

  return (
    <section className="border-b border-[#E9DEE3] bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => (
            <div key={idx} className="flex items-start gap-3.5 text-left">
              <div className="p-2.5 rounded-xl bg-[#F9F1F3] border border-[#E9DEE3] shrink-0">
                {p.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#272329] uppercase tracking-wide">
                  {p.title}
                </h4>
                <p className="text-xs text-[#716A70] mt-1 leading-relaxed">
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
