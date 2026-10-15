import React from 'react';
import { Button } from '../../../shared/ui/Button.tsx';
import { Sparkles, MessageSquareHeart, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

interface HeroSectionProps {
  onExplore: () => void;
  onOpenAdvice: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onOpenAdvice }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#FFF7F9] to-[#FFFFFF] py-14 sm:py-20 border-b border-[#E9DFE4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FBE7ED] text-[#A91E50] text-xs font-semibold border border-[#EE839F]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#D52C69]" />
              <span>Bienestar menstrual & autocuidado consciente</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-[#241B24] tracking-tight leading-[1.15] text-balance">
              Tu bienestar, <span className="text-[#D52C69]">a tu manera</span>
            </h1>

            <p className="text-base sm:text-lg text-[#665D65] leading-relaxed max-w-xl">
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

            <div className="flex items-center gap-6 pt-4 text-xs text-[#665D65]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#267A59]" />
                <span>Silicona médica certificada</span>
              </div>
              <span aria-hidden="true" className="text-[#E9DFE4]">·</span>
              <span>Envíos con Servientrega</span>
              <span aria-hidden="true" className="text-[#E9DFE4]">·</span>
              <span>Atención personalizada</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-[24px] bg-gradient-to-br from-[#FFF7F9] to-white p-8 sm:p-10 border border-[#E9DFE4] shadow-sm flex flex-col items-center justify-center text-center aspect-4/3 group">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-xs border border-[#E9DFE4] flex items-center justify-center text-[#D52C69] mb-4 group-hover:scale-105 transition-transform">
                <Heart className="w-10 h-10 stroke-[1.5] fill-[#FBE7ED]" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-[#241B24]">
                SUMAKWARMI
              </h3>
              <p className="text-xs text-[#665D65] mt-1.5 max-w-xs leading-relaxed">
                Cuidado íntimo, compresas térmicas y fórmulas respetuosas diseñadas para acompañarte en cada etapa.
              </p>
              <div className="mt-5 px-4 py-1.5 bg-white border border-[#E9DFE4] rounded-full text-xs font-semibold text-[#A91E50] shadow-2xs">
                Hecho en Ecuador · Asesoría directa
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
