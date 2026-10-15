import React from 'react';
import { ShieldCheck, Truck, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#FFF7F9] border-t border-[#E9DFE4] text-[#665D65] text-xs pt-12 pb-8 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E9DFE4]">
          <div className="space-y-3 md:col-span-1">
            <h4 className="font-heading text-lg font-bold text-[#241B24]">SUMAKWARMI</h4>
            <p className="text-xs leading-relaxed text-[#665D65]">
              Alternativas de bienestar menstrual, autocuidado y salud consciente con acompañamiento cercano en Ecuador.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#A91E50] font-medium pt-1">
              <HeartHandshake className="w-4 h-4 shrink-0 text-[#D52C69]" />
              <span>Impulsado por Mercedes Cañizares</span>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-[#241B24] uppercase tracking-wider text-[11px] mb-3">Catálogo</h5>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('/tienda')} className="hover:text-[#A91E50] transition-colors cursor-pointer">Cuidado Menstrual</button></li>
              <li><button onClick={() => onNavigate('/tienda')} className="hover:text-[#A91E50] transition-colors cursor-pointer">Cuidado Corporal & Higiene</button></li>
              <li><button onClick={() => onNavigate('/tienda')} className="hover:text-[#A91E50] transition-colors cursor-pointer">Alimenticio & Infusiones</button></li>
              <li><button onClick={() => onNavigate('/tienda')} className="hover:text-[#A91E50] transition-colors cursor-pointer">Ver todo el catálogo</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-[#241B24] uppercase tracking-wider text-[11px] mb-3">Información & Guía</h5>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('/nosotras')} className="hover:text-[#A91E50] transition-colors cursor-pointer">Nosotras & Propósito</button></li>
              <li><button onClick={() => onNavigate('/guia')} className="hover:text-[#A91E50] transition-colors cursor-pointer">Guía de copas y tallas</button></li>
              <li><button onClick={() => onNavigate('/ayuda')} className="hover:text-[#A91E50] transition-colors cursor-pointer">Preguntas Frecuentes</button></li>
              <li><button onClick={() => onNavigate('/ayuda')} className="hover:text-[#A91E50] transition-colors cursor-pointer">Envíos por Servientrega</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-[#241B24] uppercase tracking-wider text-[11px] mb-3">Compromiso</h5>
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-[#A91E50] shrink-0 mt-0.5" />
              <span>Envíos a todo el Ecuador mediante Servientrega con guía registrada.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#267A59] shrink-0 mt-0.5" />
              <span>Materiales biocompatibles, asesoría personalizada y compra transparente.</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#665D65]">
          <p>© 2026 Romina Sumak Warmi · Prototipo funcional interactivo para Google AI Studio.</p>
          <p className="text-[10px]">Quito, Ecuador · Zona horaria America/Guayaquil</p>
        </div>
      </div>
    </footer>
  );
};
