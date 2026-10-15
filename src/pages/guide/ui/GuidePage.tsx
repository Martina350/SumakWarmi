import React from 'react';
import { Sparkles, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.tsx';

interface GuidePageProps {
  onNavigate: (path: string) => void;
  onOpenAdvice: () => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ onNavigate, onOpenAdvice }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left space-y-10">
      <div>
        <span className="text-xs font-semibold text-[#7A3F65] uppercase tracking-wider">
          Educación & Orientación
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-display font-bold text-[#272329] mt-1">
          Guía de tallas y uso de la copa menstrual
        </h1>
        <p className="text-sm text-[#716A70] mt-2">
          Todo lo que necesitas saber para dar el paso con confianza y tranquilidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-[#E9DEE3] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-lg font-bold text-[#272329]">Talla S</h3>
            <span className="text-xs bg-[#7A3F65]/10 text-[#7A3F65] font-semibold px-2 py-0.5 rounded-full">Flujo regular</span>
          </div>
          <ul className="text-xs text-[#716A70] space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#287A56] shrink-0 mt-0.5" />
              <span>Personas menores de 25 años sin partos vaginales previos.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#287A56] shrink-0 mt-0.5" />
              <span>Flujo ligero a moderado o piso pélvico tonificado (deportistas).</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#E9DEE3] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-lg font-bold text-[#272329]">Talla L</h3>
            <span className="text-xs bg-[#7A3F65]/10 text-[#7A3F65] font-semibold px-2 py-0.5 rounded-full">Flujo abundante</span>
          </div>
          <ul className="text-xs text-[#716A70] space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#287A56] shrink-0 mt-0.5" />
              <span>Personas mayores de 25 años o que han tenido partos vaginales.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#287A56] shrink-0 mt-0.5" />
              <span>Flujo menstrual abundante que requiere mayor capacidad en ml.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E9DEE3] space-y-4">
        <h3 className="font-serif-display text-xl font-bold text-[#272329]">
          Higiene y esterilización en 3 pasos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#716A70]">
          <div className="p-4 bg-[#F9F1F3] rounded-xl space-y-1">
            <span className="font-bold text-[#7A3F65]">01. Inicio de ciclo</span>
            <p>Hierve la copa durante 3 a 5 minutos en agua o utiliza el esterilizador a vapor.</p>
          </div>
          <div className="p-4 bg-[#F9F1F3] rounded-xl space-y-1">
            <span className="font-bold text-[#7A3F65]">02. Durante el ciclo</span>
            <p>Vacía y enjuaga con agua limpia o Cup Mate con pH neutro cada 8 a 12 horas.</p>
          </div>
          <div className="p-4 bg-[#F9F1F3] rounded-xl space-y-1">
            <span className="font-bold text-[#7A3F65]">03. Fin de ciclo</span>
            <p>Vuelve a esterilizar y guarda en su bolsita transpirable o estuche protector.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-[#F9F1F3] rounded-2xl border border-[#E9DEE3]">
        <div className="text-xs">
          <p className="font-bold text-[#272329]">¿Aún tienes dudas sobre qué producto se adapta a tu cuerpo?</p>
          <p className="text-[#716A70]">Nuestra asesoría responde todas tus preguntas de forma confidencial.</p>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenAdvice}>
          Hablar con una asesora
        </Button>
      </div>
    </div>
  );
};
