import React, { useState } from 'react';
import { Address } from '../../../shared/types/index.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { MapPin, Plus, Check } from 'lucide-react';

interface CheckoutAddressStepProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (addr: Address) => void;
  onAddNewAddress: (addr: Omit<Address, 'id'>) => void;
}

export const CheckoutAddressStep: React.FC<CheckoutAddressStepProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}) => {
  const [showNewForm, setShowNewForm] = useState(addresses.length === 0);
  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    province: 'Pichincha',
    city: 'Quito',
    mainStreet: '',
    reference: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName || !formData.mainStreet) return;
    onAddNewAddress({
      ...formData,
      country: 'Ecuador',
      isDefault: addresses.length === 0,
    });
    setShowNewForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {addresses.map((addr) => {
          const isSelected = addr.id === selectedAddressId;
          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#7A3F65] bg-[#F9F1F3]/40 ring-1 ring-[#7A3F65]'
                  : 'border-[#E9DEE3] hover:border-[#7A3F65]/40 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-sm text-[#272329]">
                  <MapPin className="w-4 h-4 text-[#7A3F65]" />
                  <span>{addr.recipientName}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#7A3F65]" />}
              </div>
              <p className="text-xs text-[#716A70] mt-1.5 leading-relaxed">
                {addr.mainStreet} {addr.reference && `(${addr.reference})`}
              </p>
              <p className="text-xs text-[#716A70] mt-1">
                {addr.city}, {addr.province} · {addr.phone}
              </p>
            </div>
          );
        })}
      </div>

      {!showNewForm && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setShowNewForm(true)}
        >
          Agregar otra dirección en Ecuador
        </Button>
      )}

      {showNewForm && (
        <form onSubmit={handleCreate} className="p-4 bg-white rounded-xl border border-[#E9DEE3] space-y-3">
          <h4 className="text-xs font-bold text-[#716A70] uppercase">Nueva dirección de entrega</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre del destinatario"
              required
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            />
            <Input
              label="Teléfono celular"
              required
              placeholder="0991234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Provincia"
              required
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            />
            <Input
              label="Ciudad / Cantón"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <Input
            label="Calle principal y numeración"
            required
            value={formData.mainStreet}
            onChange={(e) => setFormData({ ...formData, mainStreet: e.target.value })}
          />
          <Input
            label="Referencia de entrega (casa, departamento, conjunto)"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          />
          <div className="flex gap-2 justify-end pt-2">
            {addresses.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="primary" size="sm">
              Guardar y usar dirección
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
