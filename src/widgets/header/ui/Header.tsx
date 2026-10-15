import React from 'react';
import { useSessionStore } from '../../../entities/session/index.ts';
import { useCartStore, cartActions } from '../../../entities/cart/index.ts';
import { ShoppingBag, User, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { currentUser } = useSessionStore();
  const { items } = useCartStore();
  const totalCartCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E9DEE3] sticky top-[33px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-8">
        <button onClick={() => onNavigate('/')} className="flex items-center gap-2.5 text-left group cursor-pointer whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#7A3F65] text-white flex items-center justify-center font-serif-display text-lg font-bold">S</div>
          <div>
            <span className="font-serif-display text-xl font-bold tracking-tight text-[#272329] block group-hover:text-[#7A3F65] transition-colors">SUMAKWARMI</span>
            <span className="text-[10px] tracking-widest text-[#716A70] uppercase block">Romina · Bienestar</span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#716A70]">
          <button onClick={() => onNavigate('/tienda')} className={`hover:text-[#7A3F65] transition-colors whitespace-nowrap ${currentPath === '/tienda' ? 'text-[#7A3F65] font-semibold' : ''}`}>Tienda</button>
          <button onClick={() => onNavigate('/nosotras')} className={`hover:text-[#7A3F65] transition-colors whitespace-nowrap ${currentPath === '/nosotras' ? 'text-[#7A3F65] font-semibold' : ''}`}>Nosotras</button>
          <button onClick={() => onNavigate('/guia')} className={`hover:text-[#7A3F65] transition-colors whitespace-nowrap ${currentPath === '/guia' ? 'text-[#7A3F65] font-semibold' : ''}`}>Guía de bienestar</button>
          <button onClick={() => onNavigate('/ayuda')} className={`hover:text-[#7A3F65] transition-colors whitespace-nowrap ${currentPath === '/ayuda' ? 'text-[#7A3F65] font-semibold' : ''}`}>Envíos & FAQ</button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {currentUser?.role === 'ADMIN' && (
            <button onClick={() => onNavigate('/admin')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#7A3F65]/10 text-[#7A3F65] hover:bg-[#7A3F65]/20 rounded-lg text-xs font-semibold transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5" /><span>Panel Admin</span>
            </button>
          )}
          {currentUser?.role === 'SELLER' && (
            <button onClick={() => onNavigate('/panel')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#A7B8A0]/20 text-[#272329] hover:bg-[#A7B8A0]/30 rounded-lg text-xs font-semibold transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5" /><span>Panel Vendedor</span>
            </button>
          )}
          <button onClick={() => onNavigate(currentUser ? '/mi-cuenta' : '/iniciar-sesion')} className="flex items-center gap-1.5 p-2 text-[#716A70] hover:text-[#7A3F65] hover:bg-[#F9F1F3] rounded-xl transition-colors" title={currentUser ? `Cuenta: ${currentUser.name}` : 'Iniciar sesión'}>
            <User className="w-5 h-5" />
            <span className="text-xs font-medium hidden lg:inline max-w-[100px] truncate">{currentUser ? currentUser.name.split(' ')[0] : 'Cuenta'}</span>
          </button>
          <button onClick={cartActions.openDrawer} className="relative flex items-center justify-center p-2.5 bg-[#7A3F65] hover:bg-[#653353] text-white rounded-xl shadow-xs transition-colors cursor-pointer" aria-label="Abrir carrito">
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#DDAAB9] text-[#272329] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-data">{totalCartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};
