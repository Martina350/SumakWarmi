import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  businessStore,
  makeInitialState,
  normalizeState,
  available,
  cents,
} from '../src/shared/domain/businessStore.ts';
import { operations, visibleOrders } from '../src/shared/domain/operations.ts';
import { report } from '../src/shared/domain/reporting.ts';
import { staffIdentity } from '../src/entities/session/model/staffIdentity.ts';
import { customerIdentity } from '../src/entities/session/model/customerIdentity.ts';
import { createStore } from '../src/shared/lib/createStore.ts';
import { MockPaymentProvider } from '../src/shared/domain/providers.ts';

const adminId = 'usr-admin-mercedes';
const sellerId = 'usr-seller-andrea';
const otherId = 'usr-seller-lucia';
const proof = {
  fileName: 'transferencia-demo.png',
  fileSize: 100,
  fileUrl:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
};
const state = () => businessStore.getState();
const get = (id: string) => state().orders.find((o) => o.id === id)!;
const sku = () =>
  state().products.find((p) => p.id === 'product-test')!.variants[0];
const staff = (id = adminId) => staffIdentity.setState({ userId: id });
let sequence = 0;
beforeEach(() => {
  businessStore.setState(normalizeState(makeInitialState()));
  staff();
  customerIdentity.setState({ userId: 'usr-cust-martina' });
  operations.saveCategory({
    id: 'category-test',
    name: 'Categoría de prueba',
    slug: 'categoria-prueba',
    description: '',
    isActive: true,
    isVisible: true,
    displayOrder: 10,
  });
  operations.saveProduct({
    id: 'product-test',
    name: 'Producto ficticio de prueba',
    slug: 'producto-prueba',
    categoryId: 'category-test',
    categoryName: '',
    summary: '',
    description: '',
    status: 'ACTIVE',
    priceSource: 'mock',
    variants: [
      {
        id: 'sku-test',
        sku: 'TEST-001',
        name: 'Única',
        price: 10.15,
        stockActual: 10,
        stockReservado: 0,
        stockMinimo: 2,
      },
    ],
  });
});
function order(
  method: 'TRANSFER' | 'PAYPHONE' = 'TRANSFER',
  quantity = 1,
  operationId = `checkout-${++sequence}`,
) {
  return operations.createOrder({
    items: [
      {
        productId: 'product-test',
        variantId: 'sku-test',
        quantity,
        unitPrice: 10.15,
      },
    ],
    shippingAddress: state().users.find((u) => u.id === 'usr-cust-martina')!
      .addresses![0],
    paymentMethod: method,
    operationId,
  });
}
function approve(id: string) {
  operations.uploadProof(id, proof);
  const p = state().payments.find((p) => p.orderId === id && p.proof)!;
  staff();
  operations.review(id, p.id, 'START', '', get(id).version!);
  operations.review(
    id,
    p.id,
    'APPROVE',
    'Verificación manual DEMO',
    get(id).version!,
  );
  return p.id;
}
function dispatch(id: string) {
  staff();
  operations.assign(id, sellerId, 'Asignación de prueba', get(id).version!);
  staff(sellerId);
  operations.prepare(
    id,
    { 'sku-test': get(id).items[0].quantity },
    true,
    true,
    get(id).version!,
  );
  operations.registerShipment(
    id,
    `DEMO-TEST-${++sequence}`,
    'Registro ficticio',
    get(id).version!,
  );
  operations.ship(
    id,
    'DISPATCH',
    'Salida ficticia de bodega',
    get(id).version!,
  );
}

test('F1: catálogo, compra, importes enteros y reserva sin descontar físico', () => {
  const o = order('TRANSFER', 3);
  assert.equal(o.totalCents, 3395);
  assert.equal(o.total, 33.95);
  assert.equal(sku().stockActual, 10);
  assert.equal(sku().stockReservado, 3);
  assert.equal(available(sku()), 7);
  assert.equal(
    state().reservations.find((r) => r.orderId === o.id)?.status,
    'HELD',
  );
});
test('F2: transferencia aprobada compromete reserva y actualiza KPI una sola vez', () => {
  const baselinePaid = report(state()).paidCount;
  const o = order();
  const p = approve(o.id);
  const count = state().auditLogs.length;
  operations.review(o.id, p, 'APPROVE', 'Repetición', 0);
  assert.equal(get(o.id).paymentStatus, 'APPROVED');
  assert.equal(get(o.id).status, 'CONFIRMED');
  assert.equal(state().auditLogs.length, count);
  assert.equal(
    state().reservations.find((r) => r.orderId === o.id)?.status,
    'COMMITTED',
  );
  assert.equal(report(state()).paidCount, baselinePaid + 1);
});
test('F3: corrección conserva ambas evidencias sin duplicar reserva', () => {
  const o = order();
  operations.uploadProof(o.id, proof);
  const p = state().payments.find((p) => p.orderId === o.id && p.proof)!;
  operations.review(o.id, p.id, 'START', '', get(o.id).version!);
  operations.review(
    o.id,
    p.id,
    'REQUIRE_CORRECTION',
    'Imagen ilegible',
    get(o.id).version!,
  );
  operations.uploadProof(o.id, { ...proof, fileName: 'corregido-demo.png' });
  assert.equal(
    state().payments.filter((p) => p.orderId === o.id && p.proof).length,
    2,
  );
  assert.equal(sku().stockReservado, 1);
  const latest = state().payments.find(
    (p) => p.orderId === o.id && p.status === 'PENDING_VERIFICATION',
  )!;
  operations.review(o.id, latest.id, 'START', '', get(o.id).version!);
  operations.review(
    o.id,
    latest.id,
    'APPROVE',
    'Corregido y aprobado DEMO',
    get(o.id).version!,
  );
  assert.equal(get(o.id).status, 'CONFIRMED');
});
test('F4/F5: PayPhone fallo, reintento y éxito conserva resultados independientes', () => {
  const o = order('PAYPHONE');
  operations.payphone(o.id, 'FAILURE', 'attempt-failed');
  operations.payphone(o.id, 'SUCCESS', 'attempt-success');
  operations.payphone(o.id, 'SUCCESS', 'attempt-success');
  assert.ok(
    state().payments.some((p) => p.orderId === o.id && p.status === 'FAILED'),
  );
  assert.equal(
    state().payments.filter(
      (p) => p.orderId === o.id && p.status === 'APPROVED',
    ).length,
    1,
  );
  assert.throws(() => operations.payphone(o.id, 'SUCCESS', 'second-charge'));
  assert.equal(get(o.id).paymentStatus, 'APPROVED');
});
test('F6: checklist, guía, despacho idempotente y entrega', () => {
  const o = order();
  approve(o.id);
  dispatch(o.id);
  assert.equal(sku().stockActual, 9);
  assert.equal(sku().stockReservado, 0);
  assert.equal(get(o.id).shipmentStatus, 'HANDED_TO_CARRIER');
  operations.ship(o.id, 'DISPATCH', 'Repetición', 0);
  assert.equal(sku().stockActual, 9);
  operations.ship(
    o.id,
    'IN_TRANSIT',
    'Evento de tránsito DEMO',
    get(o.id).version!,
  );
  operations.ship(
    o.id,
    'DELIVERED',
    'Recepción ficticia confirmada',
    get(o.id).version!,
  );
  assert.equal(get(o.id).status, 'COMPLETED');
  assert.equal(
    state().movements.filter(
      (m) => m.variantId === 'sku-test' && m.type === 'ORDER_CONSUMED',
    ).length,
    1,
  );
});
test('F7: dos vendedores reclaman la misma versión y solo uno gana', () => {
  const o = order();
  approve(o.id);
  const version = get(o.id).version!;
  staff(sellerId);
  operations.assign(o.id, sellerId, 'Tomar pedido', version);
  staff(otherId);
  assert.throws(
    () => operations.assign(o.id, otherId, 'Tomar al mismo tiempo', version),
    /actualizado/,
  );
  assert.equal(get(o.id).assignedSellerId, sellerId);
});
test('F8: última unidad y liberación no permiten sobreventa ni doble liberación', () => {
  operations.adjustStock('sku-test', -9, 'Preparar última unidad');
  const o = order();
  assert.throws(() => order(), /Stock insuficiente/);
  operations.cancel(o.id, 'Cancelación de prueba', get(o.id).version!);
  operations.cancel(o.id, 'Reintento', 0);
  assert.equal(sku().stockActual, 1);
  assert.equal(sku().stockReservado, 0);
  assert.equal(available(sku()), 1);
});
test('F9: desactivar vendedor libera trabajos y conserva atribución histórica', () => {
  const baseline = report(state(), sellerId).net;
  const o = order();
  approve(o.id);
  operations.assign(o.id, sellerId, 'Asignación', get(o.id).version!);
  const u = state().users.find((u) => u.id === sellerId)!;
  operations.saveSeller({ ...u, isActive: false });
  assert.equal(get(o.id).assignedSellerId, undefined);
  assert.equal(get(o.id).salesAttributionSellerId, sellerId);
  staff(sellerId);
  assert.throws(
    () => operations.prepare(o.id, {}, false, false, get(o.id).version!),
    /permiso/,
  );
});
test('F10: precio cambiado invalida checkout antiguo y conserva snapshots', () => {
  const o = order();
  const p = state().products.find((p) => p.id === 'product-test')!;
  operations.saveProduct({
    ...p,
    variants: p.variants.map((v) => ({ ...v, price: 15 })),
  });
  assert.equal(get(o.id).items[0].unitPrice, 10.15);
  assert.equal(get(o.id).total, 13.65);
  assert.throws(() => order(), /Cambió el precio/);
});
test('F11: entrega fallida no se convierte en entrega completada', () => {
  const o = order();
  approve(o.id);
  dispatch(o.id);
  operations.ship(
    o.id,
    'DELIVERY_FAILED',
    'Destinatario ausente DEMO',
    get(o.id).version!,
  );
  assert.equal(get(o.id).shipmentStatus, 'DELIVERY_FAILED');
  assert.notEqual(get(o.id).status, 'COMPLETED');
  assert.throws(() =>
    operations.cancel(
      o.id,
      'Cancelar después del despacho',
      get(o.id).version!,
    ),
  );
});
test('F12: serialización recupera coherencia y reset elimina operaciones y reservas de prueba', () => {
  const o = order();
  const saved = JSON.stringify(state());
  businessStore.setState(JSON.parse(saved));
  assert.equal(get(o.id).id, o.id);
  assert.equal(sku().stockReservado, 1);
  staff(otherId);
  assert.equal(
    visibleOrders(state(), state().users.find((u) => u.id === otherId)!).some(
      (it) => it.id === o.id,
    ),
    false,
  );
  staff();
  assert.ok(
    visibleOrders(state(), state().users.find((u) => u.id === adminId)!).some(
      (it) => it.id === o.id,
    ),
  );
  operations.reset();
  assert.equal(
    state().orders.some((it) => it.id === o.id),
    false,
  );
  assert.equal(Object.keys(state().operations).length, 0);
});
test('permisos: vendedor sin aprobación ni catálogo y pedido ajeno quedan bloqueados', () => {
  const o = order();
  operations.uploadProof(o.id, proof);
  const p = state().payments.find((p) => p.orderId === o.id && p.proof)!;
  staff(otherId);
  assert.throws(
    () => operations.review(o.id, p.id, 'START', '', get(o.id).version!),
    /permiso/,
  );
  assert.throws(
    () =>
      operations.saveCategory({
        id: 'bad',
        name: 'No',
        slug: 'no',
        description: '',
        displayOrder: 0,
      }),
    /permiso/,
  );
  staff();
  approveNew(o.id);
  operations.assign(o.id, sellerId, 'Asignar', get(o.id).version!);
  staff(otherId);
  assert.equal(
    visibleOrders(state(), state().users.find((u) => u.id === otherId)!).some(
      (it) => it.id === o.id,
    ),
    false,
  );
  assert.throws(
    () => operations.prepare(o.id, {}, false, false, get(o.id).version!),
    /otro vendedor/,
  );
});
function approveNew(id: string) {
  const p = state().payments.find((p) => p.orderId === id && p.proof)!;
  operations.review(id, p.id, 'START', '', get(id).version!);
  operations.review(id, p.id, 'APPROVE', 'Aprobación demo', get(id).version!);
}
test('guardas: no despachar sin preparación ni ajustar por debajo de reservas', () => {
  const o = order();
  approve(o.id);
  assert.throws(() =>
    operations.registerShipment(
      o.id,
      'DEMO-XYZ',
      'Sin preparar',
      get(o.id).version!,
    ),
  );
  assert.throws(() =>
    operations.adjustStock('sku-test', -10, 'Ajuste inválido'),
  );
  assert.equal(sku().stockActual, 10);
});
test('vencimiento: libera temporal y congela comprobantes en revisión vigente', () => {
  const a = order();
  const b = order();
  operations.uploadProof(b.id, proof);
  businessStore.setState((prev) => ({
    ...prev,
    reservations: prev.reservations.map((r) =>
      [a.id, b.id].includes(r.orderId)
        ? { ...r, expiresAt: '2000-01-01T00:00:00Z' }
        : r,
    ),
  }));
  operations.expireReservations();
  assert.equal(get(a.id).status, 'EXPIRED');
  assert.equal(get(b.id).paymentStatus, 'PENDING_VERIFICATION');
  assert.equal(sku().stockReservado, 1);
});
test('reembolsos: neto ajustado y atribución no duplicada', () => {
  const baseline = report(state(), sellerId).net;
  const o = order();
  approve(o.id);
  operations.assign(o.id, sellerId, 'Atribución', get(o.id).version!);
  operations.cancel(o.id, 'Cancelación pagada', get(o.id).version!);
  operations.refund(o.id, 500, 'Reembolso parcial DEMO', get(o.id).version!);
  assert.equal(report(state(), sellerId).net - baseline, cents(13.65) - 500);
  assert.throws(() =>
    operations.refund(o.id, 999999, 'Exceso', get(o.id).version!),
  );
});
test('categorías: jerarquías cíclicas y SKU duplicado quedan bloqueados', () => {
  assert.throws(
    () =>
      operations.saveCategory({
        ...state().categories.find((c) => c.id === 'category-test')!,
        parentId: 'category-test',
      }),
    /ciclos/,
  );
  const p = state().products.find((p) => p.id === 'product-test')!;
  assert.throws(
    () =>
      operations.saveProduct({
        ...p,
        id: 'other-product',
        slug: 'otro',
        variants: p.variants.map((v) => ({ ...v, id: 'other-sku' })),
      }),
    /SKU/,
  );
});
test('persistencia fallida no cambia memoria ni publica éxito', () => {
  const testStore = createStore({ value: 1 }, 'test-key');
  const originalWindow = globalThis.window;
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage',
  );
  Object.defineProperty(globalThis, 'window', {
    value: {},
    configurable: true,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
    },
    configurable: true,
  });
  try {
    assert.throws(() => testStore.setState({ value: 2 }), /guardar/);
    assert.equal(testStore.getState().value, 1);
  } finally {
    if (originalWindow)
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        configurable: true,
      });
    else Reflect.deleteProperty(globalThis, 'window');
    if (originalStorage)
      Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('proveedor PayPhone conserva procesamiento, fallo y nuevo intento', () => {
  const o = order('PAYPHONE');
  const attempt = MockPaymentProvider.createAttempt(o.id, o.totalCents!);
  assert.equal(MockPaymentProvider.getStatus(attempt.id), 'PROCESSING');
  MockPaymentProvider.process(attempt.id, 'FAILURE');
  MockPaymentProvider.process(attempt.id, 'FAILURE');
  assert.equal(MockPaymentProvider.getStatus(attempt.id), 'FAILED');
  const retry = MockPaymentProvider.createAttempt(o.id, o.totalCents!);
  assert.notEqual(retry.id, attempt.id);
  MockPaymentProvider.process(retry.id, 'SUCCESS');
  assert.equal(get(o.id).paymentStatus, 'APPROVED');
});
test('auditoría conserva snapshots anteriores después de nuevas acciones', () => {
  const o = order();
  const createdEvent = state().auditLogs.find(
    (a) => a.entityId === o.id && a.action === 'ORDER_CREATED',
  )!;
  const original = JSON.stringify(createdEvent.next);
  approve(o.id);
  assert.equal(
    JSON.stringify(
      state().auditLogs.find((a) => a.id === createdEvent.id)!.next,
    ),
    original,
  );
});
test('carga de escenarios repetida no duplica pedidos ni reservas', () => {
  operations.loadScenarios();
  const count = state().orders.length;
  const reserved = state()
    .products.flatMap((p) => p.variants)
    .reduce((sum, v) => sum + v.stockReservado, 0);
  operations.loadScenarios();
  assert.equal(state().orders.length, count);
  assert.equal(
    state()
      .products.flatMap((p) => p.variants)
      .reduce((sum, v) => sum + v.stockReservado, 0),
    reserved,
  );
});

test('configuración conserva snapshots y aplica plantillas a nuevos eventos', () => {
  const old = order();
  const instructions = get(old.id).bankInstructionsSnapshot;
  operations.saveSettings({
    ...state().settings,
    bankInstructions: 'DEMO · nuevas instrucciones ficticias',
    notificationTemplates: {
      ORDER_CREATED: 'Nuevo aviso para {pedido}: {mensaje}',
    },
  });
  const next = order();
  assert.equal(get(old.id).bankInstructionsSnapshot, instructions);
  assert.equal(
    get(next.id).bankInstructionsSnapshot,
    'DEMO · nuevas instrucciones ficticias',
  );
  assert.ok(
    state()
      .notifications.find((n) => n.title === next.orderNumber)!
      .message.startsWith('Nuevo aviso'),
  );
});
test('políticas de reintento y cancelación se aplican en servicios', () => {
  const o = order('PAYPHONE');
  operations.payphone(o.id, 'FAILURE', 'policy-failure');
  operations.saveSettings({
    ...state().settings,
    allowPaymentRetry: false,
    allowCustomerCancel: false,
  });
  assert.throws(
    () => MockPaymentProvider.createAttempt(o.id, o.totalCents!),
    /deshabilitado/,
  );
  staffIdentity.setState({ userId: null });
  assert.throws(
    () => operations.cancel(o.id, 'Solicitud de cliente', get(o.id).version!),
    /deshabilitada/,
  );
});
test('un vendedor sin capacidad de reclamar no recibe la cola pagada', () => {
  const o = order();
  approve(o.id);
  const user = state().users.find((u) => u.id === otherId)!;
  operations.saveSeller({ ...user, permissions: ['analytics.own'] });
  const updated = state().users.find((u) => u.id === otherId)!;
  assert.equal(
    visibleOrders(state(), updated).some((it) => it.id === o.id),
    false,
  );
});
