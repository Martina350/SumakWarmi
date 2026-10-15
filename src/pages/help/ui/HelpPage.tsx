import React from 'react';
import { Truck, Building2, HelpCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.tsx';

interface HelpPageProps {
  onNavigate: (path: string) => void;
  onOpenAdvice: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onNavigate, onOpenAdvice }) => {
  const faqs = [
    {
      q: '¿Cómo funcionan los envíos por Servientrega?',
      a: 'Despachamos tu pedido desde nuestro centro en Quito. Registramos tu número de guía oficial para que puedas consultar el estado en la web de Servientrega. El plazo estimado es de 24 a 48 horas en ciudades principales y hasta 72 horas en cantones secundarios.',
    },
    {
      q: '¿Cuáles son los costos de envío?',
      a: 'La tarifa estimada es de $3.50 dentro de la provincia de Pichincha y $4.50 para el resto de provincias del Ecuador.',
    },
    {
      q: '¿Cómo valido mi pago por transferencia bancaria?',
      a: 'Al completar el pedido en la tienda, recibirás el identificador único y los datos de nuestra cuenta en Banco Pichincha. Puedes cargar la foto de tu comprobante en la pantalla final o desde tu panel "Mi Cuenta". Nuestro equipo lo verifica manualmente para confirmar la orden.',
    },
    {
      q: '¿Qué garantía tienen los productos de cuidado íntimo?',
      a: 'Por razones de bioseguridad e higiene, los artículos de uso íntimo desprecintados no admiten cambio o devolución por retracto. Sí garantizamos que todos los productos son nuevos, biocompatibles y libres de defectos de fabricación.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left space-y-10">
      <div>
        <span className="text-xs font-semibold text-[#7A3F65] uppercase tracking-wider">Centro de Ayuda</span>
        <h1 className="text-3xl sm:text-4xl font-serif-display font-bold text-[#272329] mt-1">
          Preguntas Frecuentes & Envíos
        </h1>
        <p className="text-sm text-[#716A70] mt-2">
          Información clara sobre pagos, envíos con Servientrega y condiciones del servicio en Ecuador.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-[#E9DEE3] space-y-2">
            <h3 className="font-bold text-sm text-[#272329] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-[#7A3F65] shrink-0 mt-0.5" />
              <span>{f.q}</span>
            </h3>
            <p className="text-xs text-[#716A70] leading-relaxed pl-6">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-[#F9F1F3] rounded-2xl border border-[#E9DEE3] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[#272329]">¿Tienes una consulta específica sobre tu pedido?</h4>
          <p className="text-xs text-[#716A70]">Escríbenos y te orientaremos en minutos.</p>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenAdvice}>
          Contactar asesoría
        </Button>
      </div>
    </div>
  );
};
