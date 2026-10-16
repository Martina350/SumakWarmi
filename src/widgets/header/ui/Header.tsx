import React, { useRef } from 'react';
import { useSessionStore } from '../../../entities/session/index.ts';
import { useCartStore, cartActions } from '../../../entities/cart/index.ts';
import { ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import logoImg from '../../../assets/romina-sumak-warmi-logotipo-2.png';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { currentUser: sessionUser } = useSessionStore();
  const currentUser = sessionUser?.role === 'CUSTOMER' ? sessionUser : null;
  const logoClicks = useRef(0);
  const handleLogoClick = () => {
    logoClicks.current += 1;
    if (logoClicks.current === 10) {
      logoClicks.current = 0;
      onNavigate('/equipo/login');
    } else {
      onNavigate('/');
    }
  };
  const { items } = useCartStore();
  const totalCartCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <header className="bg-[#EE839F] border-b border-white/20 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-8">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 text-left group cursor-pointer whitespace-nowrap shrink-0"
          aria-label="Ir a inicio de SUMAKWARMI"
        >
          <img
            src={logoImg}
            alt="Romina Sumak Warmi"
            className="h-12 sm:h-13 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </button>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <button
            onClick={() => onNavigate('/tienda')}
            className={`cursor-pointer whitespace-nowrap py-1.5 transition-all text-white ${
              currentPath === '/tienda'
                ? 'font-semibold border-b-2 border-white'
                : 'opacity-90 hover:opacity-100 hover:border-b-2 hover:border-white/60 border-b-2 border-transparent'
            }`}
          >
            Tienda
          </button>
          <button
            onClick={() => onNavigate('/nosotras')}
            className={`cursor-pointer whitespace-nowrap py-1.5 transition-all text-white ${
              currentPath === '/nosotras'
                ? 'font-semibold border-b-2 border-white'
                : 'opacity-90 hover:opacity-100 hover:border-b-2 hover:border-white/60 border-b-2 border-transparent'
            }`}
          >
            Nosotras
          </button>
          <button
            onClick={() => onNavigate('/guia')}
            className={`cursor-pointer whitespace-nowrap py-1.5 transition-all text-white ${
              currentPath === '/guia'
                ? 'font-semibold border-b-2 border-white'
                : 'opacity-90 hover:opacity-100 hover:border-b-2 hover:border-white/60 border-b-2 border-transparent'
            }`}
          >
            Guía de bienestar
          </button>
          <button
            onClick={() => onNavigate('/ayuda')}
            className={`cursor-pointer whitespace-nowrap py-1.5 transition-all text-white ${
              currentPath === '/ayuda'
                ? 'font-semibold border-b-2 border-white'
                : 'opacity-90 hover:opacity-100 hover:border-b-2 hover:border-white/60 border-b-2 border-transparent'
            }`}
          >
            Envíos & FAQ
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {sessionUser?.role === 'ADMIN' && (
            <button
              onClick={() => onNavigate('/admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/40 shadow-xs rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
              <span>Panel Admin</span>
            </button>
          )}
          {sessionUser?.role === 'SELLER' && (
            <button
              onClick={() => onNavigate('/panel')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/40 shadow-xs rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
              <span>Panel Vendedor</span>
            </button>
          )}
          <button
            onClick={() => onNavigate(currentUser ? '/mi-cuenta' : '/iniciar-sesion')}
            className="flex items-center gap-1.5 p-2 text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer font-medium"
            title={currentUser ? `Cuenta: ${currentUser.name}` : 'Iniciar sesión'}
          >
            <User className="w-5 h-5 text-white" />
            <span className="text-xs font-semibold hidden lg:inline max-w-[100px] truncate text-white">
              {currentUser ? currentUser.name.split(' ')[0] : 'Cuenta'}
            </span>
          </button>
          <button
            onClick={cartActions.openDrawer}
            className="relative flex items-center justify-center p-2.5 bg-[#A91E50] hover:bg-[#8F1742] text-white rounded-xl shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#A91E50] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center font-data shadow-xs">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
