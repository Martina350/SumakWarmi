import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { Textarea } from '../../../shared/ui/Textarea.tsx';
import { MessageSquareHeart, CheckCircle2 } from 'lucide-react';

interface AdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdviceModal: React.FC<AdviceModalProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('Primera copa menstrual');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asesoría personalizada y cercana"
      description="Respondemos tus dudas sobre copas, tallas, discos o compresas sin juicio y con empatía."
      maxWidth="md"
    >
      {isSent ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#267A59] mx-auto" />
          <h4 className="text-base font-bold text-[#241B24] font-heading">¡Mensaje recibido!</h4>
          <p className="text-xs text-[#665D65] max-w-sm mx-auto leading-relaxed">
            Una asesora de SUMAKWARMI revisará tu consulta para brindarte una orientación cercana y respetuosa.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#665D65]">
              ¿En qué tema necesitas apoyo?
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#E9DFE4] rounded-xl text-xs text-[#241B24] focus:outline-none focus:ring-2 focus:ring-[#D52C69]/20 focus:border-[#D52C69] cursor-pointer"
            >
              <option value="Primera copa menstrual">Mi primera copa menstrual (talla y colocación)</option>
              <option value="Disco vs Copa">Diferencias entre Copa y Disco menstrual</option>
              <option value="Esterilizadores y cuidado">Esterilización y mantenimiento higiénico</option>
              <option value="Compresas térmicas">Compresas térmicas para descanso pélvico</option>
              <option value="Otro">Otra consulta personal</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tu nombre"
              required
              placeholder="Ej: Sofia"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="WhatsApp o Correo"
              required
              placeholder="099... o tu@correo.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <Textarea
            label="Cuéntanos brevemente tu inquietud"
            rows={3}
            placeholder="Ej: Tengo 22 años, hago deporte y nunca he usado copa..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cerrar
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={<MessageSquareHeart className="w-4 h-4" />}>
              Solicitar orientación
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
