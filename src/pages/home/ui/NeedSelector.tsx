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
    <section className="py-14 bg-[#FFF7F9] border-y border-[#E9DFE4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A91E50] uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#D52C69]" />
            <span>Guía de inicio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#241B24]">
            ¿No sabes por dónde empezar?
          </h2>
          <p className="text-xs text-[#665D65] mt-2">
            Elige la ruta que mejor responda a tu momento actual y conoce la alternativa adecuada para tu cuerpo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={onGoToGuide}
            className="p-6 bg-white rounded-[20px] border border-[#E9DFE4] hover:border-[#EE839F] hover:shadow-md transition-all duration-200 cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FBE7ED] text-[#D52C69] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#241B24] group-hover:text-[#D52C69] transition-colors">
              Mi primera copa menstrual
            </h3>
            <p className="text-xs text-[#665D65] mt-1.5 leading-relaxed">
              Conoce cómo elegir tu talla según edad y flujo, técnicas sencillas de inserción y consejos de esterilización.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A91E50] mt-4 group-hover:text-[#D52C69]">
              <span>Leer guía de tallas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onGoToStore}
            className="p-6 bg-white rounded-[20px] border border-[#E9DFE4] hover:border-[#EE839F] hover:shadow-md transition-all duration-200 cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] text-[#267A59] flex items-center justify-center mb-4">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#241B24] group-hover:text-[#267A59] transition-colors">
              Comparar copa vs disco vs toalla
            </h3>
            <p className="text-xs text-[#665D65] mt-1.5 leading-relaxed">
              Descubre las diferencias entre métodos reutilizables según tu estilo de vida, deporte o horas fuera de casa.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#267A59] mt-4">
              <span>Ver catálogo comparativo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onOpenAdvice}
            className="p-6 bg-white rounded-[20px] border border-[#E9DFE4] hover:border-[#EE839F] hover:shadow-md transition-all duration-200 cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FBE7ED] text-[#D52C69] flex items-center justify-center mb-4">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#241B24] group-hover:text-[#D52C69] transition-colors">
              Hablar con una asesora
            </h3>
            <p className="text-xs text-[#665D65] mt-1.5 leading-relaxed">
              Envíanos tus preguntas íntimas o técnicas y recibe orientación empática y confidencial antes de comprar.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A91E50] mt-4 group-hover:text-[#D52C69]">
              <span>Contactar asesoría</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
