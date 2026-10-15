import React from 'react';
import { useSessionStore, sessionActions } from '../../../entities/session/index.ts';
import { orderShipmentActions } from '../../../entities/order/index.ts';
import { catalogActions } from '../../../entities/catalog/index.ts';
import { Users, RotateCcw, ShieldCheck } from 'lucide-react';

export const DemoRoleSwitcher: React.FC = () => {
  const { currentUser, users } = useSessionStore();

  const handleReset = () => {
    if (window.confirm('¿Deseas restablecer todos los datos de demostración a su estado inicial?')) {
      sessionActions.resetUsers();
      catalogActions.resetCatalog();
      orderShipmentActions.resetOrders();
    }
  };

  return (
    <div className="bg-[#272329] text-[#FFFDFB] text-xs py-2 px-4 border-b border-black/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#A7B8A0] shrink-0" />
          <span className="font-semibold tracking-wide">ENTORNO DEMO</span>
          <span className="text-[#FFFDFB]/60 hidden sm:inline">· Simulación de roles y datos locales</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#DDAAB9] shrink-0" />
            <span className="text-[#FFFDFB]/80 font-medium">Rol actual:</span>
            <select
              value={currentUser?.id || 'visitor'}
              onChange={(e) => sessionActions.switchUserById(e.target.value === 'visitor' ? null : e.target.value)}
              className="bg-[#38333B] text-white text-xs px-2.5 py-1 rounded-md border border-[#716A70]/40 focus:outline-none focus:ring-1 focus:ring-[#DDAAB9] cursor-pointer"
            >
              <option value="visitor">Visitante (Público / Sin sesión)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role}{!u.isActive ? ' - Inactivo' : ''})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[#FFFDFB] transition-colors cursor-pointer"
            title="Restablecer catálogo, pedidos y usuarios demo"
          >
            <RotateCcw className="w-3 h-3 text-[#DDAAB9]" />
            <span className="hidden md:inline">Restablecer datos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
