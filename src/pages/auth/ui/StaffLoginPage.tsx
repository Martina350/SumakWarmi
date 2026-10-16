import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSessionStore } from '../../../entities/session/index.ts';
import {
  staffSessionActions,
  STAFF_PROTOTYPE_PASSWORD,
} from '../../../entities/session/model/staffSessionStore.ts';
import { Input } from '../../../shared/ui/Input.tsx';
import { Button } from '../../../shared/ui/Button.tsx';

export function StaffLoginPage({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const { users } = useSessionStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.isActive &&
        (u.role === 'ADMIN' || u.role === 'SELLER'),
    );
    if (!user || password !== STAFF_PROTOTYPE_PASSWORD) {
      setError(
        'No pudimos iniciar sesión. Revisa tus credenciales y que tu cuenta esté activa.',
      );
      return;
    }
    try {
      staffSessionActions.login(user.id);
      onNavigate(
        user.role === 'ADMIN' ? '/admin/dashboard' : '/vendedor/dashboard',
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo guardar la sesión.',
      );
    }
  };
  return (
    <main className="min-h-screen bg-[#F4F0F2] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-[#302333] text-white p-14">
        <span className="text-xl font-bold tracking-wider">
          SUMAKWARMI<span className="text-[#EE839F]">.</span>
        </span>
        <div className="max-w-lg space-y-6">
          <ShieldCheck className="w-12 h-12 text-[#EE839F]" />
          <p className="text-sm uppercase tracking-[0.25em] text-[#EE839F]">
            Espacio de trabajo
          </p>
          <p className="text-5xl font-heading font-semibold leading-tight">
            Todo tu equipo.
            <br />
            Cada proceso en su lugar.
          </p>
          <p className="text-white/65 leading-relaxed">
            Administración y ventas, con herramientas y accesos correspondientes
            a cada función.
          </p>
        </div>
        <p className="text-xs text-white/50">Gestión interna · SUMAKWARMI</p>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16">
        <div className="w-full max-w-md mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A91E50]">
            Acceso del equipo
          </span>
          <h1 className="text-3xl font-bold mt-3">Bienvenida de nuevo</h1>
          <p className="text-sm text-[#665D65] mt-3 mb-8">
            Ingresa con tu cuenta para abrir tu espacio de trabajo.
          </p>
          <form
            onSubmit={submit}
            className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E9DFE4] shadow-sm"
          >
            <Input
              id="staff-email"
              label="Correo electrónico"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />
            <Input
              id="staff-password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />
            {error && (
              <p role="alert" className="text-sm text-[#B42336]">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Ingresar al sistema
            </Button>
            <p className="text-xs text-[#665D65] leading-relaxed">
              Tu cuenta determina el panel al que puedes acceder. Si necesitas
              ayuda con tu acceso, contacta a administración.
            </p>
          </form>
          <button
            onClick={() => onNavigate('/')}
            className="mt-8 flex items-center gap-2 text-sm text-[#665D65] hover:text-[#A91E50] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>
      </div>
    </main>
  );
}
