import React from 'react';
import { HeartHandshake, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.tsx';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left space-y-12">
      <div className="space-y-4">
        <span className="text-xs font-semibold text-[#7A3F65] uppercase tracking-wider">
          Nosotras & Propósito
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-display font-bold text-[#272329] leading-tight">
          Menstruación digna, autocuidado y salud consciente en Ecuador
        </h1>
        <p className="text-base text-[#716A70] leading-relaxed">
          Romina Sumak Warmi es un proyecto impulsado por <strong>Mercedes Cañizares</strong> que busca transformar la experiencia del ciclo menstrual y el cuidado corporal a través de la educación, la empatía y productos honestos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-[#E9DEE3] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#7A3F65]/10 text-[#7A3F65] flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#272329]">Acompañamiento sin tabúes</h3>
          <p className="text-xs text-[#716A70] leading-relaxed">
            Entendemos que probar una copa o un disco menstrual genera dudas legítimas. Por eso no somos solo una tienda: asesoramos antes de la compra y resolvemos inquietudes postventa con calidez y rigor.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#E9DEE3] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#A7B8A0]/20 text-[#287A56] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#272329]">Materiales seguros y verificados</h3>
          <p className="text-xs text-[#716A70] leading-relaxed">
            Priorizamos silicona médica biocompatible, polímeros libres de BPA y fórmulas respetuosas con la microbiota vulvar, sin promesas milagrosas ni afirmaciones médicas engañosas.
          </p>
        </div>
      </div>

      <div className="p-8 bg-[#F9F1F3] rounded-3xl border border-[#E9DEE3] space-y-4">
        <h3 className="font-serif-display text-2xl font-bold text-[#272329]">Nuestra visión para el país</h3>
        <p className="text-xs sm:text-sm text-[#716A70] leading-relaxed">
          Buscamos que cualquier persona en Ecuador, desde Quito y Guayaquil hasta los rincones más alejados, tenga acceso a productos de calidad con envíos confiables de Servientrega y alternativas que reduzcan toneladas de plástico desechable cada año.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={() => onNavigate('/tienda')}>
            Explorar catálogo completo
          </Button>
        </div>
      </div>
    </div>
  );
};
