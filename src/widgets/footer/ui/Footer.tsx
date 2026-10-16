import React from 'react';
import { ShieldCheck, Truck, HeartHandshake } from 'lucide-react';
import logoImg from '../../../assets/romina-sumak-warmi-logotipo-2.png';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#EE839F] border-t border-white/20 text-white text-xs pt-14 pb-10 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/20">
          <div className="space-y-3.5 md:col-span-1">
            <button
              onClick={() => onNavigate('/')}
              className="cursor-pointer text-left block"
              aria-label="Ir al inicio"
            >
              <img
                src={logoImg}
                alt="Romina Sumak Warmi"
                className="h-12 w-auto object-contain"
              />
            </button>
            <p className="text-xs leading-relaxed text-white/95 font-normal">
              Alternativas de bienestar menstrual, autocuidado y salud consciente con acompañamiento cercano en Ecuador.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-white font-semibold pt-1">
              <HeartHandshake className="w-4 h-4 shrink-0 text-white" />
              <span>Impulsado por Mercedes Cañizares</span>
            </div>
          </div>

          <div>
            <h5 className="font-heading font-bold text-white uppercase tracking-wider text-[11px] mb-3.5">
              Catálogo
            </h5>
            <ul className="space-y-2.5 text-white/90">
              <li>
                <button onClick={() => onNavigate('/tienda')} className="hover:text-white hover:underline transition-colors cursor-pointer">
                  Cuidado Menstrual
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tienda')} className="hover:text-white hover:underline transition-colors cursor-pointer">
                  Cuidado Corporal & Higiene
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tienda')} className="hover:text-white hover:underline transition-colors cursor-pointer">
                  Alimenticio & Infusiones
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tienda')} className="hover:text-white hover:underline transition-colors cursor-pointer font-semibold underline underline-offset-2">
                  Ver todo el catálogo
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-heading font-bold text-white uppercase tracking-wider text-[11px] mb-3.5">
              Información & Guía
            </h5>
            <ul className="space-y-2.5 text-white/90">
              <li>
                <button onClick={() => onNavigate('/nosotras')} className="hover:text-white hover:underline transition-colors cursor-pointer">
                  Nosotras & Propósito
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/guia')} className="hover:text-white hover:underline transition-colors cursor-pointer">
                  Guía de copas y tallas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/ayuda')} className="hover:text-white hover:underline transition-colors cursor-pointer">
                  Preguntas Frecuentes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/ayuda')} className="hover:text-white hover:underline transition-colors cursor-pointer">
                  Envíos por Servientrega
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-heading font-bold text-white uppercase tracking-wider text-[11px] mb-3.5">
              Compromiso
            </h5>
            <div className="flex items-start gap-2.5 text-white/95 leading-relaxed">
              <div className="p-1.5 rounded-lg bg-white/20 shrink-0 mt-0.5">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span>Envíos a todo el Ecuador mediante Servientrega con guía registrada.</span>
            </div>
            <div className="flex items-start gap-2.5 text-white/95 leading-relaxed">
              <div className="p-1.5 rounded-lg bg-white/20 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span>Materiales biocompatibles, asesoría personalizada y compra transparente.</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/85">
          <p>© 2026 Romina Sumak Warmi · Todos los derechos reservados.</p>
          <p className="text-[10px]">Quito, Ecuador </p>
        </div>
      </div>
    </footer>
  );
};
