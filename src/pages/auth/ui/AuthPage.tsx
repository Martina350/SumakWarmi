import React, { useState } from 'react';
import { useSessionStore, sessionActions } from '../../../entities/session/index.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';

interface AuthPageProps {
  onNavigate: (path: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { users } = useSessionStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    sessionActions.registerCustomer(name, email, phone);
    onNavigate('/mi-cuenta');
  };

  const handleQuickSelect = (userId: string) => {
    sessionActions.switchUserById(userId);
    const user = users.find((u) => u.id === userId);
    if (user?.role === 'ADMIN') onNavigate('/admin');
    else if (user?.role === 'SELLER') onNavigate('/panel');
    else onNavigate('/mi-cuenta');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-left space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold text-[#241B24]">
          {mode === 'login' ? 'Acceso a SUMAKWARMI' : 'Crear tu cuenta'}
        </h1>
        <p className="text-xs text-[#665D65] mt-1">
          {mode === 'login' ? 'Selecciona una cuenta de demostración o regístrate' : 'Completa tus datos para tu primera compra'}
        </p>
      </div>

      <div className="bg-white rounded-[20px] border border-[#E9DFE4] p-6 space-y-4 shadow-xs">
        <span className="text-xs font-bold text-[#665D65] uppercase block">
          Acceso rápido por perfil demo
        </span>
        <div className="space-y-2">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => handleQuickSelect(u.id)}
              className="w-full p-3 rounded-xl border border-[#E9DFE4] hover:border-[#D52C69] hover:bg-[#FFF7F9] transition-all text-left flex justify-between items-center text-xs cursor-pointer group"
            >
              <div>
                <span className="font-semibold text-[#241B24] group-hover:text-[#D52C69] transition-colors block">
                  {u.name}
                </span>
                <span className="text-[#665D65] text-[11px]">{u.email}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FBE7ED] text-[#A91E50] border border-[#EE839F]/20">
                {u.role}
              </span>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-[#E9DFE4]">
          {mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3">
              <Input label="Nombre completo" required value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Correo electrónico" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Button type="submit" variant="primary" size="md" className="w-full">
                Crear cuenta
              </Button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-xs text-[#A91E50] hover:text-[#D52C69] underline pt-1 cursor-pointer"
              >
                ¿Ya tienes cuenta? Volver
              </button>
            </form>
          ) : (
            <button
              onClick={() => setMode('register')}
              className="w-full text-xs text-[#A91E50] hover:text-[#D52C69] font-semibold hover:underline cursor-pointer text-center block pt-1"
            >
              ¿Deseas registrar un nuevo cliente de prueba? Haz clic aquí
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
