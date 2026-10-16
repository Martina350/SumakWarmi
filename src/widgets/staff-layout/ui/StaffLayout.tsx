import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  History,
  Inbox,
  ClipboardList,
  CreditCard,
  Truck,
  PackageCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Settings,
  ChartNoAxesCombined,
} from 'lucide-react';
import {
  useStaffSessionStore,
  staffSessionActions,
} from '../../../entities/session/model/staffSessionStore.ts';
import { TabItem } from '../../../shared/ui/Tabs.tsx';

const icons: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  ventas: ClipboardList,
  pagos: CreditCard,
  logistica: Truck,
  'catalogo/productos': Package,
  'catalogo/categorias': Boxes,
  inventario: Boxes,
  'inventario/movimientos': History,
  vendedores: Users,
  clientes: Users,
  auditoria: History,
  preparacion: Inbox,
  despachos: PackageCheck,
  reportes: ChartNoAxesCombined,
  'mis-estadisticas': ChartNoAxesCombined,
  configuracion: Settings,
  perfil: Users,
};
function groupFor(id: string) {
  if (
    [
      'dashboard',
      'ventas',
      'pagos',
      'logistica',
      'preparacion',
      'despachos',
    ].includes(id)
  )
    return 'Operación';
  if (id.startsWith('catalogo') || id.startsWith('inventario'))
    return 'Comercio';
  if (['clientes', 'vendedores', 'reportes', 'mis-estadisticas'].includes(id))
    return 'Gestión';
  return 'Sistema';
}

export function StaffLayout({
  tabs,
  activeTab,
  onChange,
  children,
}: {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}) {
  const { currentUser } = useStaffSessionStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    sidebarRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuRef.current?.focus();
      }
      if (e.key === 'Tab' && mobile) {
        const controls = Array.from(
          sidebarRef.current?.querySelectorAll<HTMLButtonElement>('button') ||
            [],
        );
        if (e.shiftKey && document.activeElement === controls[0]) {
          e.preventDefault();
          controls.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === controls.at(-1)) {
          e.preventDefault();
          controls[0]?.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [menuOpen, mobile]);
  const isAdmin = currentUser?.role === 'ADMIN';
  const title = isAdmin ? 'Administración' : 'Ventas';
  const section = tabs.find((tab) => tab.id === activeTab)?.label;
  const closeMenu = () => {
    setMenuOpen(false);
    menuRef.current?.focus();
  };
  return (
    <div className="min-h-screen bg-[#F4F0F2] text-[#241B24] lg:flex">
      {menuOpen && (
        <button
          aria-label="Cerrar menú"
          onClick={closeMenu}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}
      <aside
        ref={sidebarRef}
        inert={mobile && !menuOpen}
        aria-label={`Menú de ${title.toLowerCase()}`}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#302333] text-white flex flex-col transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-6 pt-7 pb-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <p className="text-lg font-bold tracking-wide">
              SUMAKWARMI<span className="text-[#EE839F]">.</span>
            </p>
            <p className="mt-2 text-xs text-white/55">
              {title} · Sistema de gestión
            </p>
          </div>
          <button
            aria-label="Cerrar menú"
            onClick={closeMenu}
            className="lg:hidden p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav
          aria-label={`Navegación de ${title.toLowerCase()}`}
          className="px-3 py-3 space-y-1 flex-1 min-h-0 overflow-y-auto"
        >
          {tabs.map((tab, index) => {
            const Icon = icons[tab.id] || LayoutDashboard;
            const group = tab.group || groupFor(tab.id);
            const previousGroup = index
              ? tabs[index - 1].group || groupFor(tabs[index - 1].id)
              : '';
            return (
              <React.Fragment key={tab.id}>
                {group !== previousGroup && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45 px-3 pt-4 pb-2">
                    {group}
                  </p>
                )}
                <button
                  aria-current={tab.id === activeTab ? 'page' : undefined}
                  onClick={() => {
                    onChange(tab.id);
                    if (mobile) closeMenu();
                    window.scrollTo(0, 0);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-colors cursor-pointer ${tab.id === activeTab ? 'bg-[#A91E50] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px]">
                      {tab.count}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#EE839F] font-bold">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">
                {currentUser?.name}
              </p>
              <p className="text-[11px] text-white/50 mt-1">
                {isAdmin ? 'Administradora' : 'Equipo de ventas'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              try {
                staffSessionActions.logout();
                window.location.hash = '/equipo/login';
              } catch (e) {
                window.alert(String(e));
              }
            }}
            className="flex items-center gap-3 p-3 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-xl w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#E9DFE4] px-4 sm:px-8 py-5 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              ref={menuRef}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F4F0F2]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-[#665D65]">{title}</span>
              <ChevronRight className="w-3 h-3 text-[#665D65]" />
              <span className="font-semibold">
                {section || 'Acceso restringido'}
              </span>
            </div>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#267A59]">
            <ShieldCheck className="w-4 h-4" />
            Sesión activa
          </span>
        </header>
        <main className="max-w-[1600px] mx-auto p-4 sm:p-8 space-y-7">
          {children}
        </main>
      </div>
    </div>
  );
}
