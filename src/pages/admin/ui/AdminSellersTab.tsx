import React, { useState } from 'react';
import { useSessionStore, sessionActions } from '../../../entities/session/index.ts';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../../shared/ui/Table.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { Badge } from '../../../shared/ui/Badge.tsx';
import { UserCheck, UserX, UserPlus } from 'lucide-react';

export const AdminSellersTab: React.FC = () => {
  const { users } = useSessionStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const sellers = users.filter((u) => u.role === 'SELLER');

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    sessionActions.createSeller(name, email, phone);
    setName('');
    setEmail('');
    setPhone('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-[#272329]">Equipo Comercial y Vendedores</h3>
          <p className="text-xs text-[#716A70]">Gestiona accesos operativos y asignación de pedidos.</p>
        </div>
        <Button size="sm" variant="primary" icon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setShowAddForm(true)}>
          Nuevo vendedor
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateSeller} className="p-4 bg-white rounded-xl border border-[#E9DEE3] space-y-3">
          <h4 className="text-xs font-bold text-[#716A70] uppercase">Registrar cuenta de vendedor</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Nombre completo" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Correo electrónico" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Teléfono / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" type="submit">Guardar vendedor</Button>
          </div>
        </form>
      )}

      <Table>
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Contacto</Th>
            <Th>Estado</Th>
            <Th className="text-right">Acción</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sellers.map((s) => (
            <Tr key={s.id}>
              <Td className="font-semibold text-xs text-[#272329]">{s.name}</Td>
              <Td className="text-xs text-[#716A70]">{s.email} · {s.phone}</Td>
              <Td>
                <Badge tone={s.isActive ? 'success' : 'danger'}>
                  {s.isActive ? 'Activo' : 'Desactivado'}
                </Badge>
              </Td>
              <Td className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sessionActions.toggleSellerActive(s.id)}
                  icon={s.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                >
                  {s.isActive ? 'Desactivar' : 'Activar'}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};
