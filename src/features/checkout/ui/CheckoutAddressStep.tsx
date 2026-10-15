import React, { useState } from 'react';
import { Address } from '../../../shared/types/index.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { MapPin, Plus, Check, ArrowRight } from 'lucide-react';

interface CheckoutAddressStepProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (addr: Address) => void;
  onAddNewAddress: (addr: Omit<Address, 'id'>) => void;
  onContinueToPayment?: () => void;
}

export const CheckoutAddressStep: React.FC<CheckoutAddressStepProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onContinueToPayment,
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
    if (onContinueToPayment) {
      onContinueToPayment();
    }
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
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-[#D52C69] bg-[#FFF7F9] ring-1 ring-[#D52C69]'
                  : 'border-[#E9DFE4] hover:border-[#EE839F] bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-sm text-[#241B24]">
                  <MapPin className="w-4 h-4 text-[#D52C69]" />
                  <span>{addr.recipientName}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#D52C69]" />}
              </div>
              <p className="text-xs text-[#665D65] mt-1.5 leading-relaxed">
                {addr.mainStreet} {addr.reference && `(${addr.reference})`}
              </p>
              <p className="text-xs text-[#665D65] mt-1">
                {addr.city}, {addr.province} · {addr.phone}
              </p>
            </div>
          );
        })}
      </div>

      {!showNewForm && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowNewForm(true)}
          >
            Agregar otra dirección en Ecuador
          </Button>

          {selectedAddressId && onContinueToPayment && (
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={onContinueToPayment}
              className="font-semibold"
            >
              Continuar a Método de Pago
            </Button>
          )}
        </div>
      )}

      {showNewForm && (
        <form onSubmit={handleCreate} className="p-4 bg-white rounded-xl border border-[#E9DFE4] space-y-3">
          <h4 className="text-xs font-bold text-[#665D65] uppercase">Nueva dirección de entrega</h4>
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
