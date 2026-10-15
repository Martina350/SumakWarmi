import React from 'react';
import { Button } from '../../../shared/ui/Button.tsx';
import { HeartHandshake, ArrowRight, Sparkles } from 'lucide-react';

interface BrandStorySectionProps {
  onLearnMore: () => void;
}

export const BrandStorySection: React.FC<BrandStorySectionProps> = ({ onLearnMore }) => {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-[#FFFDFB] rounded-3xl border border-[#E9DEE3] p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="max-w-2xl text-left space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A3F65] uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Nuestra razón de ser</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif-display font-bold text-[#272329] leading-snug">
            Cuidado digno, información transparente y confianza en cada etapa
          </h2>

          <p className="text-sm sm:text-base text-[#716A70] leading-relaxed">
            Impulsada en Ecuador por <strong>Mercedes Cañizares</strong>, Romina Sumak Warmi nació de la necesidad de acercar alternativas menstruales y corporales que se elijan con certeza, derribando tabúes mediante el diálogo sincero y el acompañamiento postventa.
          </p>

          <p className="text-xs sm:text-sm text-[#716A70] leading-relaxed">
            Creemos que la higiene y el bienestar íntimo no deben vivirse desde la incomodidad ni la desinformación. Seleccionamos materiales seguros, enseñamos su uso paso a paso y te acompañamos para que tu compra sea tranquila y respaldada.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={onLearnMore}
            >
              Conoce nuestra historia y propósito
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
