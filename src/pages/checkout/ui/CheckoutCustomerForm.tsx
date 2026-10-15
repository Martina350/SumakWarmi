import React, { useState } from 'react';
import { sessionActions } from '../../../entities/session/index.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { UserCheck, Shield } from 'lucide-react';

interface CheckoutCustomerFormProps {
  onIdentified: () => void;
}

export const CheckoutCustomerForm: React.FC<CheckoutCustomerFormProps> = ({ onIdentified }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    sessionActions.registerCustomer(name, email, phone);
    onIdentified();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E9DEE3] p-6 text-left space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-[#7A3F65]">
        <UserCheck className="w-4 h-4" />
        <span>Identificación para tu pedido</span>
      </div>
      <p className="text-xs text-[#716A70]">
        Ingresa tus datos de contacto para asociar tu pedido y recibir las notificaciones de Servientrega en Ecuador.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Nombre y Apellido"
          required
          placeholder="Ej: Martina León"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Correo electrónico"
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Teléfono celular (WhatsApp)"
            required
            placeholder="0998877665"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#716A70]">
            <Shield className="w-3.5 h-3.5 text-[#287A56]" />
            <span>Tus datos están protegidos</span>
          </div>
          <Button type="submit" variant="primary" size="md">
            Continuar con la entrega
          </Button>
        </div>
      </form>
    </div>
  );
};
