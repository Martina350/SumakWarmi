import { createStore, storageWarnings } from '../lib/createStore.ts';
import {
  ALL_INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_SHIPMENTS,
} from '../data/index.ts';
import type {
  Product,
  Category,
  User,
  Order,
  Payment,
  Shipment,
  AuditLog,
  StockReservation,
  InventoryMovement,
  NotificationItem,
} from '../types/index.ts';

export const CAPABILITIES = [
  'catalog.write',
  'inventory.adjust',
  'orders.assign',
  'orders.claim',
  'orders.prepare',
  'payments.review',
  'payments.approve',
  'shipping.dispatch',
  'analytics.global',
  'analytics.own',
  'users.manage',
  'settings.manage',
] as const;
export const sellerDefaults = [
  'orders.claim',
  'orders.prepare',
  'shipping.dispatch',
  'analytics.own',
];
export interface Settings {
  allowCustomerCancel?: boolean;
  allowPaymentRetry?: boolean;
  notificationTemplates?: Record<string, string>;
  businessName: string;
  bankInstructions: string;
  transferEnabled: boolean;
  payphoneEnabled: boolean;
  reservationHours: number;
  freezeReview: boolean;
  lowStock: number;
  shippingZones: { name: string; priceCents: number }[];
  locale: string;
  currency: string;
  timezone: string;
}
export interface BusinessState {
  schemaVersion: number;
  products: Product[];
  categories: Category[];
  users: User[];
  orders: Order[];
  payments: Payment[];
  shipments: Shipment[];
  auditLogs: AuditLog[];
  reservations: StockReservation[];
  movements: InventoryMovement[];
  notifications: NotificationItem[];
  operations: Record<string, { entityId: string; actorId: string }>;
  settings: Settings;
  migrationNotice?: string;
}
export const cents = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100);
export const dollars = (value: number) => value / 100;
export const available = (variant: Product['variants'][number]) =>
  Math.max(0, variant.stockActual - variant.stockReservado);
const now = () => new Date().toISOString();

export function makeInitialState(): BusinessState {
  const users: User[] = structuredClone(INITIAL_USERS).map((u) => ({
    ...u,
    permissions:
      u.role === 'ADMIN'
        ? [...CAPABILITIES]
        : u.role === 'SELLER'
          ? [
              ...sellerDefaults,
              ...(u.id === 'usr-seller-andrea'
                ? ['payments.review', 'payments.approve']
                : []),
            ]
          : [],
  }));
  users.push({
    id: 'usr-seller-lucia',
    name: 'Lucía Demo',
    email: 'lucia.ventas@sumakwarmi.ec',
    phone: '0990000000',
    role: 'SELLER',
    isActive: true,
    permissions: [...sellerDefaults],
    createdAt: now(),
  });
  users.push({
    id: 'usr-customer-demo',
    name: 'Cliente de prueba',
    email: 'cliente.demo@example.com',
    phone: '0990000001',
    role: 'CUSTOMER',
    isActive: true,
    addresses: [],
    createdAt: now(),
  });
  const result: BusinessState = {
    schemaVersion: 3,
    products: structuredClone(ALL_INITIAL_PRODUCTS),
    categories: structuredClone(INITIAL_CATEGORIES),
    users,
    orders: structuredClone(INITIAL_ORDERS),
    payments: structuredClone(INITIAL_PAYMENTS),
    shipments: structuredClone(INITIAL_SHIPMENTS),
    reservations: [],
    movements: [],
    auditLogs: [],
    notifications: [],
    operations: {},
    settings: {
      allowCustomerCancel: true,
      allowPaymentRetry: true,
      notificationTemplates: {
        ORDER_CREATED: '{pedido}: recibimos tu pedido. {mensaje}',
        PAYMENT_APPROVE:
          '{pedido}: pago aprobado en la demostración. {mensaje}',
        PAYMENT_REQUIRE_CORRECTION:
          '{pedido}: necesitamos corregir el comprobante. {mensaje}',
        SHIPMENT_DISPATCH: '{pedido}: despacho simulado registrado. {mensaje}',
        SHIPMENT_DELIVERED: '{pedido}: entrega simulada confirmada. {mensaje}',
      },
      businessName: 'SUMAKWARMI',
      bankInstructions:
        'DEMO · Banco de prueba · Cuenta ficticia 0000000000 · SUMAKWARMI. No realizar depósitos reales.',
      transferEnabled: true,
      payphoneEnabled: true,
      reservationHours: 24,
      freezeReview: true,
      lowStock: 5,
      shippingZones: [
        { name: 'Pichincha', priceCents: 350 },
        { name: 'Otras provincias', priceCents: 450 },
      ],
      locale: 'es-EC',
      currency: 'USD',
      timezone: 'America/Guayaquil',
    },
  };
  addDemoScenarios(result);
  return result;
}

function addDemoScenarios(s: BusinessState) {
  const demoProduct: Product = {
    id: 'prod-training-demo',
    name: 'Artículo ficticio de autocuidado DEMO',
    slug: 'articulo-autocuidado-demo',
    categoryId: s.categories[0].id,
    categoryName: s.categories[0].name,
    summary:
      'Artículo ficticio para recorrer escenarios de operación. Sin especificaciones comerciales reales.',
    description: 'Solo demostración funcional.',
    status: 'ACTIVE',
    priceSource: 'mock',
    variants: [
      {
        id: 'sku-training-demo',
        sku: 'DEMO-TRAINING-001',
        name: 'Presentación demo',
        price: 6.75,
        stockActual: 30,
        stockReservado: 0,
        stockMinimo: 5,
      },
    ],
  };
  s.products.push(demoProduct);
  for (const status of ['DRAFT', 'ARCHIVED'] as const)
    s.products.push({
      ...structuredClone(demoProduct),
      id: `prod-demo-${status}`,
      name: `Ficha ficticia ${status === 'DRAFT' ? 'en borrador' : 'archivada'}`,
      slug: `ficha-demo-${status.toLowerCase()}`,
      status,
      variants: [
        {
          ...structuredClone(demoProduct.variants[0]),
          id: `sku-demo-${status}`,
          sku: `DEMO-${status}`,
          stockActual: 0,
        },
      ],
    });
  const scenarios = [
    'AWAITING_PROOF',
    'PROOF_SUBMITTED',
    'ACTION_REQUIRED',
    'APPROVED',
    'PAYPHONE_FAILED',
    'READY',
    'TRANSIT',
    'DELIVERED',
    'DELIVERY_FAILED',
  ];
  scenarios.forEach((scenario, index) => {
    const date = new Date(Date.now() - (index + 1) * 3600000).toISOString();
    const paid = [
      'APPROVED',
      'READY',
      'TRANSIT',
      'DELIVERED',
      'DELIVERY_FAILED',
    ].includes(scenario);
    const shipped = ['TRANSIT', 'DELIVERED', 'DELIVERY_FAILED'].includes(
      scenario,
    );
    const orderId = `ord-scenario-${scenario}`;
    const paymentStatus: Order['paymentStatus'] = paid
      ? 'APPROVED'
      : scenario === 'PROOF_SUBMITTED'
        ? 'PENDING_VERIFICATION'
        : scenario === 'ACTION_REQUIRED'
          ? 'REQUIRES_CORRECTION'
          : scenario === 'PAYPHONE_FAILED'
            ? 'FAILED'
            : 'PENDING';
    const shipmentStatus: Order['shipmentStatus'] =
      scenario === 'TRANSIT'
        ? 'IN_TRANSIT'
        : scenario === 'DELIVERED'
          ? 'DELIVERED'
          : scenario === 'DELIVERY_FAILED'
            ? 'DELIVERY_FAILED'
            : scenario === 'READY'
              ? 'PREPARING'
              : 'NOT_CREATED';
    const o: Order = {
      id: orderId,
      orderNumber: `SW-${String(201 + index).padStart(6, '0')}`,
      customerId: 'usr-customer-demo',
      customerName: 'Cliente de prueba',
      customerEmail: 'cliente.demo@example.com',
      customerPhone: '0990000001',
      items: [
        {
          productId: demoProduct.id,
          variantId: 'sku-training-demo',
          productName: demoProduct.name,
          variantName: 'Presentación demo',
          sku: 'DEMO-TRAINING-001',
          unitPrice: 6.75,
          quantity: 1,
          subtotal: 6.75,
        },
      ],
      subtotal: 6.75,
      shippingCost: 3.5,
      total: 10.25,
      subtotalCents: 675,
      shippingCents: 350,
      totalCents: 1025,
      status:
        scenario === 'DELIVERED'
          ? 'COMPLETED'
          : shipped
            ? 'DISPATCHED'
            : scenario === 'READY'
              ? 'READY_FOR_SHIPMENT'
              : paid
                ? 'CONFIRMED'
                : 'PAYMENT_PENDING',
      paymentStatus,
      shipmentStatus,
      paymentMethod: scenario === 'PAYPHONE_FAILED' ? 'PAYPHONE' : 'TRANSFER',
      shippingAddressSnapshot: {
        id: 'address-demo',
        recipientName: 'Cliente de prueba',
        phone: '0990000001',
        country: 'Ecuador',
        province: 'Pichincha',
        city: 'Quito',
        mainStreet: 'Calle ficticia DEMO 001',
        reference: 'Dirección de prueba sin validez',
        isDefault: true,
      },
      bankInstructionsSnapshot: s.settings.bankInstructions,
      createdAt: date,
      updatedAt: date,
      version: 1,
      assignedSellerId:
        paid && scenario !== 'APPROVED' ? 'usr-seller-andrea' : undefined,
      assignedSellerName:
        paid && scenario !== 'APPROVED' ? 'Andrea Morales' : undefined,
      salesAttributionSellerId:
        paid && scenario !== 'APPROVED' ? 'usr-seller-andrea' : undefined,
      paymentApprovedAt: paid ? date : undefined,
      packed: scenario === 'READY' || shipped,
      preparedItems:
        scenario === 'READY' || shipped ? { 'sku-training-demo': 1 } : {},
      incident:
        scenario === 'DELIVERY_FAILED'
          ? 'Entrega fallida de demostración: destinatario ficticio ausente'
          : undefined,
      history: [
        {
          id: `${orderId}-created`,
          orderId,
          eventType: 'ORDER_CREATED',
          previousStatus: 'CREATED',
          newStatus: 'PAYMENT_PENDING',
          createdAt: date,
          actor: 'Cliente de prueba',
          origin: 'CUSTOMER',
          comment: 'Pedido ficticio creado para escenario de demostración',
          isPublic: true,
        },
      ],
    };
    if (paid)
      o.history.push({
        id: `${orderId}-paid`,
        orderId,
        eventType: 'PAYMENT_APPROVED',
        previousStatus: 'PAYMENT_PENDING',
        newStatus: 'CONFIRMED',
        createdAt: date,
        actor: 'Equipo DEMO',
        origin: 'ADMIN',
        comment: 'Pago confirmado de manera simulada',
        isPublic: true,
      });
    if (scenario === 'READY' || shipped)
      o.history.push({
        id: `${orderId}-prepared`,
        orderId,
        eventType: 'PREPARATION_COMPLETED',
        previousStatus: 'CONFIRMED',
        newStatus: 'READY_FOR_SHIPMENT',
        createdAt: date,
        actor: 'Andrea Morales',
        origin: 'SELLER',
        comment: 'Preparación ficticia completada',
        isPublic: true,
      });
    if (shipped)
      o.history.push({
        id: `${orderId}-shipped`,
        orderId,
        eventType: `SHIPMENT_${shipmentStatus}`,
        previousStatus: 'READY_FOR_SHIPMENT',
        newStatus: o.status,
        createdAt: date,
        actor: 'Andrea Morales',
        origin: 'SELLER',
        comment: `Evento logístico DEMO: ${shipmentStatus}`,
        isPublic: true,
      });
    const p: Payment = {
      id: `payment-${scenario}`,
      orderId,
      amount: 10.25,
      amountCents: 1025,
      method: o.paymentMethod,
      status: paymentStatus,
      createdAt: date,
      updatedAt: date,
      resolvedAt: paid || scenario === 'PAYPHONE_FAILED' ? date : undefined,
      history: [
        {
          id: `payhist-${scenario}`,
          paymentId: `payment-${scenario}`,
          previousStatus: 'PENDING',
          newStatus: paymentStatus,
          actor: 'Sistema DEMO',
          comment: `Escenario ficticio: ${scenario}`,
          createdAt: date,
        },
      ],
    };
    if (['PROOF_SUBMITTED', 'ACTION_REQUIRED'].includes(scenario)) {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340"><rect width="600" height="340" fill="#fff7f9"/><text x="40" y="70" font-size="28" fill="#a91e50">COMPROBANTE FICTICIO DEMO</text><text x="40" y="135" font-size="24">USD 10.25 - Solo prueba</text><text x="40" y="200" font-size="20">Sin validez bancaria</text><text x="40" y="270" font-size="18">Cliente de prueba - SUMAKWARMI</text></svg>';
      p.proof = {
        id: `evidence-${scenario}`,
        orderId,
        paymentId: p.id,
        fileName: 'comprobante-ficticio-DEMO.svg',
        fileSize: svg.length,
        fileUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        uploadedAt: date,
      };
      if (scenario === 'ACTION_REQUIRED')
        p.reason = 'Solicitamos una imagen de prueba con referencia legible.';
    }
    s.orders.push(o);
    s.payments.push(p);
    if (shipped)
      s.shipments.push({
        id: `shipment-${scenario}`,
        orderId,
        carrier: 'Servientrega',
        trackingNumber: `DEMO-SCENARIO-${index}`,
        status: shipmentStatus,
        cost: 3.5,
        dispatchedAt: date,
        deliveredAt: scenario === 'DELIVERED' ? date : undefined,
        createdAt: date,
        updatedAt: date,
        history: [
          {
            id: `shiphist-${scenario}`,
            shipmentId: `shipment-${scenario}`,
            previousStatus: 'PREPARING',
            newStatus: shipmentStatus,
            actor: 'Sistema DEMO',
            comment: 'Evento ficticio de escenario',
            createdAt: date,
          },
        ],
      });
  });
}

function readLegacy(key: string) {
  try {
    return typeof window === 'undefined' || typeof localStorage === 'undefined'
      ? null
      : JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    storageWarnings.push(
      `No se pudo leer ${key}; el original no fue eliminado. Descarga un respaldo antes de restablecer.`,
    );
    return null;
  }
}
export function normalizeState(source: BusinessState): BusinessState {
  const state = structuredClone(source);
  state.products.forEach((p) => {
    p.version ??= 1;
    p.updatedAt ??= now();
    const seed = ALL_INITIAL_PRODUCTS.find((init) => init.id === p.id);
    if (seed?.featuredImage && !p.featuredImage) {
      p.featuredImage = seed.featuredImage;
    }
    if (seed?.galleryImages && (!p.galleryImages || p.galleryImages.length === 0)) {
      p.galleryImages = seed.galleryImages;
    }
    p.variants.forEach((v) => {
      v.stockReservado = 0;
      v.active ??= true;
    });
  });
  state.categories.forEach((c, i) => {
    c.isActive ??= true;
    c.isVisible ??= true;
    c.displayOrder ??= i;
    c.updatedAt ??= now();
    c.createdAt ??= now();
  });
  state.users.forEach((u) => {
    u.permissions ??=
      u.role === 'ADMIN'
        ? [...CAPABILITIES]
        : u.role === 'SELLER'
          ? [
              ...sellerDefaults,
              ...(u.id === 'usr-seller-andrea'
                ? ['payments.review', 'payments.approve']
                : []),
            ]
          : [];
  });
  state.orders.forEach((o) => {
    o.version ??= 1;
    o.totalCents ??= cents(o.total);
    o.subtotalCents ??= cents(o.subtotal);
    o.shippingCents ??= cents(o.shippingCost);
    o.bankInstructionsSnapshot ??= state.settings.bankInstructions;
    if (o.paymentStatus === 'APPROVED') {
      o.paymentApprovedAt ??= o.updatedAt;
      o.salesAttributionSellerId ??= o.assignedSellerId;
    }
    // Historic dispatched stock is the imported physical stock; do not deduct it again.
    if (
      ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED'].includes(
        o.shipmentStatus,
      )
    )
      return;
    if (['CANCELLED', 'EXPIRED', 'COMPLETED'].includes(o.status)) return;
    for (const item of o.items) {
      const v = state.products
        .flatMap((p) => p.variants)
        .find((v) => v.id === item.variantId);
      if (!v || available(v) < item.quantity) {
        o.incident = 'Revisar inventario de pedido importado';
        o.status = 'ON_HOLD';
        continue;
      }
      let r = state.reservations.find(
        (r) =>
          r.orderId === o.id &&
          r.variantId === v.id &&
          ['HELD', 'COMMITTED', 'ACTIVE'].includes(r.status),
      );
      if (!r) {
        r = {
          id: `migration:${o.id}:${v.id}`,
          orderId: o.id,
          variantId: v.id,
          quantity: item.quantity,
          status: o.paymentStatus === 'APPROVED' ? 'COMMITTED' : 'HELD',
          expiresAt: new Date(
            Date.now() + state.settings.reservationHours * 3600000,
          ).toISOString(),
          createdAt: now(),
        };
        state.reservations.push(r);
      }
      v.stockReservado += r.quantity;
    }
  });
  state.shipments.forEach((s) => {
    if (s.trackingNumber && !s.trackingNumber.startsWith('DEMO-'))
      s.trackingNumber = `DEMO-${s.trackingNumber}`;
  });
  return state;
}

function bootstrap() {
  const existing = readLegacy('sumakwarmi_business_v3');
  if (existing) {
    if (existing.schemaVersion !== 3)
      throw new Error(
        'Versión de datos no compatible. Exporta los datos antes de restablecer.',
      );
    return normalizeState(existing as BusinessState);
  }
  const initial = makeInitialState();
  const catalog = readLegacy('sumakwarmi_catalog_v1');
  const order = readLegacy('sumakwarmi_orders_v1');
  const session = readLegacy('sumakwarmi_session_v1');
  if (catalog) {
    initial.products = catalog.products;
    initial.categories = catalog.categories;
  }
  if (order) {
    initial.orders = order.orders;
    initial.payments = order.payments;
    initial.shipments = order.shipments;
    initial.auditLogs = order.auditLogs || [];
  }
  if (session?.users)
    initial.users = [
      ...session.users,
      ...initial.users.filter(
        (u) => !session.users.some((s: User) => s.id === u.id),
      ),
    ];
  if (catalog || order || session)
    initial.migrationNotice =
      'Datos anteriores incorporados al esquema 3. Se conservaron IDs e históricos; revisa las incidencias de inventario importado.';
  return normalizeState(initial);
}
export const businessStore = createStore<BusinessState>(
  bootstrap(),
  'sumakwarmi_business_v3',
);
export const useBusinessStore = businessStore.useStore;
