import React from 'react';
import { Button } from '../../../shared/ui/Button.tsx';
import { Sparkles, MessageSquareHeart, ArrowRight, ShieldCheck } from 'lucide-react';
import heroImage from '../../../assets/copas-menstruales-ec.jpg';

interface HeroSectionProps {
  onExplore: () => void;
  onOpenAdvice: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onOpenAdvice }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF7F9] via-white/60 to-[#FFF7F9] py-14 sm:py-20 border-b border-[#E9DFE4]">
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
            <div className="relative rounded-[28px] overflow-hidden border border-[#E9DFE4] shadow-md group aspect-4/3 sm:aspect-square lg:aspect-4/3 bg-[#FFF7F9]">
              <img
                src={heroImage}
                alt="Copas menstruales y cuidado íntimo Sumak Warmi"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-md flex items-center justify-between gap-3 transition-transform group-hover:-translate-y-0.5 duration-300">
                <div className="text-left">
                  <h3 className="font-heading font-bold text-sm text-[#241B24]">
                    SUMAKWARMI
                  </h3>
                  <p className="text-[11px] text-[#665D65] line-clamp-1">
                    Cuidado íntimo, compresas térmicas y fórmulas respetuosas
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#FBE7ED] text-[#A91E50] rounded-full text-[11px] font-semibold shrink-0">
                  Hecho en Ecuador
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
