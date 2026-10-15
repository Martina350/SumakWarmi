import React from 'react';
import { ShieldCheck, Truck, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#F9F1F3] border-t border-[#E9DEE3] text-[#716A70] text-xs pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E9DEE3]">
          <div className="space-y-3 md:col-span-1">
            <h4 className="font-serif-display text-lg font-bold text-[#272329]">SUMAKWARMI</h4>
            <p className="text-xs leading-relaxed text-[#716A70]">
              Alternativas de bienestar menstrual, autocuidado y salud consciente con acompañamiento cercano en Ecuador.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#7A3F65] font-medium pt-1">
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>Impulsado por Mercedes Cañizares</span>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-[#272329] uppercase tracking-wider text-[11px] mb-3">Catálogo</h5>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('/tienda')} className="hover:text-[#7A3F65]">Cuidado Menstrual</button></li>
              <li><button onClick={() => onNavigate('/tienda')} className="hover:text-[#7A3F65]">Cuidado Corporal & Higiene</button></li>
              <li><button onClick={() => onNavigate('/tienda')} className="hover:text-[#7A3F65]">Alimenticio & Infusiones</button></li>
              <li><button onClick={() => onNavigate('/tienda')} className="hover:text-[#7A3F65]">Ver todo el catálogo</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-[#272329] uppercase tracking-wider text-[11px] mb-3">Información & Guía</h5>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('/nosotras')} className="hover:text-[#7A3F65]">Nosotras & Propósito</button></li>
              <li><button onClick={() => onNavigate('/guia')} className="hover:text-[#7A3F65]">Guía de copas y tallas</button></li>
              <li><button onClick={() => onNavigate('/ayuda')} className="hover:text-[#7A3F65]">Preguntas Frecuentes</button></li>
              <li><button onClick={() => onNavigate('/ayuda')} className="hover:text-[#7A3F65]">Envíos por Servientrega</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-[#272329] uppercase tracking-wider text-[11px] mb-3">Compromiso</h5>
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-[#7A3F65] shrink-0 mt-0.5" />
              <span>Envíos a todo el Ecuador mediante Servientrega con guía registrada.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#287A56] shrink-0 mt-0.5" />
              <span>Materiales biocompatibles, asesoría personalizada y compra transparente.</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#716A70]">
          <p>© 2026 Romina Sumak Warmi · Prototipo funcional interactivo para Google AI Studio.</p>
          <p className="text-[10px]">Quito, Ecuador · Zona horaria America/Guayaquil</p>
        </div>
      </div>
    </footer>
  );
};
