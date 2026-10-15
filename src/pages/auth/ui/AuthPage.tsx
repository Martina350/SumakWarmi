import React, { useState } from 'react';
import { useSessionStore, sessionActions } from '../../../entities/session/index.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { UserCheck, ShieldCheck } from 'lucide-react';

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
        <h1 className="text-2xl font-serif-display font-bold text-[#272329]">
          {mode === 'login' ? 'Acceso a SUMAKWARMI' : 'Crear tu cuenta'}
        </h1>
        <p className="text-xs text-[#716A70] mt-1">
          {mode === 'login' ? 'Selecciona una cuenta de demostración o regístrate' : 'Completa tus datos para tu primera compra'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E9DEE3] p-6 space-y-4 shadow-xs">
        <span className="text-xs font-bold text-[#716A70] uppercase block">
          Acceso rápido por perfil demo
        </span>
        <div className="space-y-2">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => handleQuickSelect(u.id)}
              className="w-full p-3 rounded-xl border border-[#E9DEE3] hover:border-[#7A3F65] hover:bg-[#F9F1F3]/40 transition-colors text-left flex justify-between items-center text-xs"
            >
              <div>
                <span className="font-semibold text-[#272329] block">{u.name}</span>
                <span className="text-[#716A70] text-[11px]">{u.email}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F9F1F3] text-[#7A3F65]">
                {u.role}
              </span>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-[#E9DEE3]">
          {mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3">
              <Input label="Nombre completo" required value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Correo electrónico" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Button type="submit" variant="primary" size="md" className="w-full">
                Crear cuenta
              </Button>
              <button type="button" onClick={() => setMode('login')} className="w-full text-xs text-[#7A3F65] underline pt-1">
                ¿Ya tienes cuenta? Volver
              </button>
            </form>
          ) : (
            <button onClick={() => setMode('register')} className="w-full text-xs text-[#7A3F65] font-semibold hover:underline">
              ¿Deseas registrar un nuevo cliente de prueba? Haz clic aquí
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
