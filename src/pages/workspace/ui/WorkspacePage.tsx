import React, { useEffect, useState } from 'react';
import { StaffLayout } from '../../../widgets/staff-layout/ui/StaffLayout.tsx';
import { useStaffSessionStore } from '../../../entities/session/model/staffSessionStore.ts';
import { useBusinessStore } from '../../../shared/domain/businessStore.ts';
import {
  can,
  operations,
  visibleOrders,
} from '../../../shared/domain/operations.ts';
import { Dashboard } from './Dashboard.tsx';
import { CatalogManager, CategoriesManager } from './CatalogManager.tsx';
import { SalesManager, OrderWorkspace } from './SalesManager.tsx';
import {
  InventoryManager,
  TeamManager,
  CustomersManager,
  SettingsManager,
  AuditManager,
} from './Management.tsx';
import { Empty, Heading, type Run } from './common.tsx';
import { storageWarnings } from '../../../shared/lib/createStore.ts';

export function WorkspacePage({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate: (p: string) => void;
}) {
  const { currentUser: user } = useStaffSessionStore();
  const state = useBusinessStore();
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const admin = user?.role === 'ADMIN';
  const base = admin ? '/admin' : '/vendedor';
  const relative =
    path.replace(/^\/(admin|vendedor|panel)/, '').split('?')[0] || '/dashboard';
  const section = relative.slice(1);
  const run: Run = (action, message = 'Operación guardada') => {
    try {
      action();
      setNotice({ text: message, error: false });
      return true;
    } catch (error) {
      setNotice({
        text:
          error instanceof Error
            ? error.message
            : 'No se pudo completar la operación',
        error: true,
      });
      return false;
    }
  };
  useEffect(() => {
    const tick = () => {
      try {
        operations.expireReservations();
      } catch (e) {
        setNotice({ text: String(e), error: true });
      }
    };
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);
  if (!user) return null;
  const navigate = (part: string) => {
    setNotice(null);
    onNavigate(`${base}${part}`);
  };
  const orders = visibleOrders(state, user);
  const tabs = admin
    ? [
        { id: 'dashboard', label: 'Resumen del negocio' },
        { id: 'ventas', label: 'Ventas y pedidos', count: orders.length },
        {
          id: 'pagos',
          label: 'Pagos',
          count: orders.filter((o) =>
            ['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(o.paymentStatus),
          ).length,
        },
        { id: 'logistica', label: 'Logística' },
        { id: 'catalogo/productos', label: 'Productos' },
        { id: 'catalogo/categorias', label: 'Categorías' },
        { id: 'inventario', label: 'Inventario' },
        { id: 'inventario/movimientos', label: 'Movimientos' },
        { id: 'clientes', label: 'Clientes' },
        { id: 'vendedores', label: 'Equipo de ventas' },
        { id: 'reportes', label: 'Reportes' },
        { id: 'auditoria', label: 'Auditoría' },
        { id: 'configuracion', label: 'Configuración' },
      ]
    : [
        { id: 'dashboard', label: 'Mi operación' },
        {
          id: 'ventas',
          label: 'Mis ventas y cola',
          count: orders.filter((o) => o.assignedSellerId === user.id).length,
        },
        ...(can(user, 'payments.review')
          ? [{ id: 'pagos', label: 'Pagos autorizados' }]
          : []),
        ...(can(user, 'orders.prepare')
          ? [{ id: 'preparacion', label: 'Preparación' }]
          : []),
        ...(can(user, 'shipping.dispatch')
          ? [{ id: 'despachos', label: 'Despachos' }]
          : []),
        ...(can(user, 'analytics.own')
          ? [{ id: 'mis-estadisticas', label: 'Mi rendimiento' }]
          : []),
        { id: 'perfil', label: 'Mi perfil' },
      ];
  const active =
    [...tabs]
      .sort((a, b) => b.id.length - a.id.length)
      .find((t) => section === t.id || section.startsWith(`${t.id}/`))?.id ||
    '';
  const permission: Record<string, string> = {
    'catalogo/productos': 'catalog.write',
    'catalogo/categorias': 'catalog.write',
    inventario: 'inventory.adjust',
    'inventario/movimientos': 'inventory.adjust',
    vendedores: 'users.manage',
    clientes: 'users.manage',
    reportes: 'analytics.global',
    auditoria: 'analytics.global',
    configuracion: 'settings.manage',
    pagos: 'payments.review',
    preparacion: 'orders.prepare',
    despachos: 'shipping.dispatch',
    'mis-estadisticas': 'analytics.own',
  };
  const authorized = !permission[active] || can(user, permission[active]);
  let content: React.ReactNode;
  if (!authorized || !active)
    content = (
      <Empty>
        No tienes acceso a este apartado o la dirección no existe.{' '}
        <button onClick={() => navigate('/dashboard')}>Abrir mi panel</button>
      </Empty>
    );
  else if (section.startsWith('ventas/') || section.startsWith('logistica/'))
    content = (
      <OrderWorkspace
        key={section}
        id={
          section.startsWith('logistica/')
            ? state.shipments.find((s) => s.id === section.split('/')[1])
                ?.orderId || section.split('/')[1]
            : section.split('/')[1]
        }
        user={user}
        run={run}
        navigate={navigate}
      />
    );
  else if (
    section === 'dashboard' ||
    section === 'reportes' ||
    section === 'mis-estadisticas' ||
    section.startsWith('vendedores/')
  )
    content = (
      <Dashboard
        user={user}
        run={run}
        navigate={navigate}
        reportMode={section !== 'dashboard'}
        sellerId={
          section.startsWith('vendedores/') ? section.split('/')[1] : undefined
        }
      />
    );
  else if (section.startsWith('catalogo/productos'))
    content = (
      <CatalogManager
        key={section}
        run={run}
        path={section}
        navigate={navigate}
      />
    );
  else if (section === 'catalogo/categorias')
    content = <CategoriesManager run={run} />;
  else if (section.startsWith('inventario'))
    content = (
      <InventoryManager
        run={run}
        movementsOnly={section.includes('movimientos')}
      />
    );
  else if (section === 'vendedores')
    content = <TeamManager run={run} navigate={navigate} />;
  else if (section === 'clientes')
    content = <CustomersManager navigate={navigate} />;
  else if (section === 'configuracion') content = <SettingsManager run={run} />;
  else if (section === 'auditoria') content = <AuditManager />;
  else if (section === 'perfil')
    content = (
      <>
        <Heading
          title="Mi perfil"
          description="Tu acceso es administrado por SUMAKWARMI."
        />
        <section className="system-panel">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p>{user.phone}</p>
          <h3>Permisos habilitados</h3>
          {user.permissions?.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>
      </>
    );
  else
    content = (
      <SalesManager
        key={`${section}:${path.split('?')[1] || ''}`}
        section={section}
        user={user}
        run={run}
        navigate={navigate}
      />
    );
  return (
    <StaffLayout
      tabs={tabs}
      activeTab={active}
      onChange={(id) => navigate(`/${id}`)}
    >
      <div className="system-workspace">
        <p className="system-demo">
          Entorno de demostración · operaciones locales sin cobros, correos ni
          envíos reales
        </p>
        {!!storageWarnings.length && (
          <p role="alert" className="system-warning">
            {storageWarnings.join(' ')}
          </p>
        )}
        {state.migrationNotice && admin && (
          <div className="system-warning">
            {state.migrationNotice}{' '}
            <button
              onClick={() =>
                run(() => operations.dismissMigration(), 'Aviso cerrado')
              }
            >
              Entendido
            </button>
          </div>
        )}
        {notice && (
          <div
            role={notice.error ? 'alert' : 'status'}
            aria-live="polite"
            className={
              notice.error
                ? 'system-toast system-error'
                : 'system-toast system-success'
            }
          >
            <span>{notice.text}</span>
            <button aria-label="Cerrar aviso" onClick={() => setNotice(null)}>
              ×
            </button>
          </div>
        )}
        {content}
      </div>
    </StaffLayout>
  );
}
