import React from 'react';
import { Button } from '../../../shared/ui/Button.tsx';
import { Sparkles, MessageSquareHeart, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onExplore: () => void;
  onOpenAdvice: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onOpenAdvice }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDFB] via-[#F9F1F3]/40 to-[#FFFDFB] py-14 sm:py-20 border-b border-[#E9DEE3]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A3F65]/10 text-[#7A3F65] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bienestar menstrual & autocuidado consciente</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-display font-bold text-[#272329] tracking-tight leading-[1.15] text-balance">
              Tu bienestar, a tu manera
            </h1>

            <p className="text-base sm:text-lg text-[#716A70] leading-relaxed max-w-xl">
              Explora alternativas seguras y reutilizables para tu ciclo y tu descanso corporal, con orientación cercana y entregas en todo el Ecuador.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={onExplore}
              >
                Explorar productos
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<MessageSquareHeart className="w-4 h-4" />}
                onClick={onOpenAdvice}
              >
                Necesito asesoría
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-[#716A70]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#287A56]" />
                <span>Silicona médica certificada</span>
              </div>
              <span aria-hidden="true" className="text-[#E9DEE3]">·</span>
              <span>Envíos con Servientrega</span>
              <span aria-hidden="true" className="text-[#E9DEE3]">·</span>
              <span>Atención personalizada</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#F9F1F3] to-[#E9DEE3]/40 p-8 border border-[#E9DEE3] shadow-sm flex flex-col items-center justify-center text-center aspect-4/3">
              <div className="w-20 h-20 rounded-full bg-white shadow-xs border border-[#E9DEE3] flex items-center justify-center text-[#7A3F65] mb-4">
                <Sparkles className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h3 className="font-serif-display text-2xl font-bold text-[#272329]">
                SUMAKWARMI
              </h3>
              <p className="text-xs text-[#716A70] mt-1 max-w-xs">
                Cuidado íntimo, compresas térmicas y fórmulas respetuosas pensadas para acompañarte.
              </p>
              <div className="mt-5 px-3.5 py-1.5 bg-white/90 border border-[#E9DEE3] rounded-full text-xs font-semibold text-[#7A3F65]">
                Hecho en Ecuador · Asesoría directa
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
