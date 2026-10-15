import React from 'react';
import { HelpCircle, Sparkles, Scale, MessageCircle, ArrowRight } from 'lucide-react';

interface NeedSelectorProps {
  onGoToGuide: () => void;
  onGoToStore: () => void;
  onOpenAdvice: () => void;
}

export const NeedSelector: React.FC<NeedSelectorProps> = ({
  onGoToGuide,
  onGoToStore,
  onOpenAdvice,
}) => {
  return (
    <section className="py-14 bg-[#F9F1F3]/60 border-y border-[#E9DEE3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A3F65] uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guía de inicio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#272329]">
            ¿No sabes por dónde empezar?
          </h2>
          <p className="text-xs text-[#716A70] mt-2">
            Elige la ruta que mejor responda a tu momento actual y conoce la alternativa adecuada para tu cuerpo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={onGoToGuide}
            className="p-6 bg-white rounded-2xl border border-[#E9DEE3] hover:border-[#7A3F65]/50 transition-all cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7A3F65]/10 text-[#7A3F65] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#272329] group-hover:text-[#7A3F65] transition-colors">
              Mi primera copa menstrual
            </h3>
            <p className="text-xs text-[#716A70] mt-1.5 leading-relaxed">
              Conoce cómo elegir tu talla según edad y flujo, técnicas sencillas de inserción y consejos de esterilización.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A3F65] mt-4">
              <span>Leer guía de tallas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onGoToStore}
            className="p-6 bg-white rounded-2xl border border-[#E9DEE3] hover:border-[#7A3F65]/50 transition-all cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#A7B8A0]/20 text-[#287A56] flex items-center justify-center mb-4">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#272329] group-hover:text-[#7A3F65] transition-colors">
              Comparar copa vs disco vs toalla
            </h3>
            <p className="text-xs text-[#716A70] mt-1.5 leading-relaxed">
              Descubre las diferencias entre métodos reutilizables según tu estilo de vida, deporte o horas fuera de casa.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#287A56] mt-4">
              <span>Ver catálogo comparativo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onOpenAdvice}
            className="p-6 bg-white rounded-2xl border border-[#E9DEE3] hover:border-[#7A3F65]/50 transition-all cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#DDAAB9]/30 text-[#7A3F65] flex items-center justify-center mb-4">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#272329] group-hover:text-[#7A3F65] transition-colors">
              Hablar con una asesora
            </h3>
            <p className="text-xs text-[#716A70] mt-1.5 leading-relaxed">
              Envíanos tus preguntas íntimas o técnicas y recibe orientación empática y confidencial antes de comprar.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A3F65] mt-4">
              <span>Contactar asesoría</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
