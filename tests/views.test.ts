import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

Object.assign(globalThis, { window: { location: { hash: '' } } });
const { default: App } = await import('../src/App.tsx');
const { businessStore } = await import('../src/shared/domain/businessStore.ts');
const { Dashboard } = await import('../src/pages/workspace/ui/Dashboard.tsx');
const { CatalogManager, CategoriesManager } = await import(
  '../src/pages/workspace/ui/CatalogManager.tsx'
);
const {
  InventoryManager,
  TeamManager,
  SettingsManager,
  CustomersManager,
  AuditManager,
} = await import('../src/pages/workspace/ui/Management.tsx');
const { SalesManager, OrderWorkspace } = await import(
  '../src/pages/workspace/ui/SalesManager.tsx'
);
const render = (
  component: React.ComponentType<any>,
  props: Record<string, unknown> = {},
) => renderToStaticMarkup(React.createElement(component, props));
const navigate = () => {};
const run = () => true;
const admin = businessStore.getState().users.find((u) => u.role === 'ADMIN')!;
const seller = businessStore
  .getState()
  .users.find((u) => u.id === 'usr-seller-andrea')!;

test('entrada pública mantiene compra y oculta accesos administrativos', () => {
  window.location.hash = '#/';
  const html = render(App);
  assert.ok(html.includes('Abrir carrito'));
  assert.ok(!html.includes('ENTORNO DEMO'));
  assert.ok(!html.includes('Panel Admin'));
});
test('rutas internas requieren login y no renderizan elementos del ecommerce', () => {
  for (const path of [
    '/admin/dashboard',
    '/admin/catalogo/productos',
    '/vendedor/ventas',
    '/panel',
    '/equipo/login',
  ]) {
    window.location.hash = `#${path}`;
    const html = render(App);
    assert.ok(html.includes('Ingresar al sistema'), path);
    assert.ok(!html.includes('Abrir carrito'), path);
    assert.ok(!html.includes('<footer'), path);
  }
});
test('acceso de clientes no enumera cuentas ni perfiles del equipo', () => {
  window.location.hash = '#/iniciar-sesion';
  const html = render(App);
  assert.ok(html.includes('customer-email'));
  assert.ok(!html.includes('admin@sumakwarmi.ec'));
  assert.ok(!html.includes('perfil demo'));
});
test('una ficha archivada no muestra otro producto en su lugar', () => {
  window.location.hash = '#/producto/ficha-demo-archived';
  const html = render(App);
  assert.ok(html.includes('Producto no disponible'));
  assert.ok(!html.includes('Añadir al carrito'));
});
test('módulos administrativos renderizan con datos de la misma fuente', () => {
  const components: [
    React.ComponentType<any>,
    Record<string, unknown>,
    string,
  ][] = [
    [Dashboard, { user: admin, navigate }, 'Resumen del negocio'],
    [Dashboard, { user: seller, navigate }, 'Hola, Andrea'],
    [
      CatalogManager,
      { run, path: 'catalogo/productos', navigate },
      'Nuevo producto',
    ],
    [
      CatalogManager,
      { run, path: 'catalogo/productos/nuevo', navigate },
      'Guardar producto',
    ],
    [
      CatalogManager,
      { run, path: 'catalogo/productos/prod-training-demo/editar', navigate },
      'Editar producto',
    ],
    [CategoriesManager, { run }, 'Nueva categoría'],
    [InventoryManager, { run }, 'Inventario por SKU'],
    [TeamManager, { run, navigate }, 'Nuevo vendedor'],
    [SettingsManager, { run }, 'Restablecer datos demo'],
    [CustomersManager, { navigate }, 'Clientes'],
    [AuditManager, {}, 'Auditoría'],
    [
      SalesManager,
      { user: admin, run, section: 'ventas', navigate },
      'Ventas y pedidos',
    ],
    [
      SalesManager,
      { user: seller, run, section: 'pagos', navigate },
      'Pagos y comprobantes',
    ],
    [
      OrderWorkspace,
      { id: 'ord-scenario-READY', user: admin, run, navigate },
      'Confirmar despacho',
    ],
    [
      OrderWorkspace,
      { id: 'ord-scenario-PROOF_SUBMITTED', user: admin, run, navigate },
      'Iniciar revisión',
    ],
  ];
  for (const [component, props, expected] of components) {
    const html = render(component, props);
    // READY has preparation complete but requires registering a label first.
    assert.ok(
      html.includes(
        expected === 'Confirmar despacho' ? 'Registrar guía' : expected,
      ),
      `${component.name}: ${expected}`,
    );
    assert.ok(!html.includes('Abrir carrito'));
  }
});
