import React, { useState } from 'react';
import { useSessionStore, sessionActions } from '../../../entities/session/index.ts';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';

export const AuthPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { users } = useSessionStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>(window.location.hash === '#/registro' ? 'register' : 'login');
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (mode === 'register') {
      if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        setError('Este correo ya está registrado. Utiliza otro correo o inicia sesión.');
        return;
      }
      if (!name.trim()) { setError('Ingresa tu nombre completo.'); return; }
      try { sessionActions.registerCustomer(name.trim(), normalizedEmail, phone.trim()); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la cuenta.'); return; }
    } else {
      const user = users.find((u) => u.email.toLowerCase() === normalizedEmail && u.role === 'CUSTOMER' && u.isActive);
      if (!user) { setError('No encontramos una cuenta de cliente activa con ese correo.'); return; }
      try { sessionActions.setCurrentUser(user); } catch (e) { setError(String(e)); return; }
    }
    onNavigate('/mi-cuenta');
  };
  return (
    <div className="max-w-md mx-auto px-4 py-12 text-left space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold">{mode === 'login' ? 'Bienvenida a SUMAKWARMI' : 'Crear tu cuenta'}</h1>
        <p className="text-sm text-[#665D65] mt-2">{mode === 'login' ? 'Ingresa tu correo para consultar tus compras y direcciones.' : 'Completa tus datos para tu primera compra.'}</p>
      </div>
      <form onSubmit={submit} className="bg-white rounded-[20px] border border-[#E9DFE4] p-6 space-y-4 shadow-xs">
        {mode === 'register' && <Input id="customer-name" label="Nombre completo" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />}
        <Input id="customer-email" label="Correo electrónico" type="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
        {mode === 'register' && <Input id="customer-phone" label="Teléfono" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />}
        {error && <p role="alert" className="text-xs text-[#B42336]">{error}</p>}
        <Button type="submit" className="w-full">{mode === 'login' ? 'Ingresar a mi cuenta' : 'Crear cuenta'}</Button>
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="w-full text-xs text-[#A91E50] hover:underline pt-2 cursor-pointer">{mode === 'login' ? '¿Aún no tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}</button>
      </form>
    </div>
  );
};
