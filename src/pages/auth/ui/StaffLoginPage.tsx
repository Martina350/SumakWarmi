import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useSessionStore } from '../../../entities/session/index.ts';
import {
  staffSessionActions,
  STAFF_PROTOTYPE_PASSWORD,
} from '../../../entities/session/model/staffSessionStore.ts';
import { Input } from '../../../shared/ui/Input.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import logoImg from '../../../assets/romina-sumak-warmi-logotipo-2.png';

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
    <main className="min-h-screen bg-[#FFF7F9] grid lg:grid-cols-2 selection:bg-[#FBE7ED] selection:text-[#A91E50]">
      {/* Brand & Workspace Left Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#EE839F] text-white p-12 xl:p-16 relative overflow-hidden shadow-2xl">
        {/* Decorative soft glowing elements using palette accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D52C69]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <button
            onClick={() => onNavigate('/')}
            className="group flex items-center gap-3 cursor-pointer text-left"
            aria-label="Ir al inicio de SUMAKWARMI"
          >
            <img
              src={logoImg}
              alt="Romina Sumak Warmi"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
            />
          </button>
        </div>

        {/* Center Content */}
        <div className="max-w-lg space-y-6 relative z-10 my-auto py-12">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.2em] border border-white/30">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Espacio de trabajo seguro</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-heading font-extrabold text-white leading-[1.15] tracking-tight">
            Todo tu equipo.
            <br />
            <span className="text-[#FFF7F9]">Cada proceso en su lugar.</span>
          </h2>

          <p className="text-white/95 text-base leading-relaxed">
            Administración y ventas con herramientas especializadas, trazabilidad auditada y accesos correspondientes a cada función.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-medium text-white border border-white/25">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Gestión de pedidos</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-medium text-white border border-white/25">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Auditoría de pagos</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-medium text-white border border-white/25">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Despachos Servientrega</span>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-white/85">
          <span>Gestión interna · SUMAKWARMI</span>
          <span>Ecuador</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-20 bg-[#FFF7F9]">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="p-3 bg-[#EE839F] rounded-2xl shadow-sm inline-flex">
              <img
                src={logoImg}
                alt="Romina Sumak Warmi"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FBE7ED] text-[#A91E50] text-xs font-bold uppercase tracking-widest border border-[#EE839F]/30 mb-3">
            <span>Acceso del equipo</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#241B24] tracking-tight">
            Bienvenida de nuevo
          </h1>
          <p className="text-sm text-[#665D65] mt-2 mb-8 leading-relaxed">
            Ingresa con tus credenciales asignadas para abrir tu panel de trabajo.
          </p>

          <form
            onSubmit={submit}
            className="space-y-5 bg-white p-7 sm:p-9 rounded-[24px] border border-[#E9DFE4] shadow-xl shadow-[#D52C69]/5"
          >
            <Input
              id="staff-email"
              label="Correo electrónico"
              type="email"
              placeholder="tu.correo@sumakwarmi.com"
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
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />

            {error && (
              <div
                role="alert"
                className="p-3.5 bg-[#FDEBED] border border-[#B42336]/20 rounded-xl text-xs font-medium text-[#B42336] leading-relaxed"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold !bg-[#D52C69] hover:!bg-[#A91E50] !text-white rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Ingresar al sistema
            </Button>

            <div className="p-3.5 bg-[#FFF7F9] rounded-xl border border-[#E9DFE4] text-xs text-[#665D65] leading-relaxed">
              Tu cuenta determina el panel al que puedes acceder. Si necesitas ayuda con tu acceso, contacta a administración.
            </div>
          </form>

          <button
            onClick={() => onNavigate('/')}
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#665D65] hover:text-[#A91E50] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#A91E50]" />
            <span>Volver a la tienda</span>
          </button>
        </div>
      </div>
    </main>
  );
}
