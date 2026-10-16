import {
  businessStore,
  makeInitialState,
  normalizeState,
  available,
  cents,
  dollars,
  CAPABILITIES,
  sellerDefaults,
  type BusinessState,
  type Settings,
} from './businessStore.ts';
import { staffIdentity } from '../../entities/session/model/staffIdentity.ts';
import { customerIdentity } from '../../entities/session/model/customerIdentity.ts';
import { generateId } from '../lib/id.ts';
import type {
  User,
  Order,
  Product,
  Category,
  Address,
  Payment,
  PaymentStatus,
  ShipmentStatus,
} from '../types/index.ts';

export function can(user: User | null | undefined, permission: string) {
  return (
    !!user?.isActive &&
    (user.role === 'ADMIN' || (user.permissions || []).includes(permission))
  );
}
export function staff(state = businessStore.getState()) {
  return (
    state.users.find(
      (u) =>
        u.id === staffIdentity.getState().userId &&
        u.isActive &&
        u.role !== 'CUSTOMER',
    ) ?? null
  );
}
function authorize(
  state: BusinessState,
  permission: string,
  order?: Order,
  shared = false,
) {
  const user = staff(state);
  if (!can(user, permission))
    throw new Error('Tu cuenta no tiene permiso para esta operación.');
  if (
    order &&
    user!.role !== 'ADMIN' &&
    order.assignedSellerId !== user!.id &&
    !(shared && !order.assignedSellerId)
  )
    throw new Error('Este pedido corresponde a otro vendedor.');
  return user!;
}
function customer(state: BusinessState, order?: Order) {
  const user = state.users.find(
    (u) =>
      u.id === customerIdentity.getState().userId &&
      u.role === 'CUSTOMER' &&
      u.isActive,
  );
  if (!user || (order && order.customerId !== user.id))
    throw new Error('Inicia sesión con la cuenta de cliente de este pedido.');
  return user;
}
export function visibleOrders(state: BusinessState, user: User) {
  return state.orders.filter(
    (o) =>
      user.role === 'ADMIN' ||
      o.assignedSellerId === user.id ||
      (!o.assignedSellerId &&
        ((o.paymentStatus === 'APPROVED' && can(user, 'orders.claim')) ||
          (can(user, 'payments.review') &&
            o.paymentMethod === 'TRANSFER' &&
            [
              'PENDING_VERIFICATION',
              'UNDER_REVIEW',
              'REQUIRES_CORRECTION',
            ].includes(o.paymentStatus)))),
  );
}
const now = () => new Date().toISOString();
function checkVersion(order: Order, version?: number) {
  if (version !== undefined && version !== order.version)
    throw new Error('Este pedido fue actualizado. Recarga su información.');
}
function needReason(reason: string) {
  if (!reason.trim()) throw new Error('Escribe un motivo para continuar.');
}
function target(state: BusinessState, id: string) {
  const o = state.orders.find((o) => o.id === id);
  if (!o) throw new Error('Pedido no encontrado.');
  return o;
}
function variant(state: BusinessState, id: string) {
  const v = state.products.flatMap((p) => p.variants).find((v) => v.id === id);
  if (!v) throw new Error('SKU no encontrado.');
  return v;
}

function audit(
  s: BusinessState,
  user: User,
  action: string,
  entityId: string,
  reason: string,
  before: unknown,
  after: unknown,
  operationId: string,
  entityType:
    | 'ORDER'
    | 'PRODUCT'
    | 'CATEGORY'
    | 'USER'
    | 'SETTINGS'
    | 'INVENTORY' = 'ORDER',
) {
  s.auditLogs.unshift({
    id: generateId('audit'),
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action,
    entityType,
    entityId,
    details: reason,
    previous: structuredClone(before),
    next: structuredClone(after),
    operationId,
    createdAt: now(),
  });
}
function event(
  s: BusinessState,
  o: Order,
  user: User,
  action: string,
  reason: string,
  previousStatus = o.status,
  isPublic = true,
) {
  o.version = (o.version || 0) + 1;
  o.updatedAt = now();
  o.history.push({
    id: generateId('event'),
    orderId: o.id,
    eventType: action,
    previousStatus,
    newStatus: o.status,
    actor: user.name,
    origin: user.role,
    comment: reason,
    isPublic,
    createdAt: now(),
  });
  if (isPublic)
    s.notifications.unshift({
      id: generateId('notice'),
      title: o.orderNumber,
      message: (s.settings.notificationTemplates?.[action] || '{mensaje}')
        .replaceAll('{pedido}', o.orderNumber)
        .replaceAll('{mensaje}', reason),
      type: 'INFO',
      targetUserId: o.customerId,
      targetRole: 'CUSTOMER',
      read: false,
      createdAt: now(),
    });
}
function transaction<T>(operation: (draft: BusinessState) => T): T {
  const draft = structuredClone(businessStore.getState());
  const result = operation(draft);
  businessStore.setState(draft);
  return result;
}
function move(
  s: BusinessState,
  v: ReturnType<typeof variant>,
  qty: number,
  type:
    | 'ORDER_RESERVED'
    | 'ORDER_CONSUMED'
    | 'ORDER_RELEASED'
    | 'MANUAL_ADJUSTMENT',
  user: User,
  reason: string,
) {
  s.movements.unshift({
    id: generateId('movement'),
    variantId: v.id,
    sku: v.sku,
    productName:
      s.products.find((p) => p.variants.some((it) => it.id === v.id))?.name ||
      v.name,
    type,
    quantityDelta: qty,
    resultingStock: v.stockActual,
    actor: user.name,
    reason,
    createdAt: now(),
  });
}
function release(s: BusinessState, o: Order, user: User, expired = false) {
  s.reservations
    .filter(
      (r) =>
        r.orderId === o.id &&
        ['HELD', 'COMMITTED', 'ACTIVE'].includes(r.status),
    )
    .forEach((r) => {
      const v = variant(s, r.variantId);
      v.stockReservado -= r.quantity;
      r.status = expired ? 'EXPIRED' : 'RELEASED';
      move(s, v, r.quantity, 'ORDER_RELEASED', user, o.orderNumber);
    });
}
function commit(s: BusinessState, o: Order) {
  if (
    o.items.some(
      (item) =>
        !s.reservations.some(
          (r) =>
            r.orderId === o.id &&
            r.variantId === item.variantId &&
            ['HELD', 'COMMITTED', 'ACTIVE'].includes(r.status),
        ),
    )
  )
    throw new Error(
      'La reserva ya no está vigente. Revisa existencias antes de confirmar el pago.',
    );
  s.reservations
    .filter((r) => r.orderId === o.id && ['HELD', 'ACTIVE'].includes(r.status))
    .forEach((r) => (r.status = 'COMMITTED'));
  o.paymentStatus = 'APPROVED';
  o.status = 'CONFIRMED';
  o.paymentApprovedAt = now();
  o.salesAttributionSellerId ??= o.assignedSellerId;
}
function updatePayment(
  p: Payment,
  status: PaymentStatus,
  user: User,
  reason: string,
) {
  p.history.push({
    id: generateId('pay-event'),
    paymentId: p.id,
    previousStatus: p.status,
    newStatus: status,
    actor: user.name,
    comment: reason,
    createdAt: now(),
  });
  p.status = status;
  p.reason = reason;
  p.updatedAt = now();
  if (
    ['APPROVED', 'REJECTED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(status)
  )
    p.resolvedAt = now();
}

export function shippingCents(
  province: string,
  settings = businessStore.getState().settings,
) {
  return (
    (
      settings.shippingZones.find(
        (z) => z.name.toLowerCase() === province.trim().toLowerCase(),
      ) || settings.shippingZones.at(-1)
    )?.priceCents ?? 0
  );
}
export const operations = {
  createOrder(params: {
    items: {
      productId: string;
      variantId: string;
      quantity: number;
      unitPrice: number;
    }[];
    shippingAddress: Address;
    paymentMethod: 'TRANSFER' | 'PAYPHONE';
    operationId: string;
  }) {
    operations.expireReservations();
    return transaction((s) => {
      const user = customer(s);
      const prior = s.operations[params.operationId];
      if (prior) {
        if (prior.actorId !== user.id)
          throw new Error('Operación no autorizada.');
        return target(s, prior.entityId);
      }
      if (
        !params.items.length ||
        !params.shippingAddress.city.trim() ||
        !params.shippingAddress.province.trim() ||
        !params.shippingAddress.mainStreet.trim() ||
        !params.shippingAddress.recipientName.trim() ||
        !params.shippingAddress.phone.trim()
      )
        throw new Error('Completa la dirección y los datos del destinatario.');
      if (
        (params.paymentMethod === 'TRANSFER' && !s.settings.transferEnabled) ||
        (params.paymentMethod === 'PAYPHONE' && !s.settings.payphoneEnabled)
      )
        throw new Error('Este método de pago está deshabilitado.');
      const aggregated = new Map<string, (typeof params.items)[number]>();
      for (const it of params.items) {
        if (!Number.isSafeInteger(it.quantity) || it.quantity < 1)
          throw new Error('Cantidad inválida.');
        const old = aggregated.get(it.variantId);
        aggregated.set(it.variantId, {
          ...it,
          quantity: it.quantity + (old?.quantity || 0),
        });
      }
      const items = [...aggregated.values()].map((it) => {
        const p = s.products.find((p) => p.id === it.productId);
        const v = p?.variants.find((v) => v.id === it.variantId);
        if (
          !p ||
          !['ACTIVE', 'OUT_OF_STOCK'].includes(p.status) ||
          !v ||
          v.active === false ||
          v.price === null
        )
          throw new Error(
            'Uno de los productos ya no está disponible. Revisa tu carrito.',
          );
        if (cents(v.price) !== cents(it.unitPrice))
          throw new Error(
            'Cambió el precio de un producto. Actualiza el carrito y confirma el nuevo total.',
          );
        if (available(v) < it.quantity)
          throw new Error(
            `Stock insuficiente para ${p.name}: disponibles ${available(v)}.`,
          );
        return {
          productId: p.id,
          variantId: v.id,
          productName: p.name,
          variantName: v.name,
          sku: v.sku,
          quantity: it.quantity,
          unitPrice: v.price,
          subtotal: dollars(cents(v.price) * it.quantity),
          imageUrl: p.featuredImage,
        };
      });
      const subtotalCents = items.reduce(
        (sum, it) => sum + cents(it.unitPrice) * it.quantity,
        0,
      );
      const delivery = shippingCents(
        params.shippingAddress.province,
        s.settings,
      );
      const sequence =
        Math.max(
          100,
          ...s.orders.map((o) => Number(o.orderNumber.replace(/\D/g, '')) || 0),
        ) + 1;
      const o: Order = {
        id: generateId('ord'),
        orderNumber: `SW-${String(sequence).padStart(6, '0')}`,
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        items,
        subtotal: dollars(subtotalCents),
        shippingCost: dollars(delivery),
        total: dollars(subtotalCents + delivery),
        subtotalCents,
        shippingCents: delivery,
        totalCents: subtotalCents + delivery,
        status: 'PAYMENT_PENDING',
        paymentStatus: 'PENDING',
        shipmentStatus: 'NOT_CREATED',
        shippingAddressSnapshot: structuredClone(params.shippingAddress),
        paymentMethod: params.paymentMethod,
        bankInstructionsSnapshot: s.settings.bankInstructions,
        history: [],
        version: 0,
        createdAt: now(),
        updatedAt: now(),
      };
      s.orders.unshift(o);
      items.forEach((it) => {
        const v = variant(s, it.variantId);
        v.stockReservado += it.quantity;
        s.reservations.push({
          id: generateId('reservation'),
          orderId: o.id,
          variantId: it.variantId,
          quantity: it.quantity,
          status: 'HELD',
          createdAt: now(),
          expiresAt: new Date(
            Date.now() + s.settings.reservationHours * 3600000,
          ).toISOString(),
        });
        move(s, v, -it.quantity, 'ORDER_RESERVED', user, o.orderNumber);
      });
      s.payments.unshift({
        id: generateId('payment'),
        orderId: o.id,
        amount: o.total,
        amountCents: o.totalCents,
        method: o.paymentMethod,
        status: 'PENDING',
        history: [],
        createdAt: now(),
        updatedAt: now(),
      });
      event(
        s,
        o,
        user,
        'ORDER_CREATED',
        'Pedido recibido. Unidades reservadas temporalmente.',
      );
      audit(
        s,
        user,
        'ORDER_CREATED',
        o.id,
        'Checkout confirmado',
        null,
        o,
        params.operationId,
      );
      s.operations[params.operationId] = { entityId: o.id, actorId: user.id };
      return o;
    });
  },
  uploadProof(
    orderId: string,
    evidence: { fileName: string; fileSize: number; fileUrl: string },
  ) {
    operations.expireReservations();
    return transaction((s) => {
      const o = target(s, orderId);
      const user = customer(s, o);
      if (
        s.settings.allowPaymentRetry === false &&
        o.paymentStatus === 'REJECTED'
      )
        throw new Error('El reintento está deshabilitado. Contacta al equipo.');
      if (
        o.paymentMethod !== 'TRANSFER' ||
        !['PAYMENT_PENDING', 'ON_HOLD'].includes(o.status) ||
        !['PENDING', 'REQUIRES_CORRECTION', 'REJECTED'].includes(
          o.paymentStatus,
        )
      )
        throw new Error('Este pedido no permite adjuntar otro comprobante.');
      if (
        !evidence.fileUrl ||
        evidence.fileSize <= 0 ||
        evidence.fileSize > 750000 ||
        !/^data:(image\/(png|jpeg|webp)|application\/pdf);base64,/.test(
          evidence.fileUrl,
        )
      )
        throw new Error(
          'Adjunta JPG, PNG, WebP o PDF ficticio de hasta 750 KB.',
        );
      if (
        s.reservations
          .filter((r) => r.orderId === o.id)
          .every((r) => !['HELD', 'COMMITTED'].includes(r.status))
      )
        throw new Error(
          'La reserva venció. Contacta al equipo para revisar existencias.',
        );
      const p: Payment = {
        id: generateId('payment'),
        orderId,
        amount: o.total,
        amountCents: o.totalCents,
        method: 'TRANSFER',
        status: 'PENDING_VERIFICATION',
        history: [],
        createdAt: now(),
        updatedAt: now(),
      };
      p.proof = {
        ...evidence,
        id: generateId('proof'),
        paymentId: p.id,
        orderId,
        uploadedAt: now(),
      };
      const old = s.payments.find(
        (p) => p.orderId === orderId && p.status === 'PENDING',
      );
      if (old)
        updatePayment(
          old,
          'CANCELLED',
          user,
          'Sustituido por intento con evidencia',
        );
      s.payments.unshift(p);
      o.paymentStatus = 'PENDING_VERIFICATION';
      event(
        s,
        o,
        user,
        'PROOF_SUBMITTED',
        `Comprobante ficticio adjuntado: ${evidence.fileName}`,
      );
      audit(
        s,
        user,
        'PROOF_SUBMITTED',
        o.id,
        evidence.fileName,
        null,
        p,
        generateId('operation'),
      );
    });
  },
  review(
    orderId: string,
    paymentId: string,
    outcome: 'START' | 'APPROVE' | 'REQUIRE_CORRECTION' | 'REJECT',
    reason: string,
    version: number,
  ) {
    operations.expireReservations();
    return transaction((s) => {
      const o = target(s, orderId);
      const user = authorize(
        s,
        outcome === 'START' ? 'payments.review' : 'payments.approve',
        o,
        true,
      );
      const p = s.payments.find(
        (p) => p.id === paymentId && p.orderId === orderId,
      );
      const op = `${outcome}:${paymentId}`;
      if (s.operations[op]) {
        if (outcome === 'START' && s.operations[op].actorId !== user.id)
          throw new Error(
            'Otro integrante ya inició la revisión de este comprobante.',
          );
        return;
      }
      checkVersion(o, version);
      if (['CANCELLED', 'EXPIRED', 'COMPLETED', 'RETURNED'].includes(o.status))
        throw new Error(
          'Este pedido está cerrado y no admite revisión de pago.',
        );
      if (
        !p ||
        p.method !== 'TRANSFER' ||
        !p.proof ||
        !['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(p.status)
      )
        throw new Error('No hay un expediente de transferencia revisable.');
      if (p.reviewerId && p.reviewerId !== user.id && user.role !== 'ADMIN')
        throw new Error('Otro integrante está revisando este comprobante.');
      const before = structuredClone(o);
      if (outcome === 'START') {
        updatePayment(
          p,
          'UNDER_REVIEW',
          user,
          'Revisión manual simulada iniciada',
        );
        p.reviewerId = user.id;
        o.paymentStatus = 'UNDER_REVIEW';
      } else {
        needReason(reason);
        if (p.status !== 'UNDER_REVIEW')
          throw new Error(
            'Inicia la revisión antes de registrar una decisión.',
          );
        if (outcome === 'APPROVE') {
          if (!p.proof.fileUrl)
            throw new Error(
              'No existe archivo de evidencia consultable. Solicita una corrección.',
            );
          if (
            s.payments.some(
              (it) => it.orderId === orderId && it.status === 'APPROVED',
            )
          )
            throw new Error(
              'Ya existe un pago aprobado. Requiere conciliación de doble pago.',
            );
          commit(s, o);
          updatePayment(p, 'APPROVED', user, reason);
        } else {
          o.paymentStatus =
            outcome === 'REJECT' ? 'REJECTED' : 'REQUIRES_CORRECTION';
          updatePayment(p, o.paymentStatus, user, reason);
        }
        p.proof.verifiedAt = now();
        p.proof.verifiedBy = user.id;
        p.proof.verificationNotes = reason;
      }
      event(
        s,
        o,
        user,
        `PAYMENT_${outcome}`,
        outcome === 'START'
          ? 'Comprobante en revisión manual simulada.'
          : reason,
      );
      audit(s, user, `PAYMENT_${outcome}`, o.id, reason, before, o, op);
      s.operations[op] = { entityId: orderId, actorId: user.id };
    });
  },
  beginPayphone(orderId: string, amountCents: number) {
    operations.expireReservations();
    return transaction((s) => {
      const o = target(s, orderId);
      const user = customer(s, o);
      if (
        s.settings.allowPaymentRetry === false &&
        ['FAILED', 'CANCELLED'].includes(o.paymentStatus)
      )
        throw new Error('El reintento está deshabilitado. Contacta al equipo.');
      if (
        o.paymentMethod !== 'PAYPHONE' ||
        !s.settings.payphoneEnabled ||
        o.totalCents !== amountCents ||
        !['PAYMENT_PENDING', 'ON_HOLD'].includes(o.status)
      )
        throw new Error('No se puede iniciar este intento PayPhone.');
      const pending = s.payments.find(
        (p) => p.orderId === orderId && p.status === 'PROCESSING',
      );
      if (pending) return pending;
      const p: Payment = {
        id: generateId('attempt'),
        orderId,
        amount: o.total,
        amountCents,
        method: 'PAYPHONE',
        status: 'PROCESSING',
        history: [],
        createdAt: now(),
        updatedAt: now(),
      };
      s.payments.unshift(p);
      o.paymentStatus = 'PROCESSING';
      event(
        s,
        o,
        user,
        'PAYPHONE_STARTED',
        'Intento de pago simulado iniciado.',
      );
      return p;
    });
  },
  payphone(
    orderId: string,
    result: 'SUCCESS' | 'FAILURE' | 'CANCELLED',
    operationId: string,
    attemptId?: string,
  ) {
    operations.expireReservations();
    return transaction((s) => {
      const o = target(s, orderId);
      const user = customer(s, o);
      if (s.operations[operationId]) return;
      if (
        s.settings.allowPaymentRetry === false &&
        ['FAILED', 'CANCELLED'].includes(o.paymentStatus)
      )
        throw new Error('El reintento de pago está deshabilitado.');
      if (
        o.paymentMethod !== 'PAYPHONE' ||
        !['PAYMENT_PENDING', 'ON_HOLD'].includes(o.status)
      )
        throw new Error('Este pedido no admite un intento PayPhone.');
      if (
        o.paymentStatus === 'APPROVED' ||
        s.payments.some((p) => p.orderId === orderId && p.status === 'APPROVED')
      )
        throw new Error('El pedido ya tiene un pago aprobado.');
      const existing = attemptId
        ? s.payments.find(
            (p) =>
              p.id === attemptId &&
              p.orderId === orderId &&
              p.status === 'PROCESSING',
          )
        : undefined;
      if (attemptId && !existing)
        throw new Error('Intento ya resuelto o no encontrado.');
      const p: Payment = existing || {
        id: generateId('attempt'),
        orderId,
        amount: o.total,
        amountCents: o.totalCents,
        method: 'PAYPHONE',
        status: 'PROCESSING',
        history: [],
        createdAt: now(),
        updatedAt: now(),
      };
      const before = structuredClone(o);
      if (result === 'SUCCESS') commit(s, o);
      else o.paymentStatus = result === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
      updatePayment(
        p,
        result === 'SUCCESS'
          ? 'APPROVED'
          : result === 'CANCELLED'
            ? 'CANCELLED'
            : 'FAILED',
        user,
        `PayPhone DEMO: ${result}`,
      );
      s.payments
        .filter((p) => p.orderId === orderId && p.status === 'PENDING')
        .forEach((p) =>
          updatePayment(p, 'CANCELLED', user, 'Sustituido por intento mock'),
        );
      if (!existing) s.payments.unshift(p);
      event(
        s,
        o,
        user,
        'PAYPHONE_RESULT',
        `Resultado de pago simulado: ${result}`,
      );
      audit(
        s,
        user,
        'PAYPHONE_RESULT',
        orderId,
        result,
        before,
        o,
        operationId,
      );
      s.operations[operationId] = { entityId: orderId, actorId: user.id };
    });
  },
  assign(
    orderId: string,
    sellerId: string | null,
    reason: string,
    version: number,
  ) {
    return transaction((s) => {
      const o = target(s, orderId);
      const user = staff(s);
      if (!user) throw new Error('Inicia sesión.');
      authorize(s, user.role === 'ADMIN' ? 'orders.assign' : 'orders.claim');
      checkVersion(o, version);
      needReason(reason);
      if (
        user.role !== 'ADMIN' &&
        (sellerId !== user.id ||
          o.assignedSellerId ||
          o.paymentStatus !== 'APPROVED')
      )
        throw new Error(
          'Solo puedes tomar pedidos confirmados sin responsable.',
        );
      if (['COMPLETED', 'CANCELLED', 'EXPIRED', 'RETURNED'].includes(o.status))
        throw new Error('Este pedido ya está cerrado.');
      const seller = s.users.find(
        (u) => u.id === sellerId && u.role === 'SELLER' && u.isActive,
      );
      if (sellerId && !seller)
        throw new Error('Selecciona un vendedor activo.');
      const before = structuredClone(o);
      o.assignedSellerId = seller?.id;
      o.assignedSellerName = seller?.name;
      if (o.paymentStatus === 'APPROVED')
        o.salesAttributionSellerId ??= seller?.id;
      event(
        s,
        o,
        user,
        'SELLER_ASSIGNED',
        `${reason} · ${seller?.name || 'Sin responsable'}`,
        o.status,
        false,
      );
      audit(
        s,
        user,
        'SELLER_ASSIGNED',
        orderId,
        reason,
        before,
        o,
        generateId('operation'),
      );
    });
  },
  prepare(
    orderId: string,
    preparedItems: Record<string, number>,
    packed: boolean,
    complete: boolean,
    version: number,
  ) {
    return transaction((s) => {
      const o = target(s, orderId);
      const user = authorize(s, 'orders.prepare', o);
      checkVersion(o, version);
      if (
        o.paymentStatus !== 'APPROVED' ||
        !o.assignedSellerId ||
        !['CONFIRMED', 'PROCESSING'].includes(o.status)
      )
        throw new Error(
          'Requiere pago aprobado, responsable y pedido confirmado/en preparación.',
        );
      const before = structuredClone(o);
      for (const item of o.items) {
        const qty = preparedItems[item.variantId] || 0;
        if (!Number.isInteger(qty) || qty < 0 || qty > item.quantity)
          throw new Error('Cantidad preparada inválida.');
      }
      if (
        complete &&
        (!packed ||
          o.items.some((it) => preparedItems[it.variantId] !== it.quantity))
      )
        throw new Error('Completa todas las cantidades y confirma el empaque.');
      o.preparedItems = preparedItems;
      o.packed = packed;
      o.status = complete ? 'READY_FOR_SHIPMENT' : 'PROCESSING';
      o.shipmentStatus = 'PREPARING';
      event(
        s,
        o,
        user,
        complete ? 'PREPARATION_COMPLETED' : 'PREPARATION_STARTED',
        complete
          ? 'Preparación completa. Listo para registrar guía.'
          : 'Pedido en preparación.',
        before.status,
      );
      audit(
        s,
        user,
        'PREPARATION',
        orderId,
        'Checklist de preparación',
        before,
        o,
        generateId('operation'),
      );
    });
  },
  registerShipment(
    orderId: string,
    code: string,
    reason: string,
    version: number,
  ) {
    return transaction((s) => {
      const o = target(s, orderId);
      const user = authorize(s, 'shipping.dispatch', o);
      checkVersion(o, version);
      needReason(reason);
      if (o.paymentStatus !== 'APPROVED' || o.status !== 'READY_FOR_SHIPMENT')
        throw new Error('Completa la preparación antes de registrar la guía.');
      if (!/^DEMO-[A-Z0-9-]{3,}$/i.test(code))
        throw new Error('Usa una guía ficticia con prefijo DEMO-.');
      if (
        s.shipments.some(
          (sh) => sh.trackingNumber === code && sh.orderId !== orderId,
        )
      )
        throw new Error('Esta guía ya corresponde a otro pedido.');
      const old = s.shipments.find((sh) => sh.orderId === orderId);
      const before = structuredClone(o);
      if (old) {
        old.trackingNumber = code;
        old.status = 'LABEL_REGISTERED';
        old.notes = reason;
        old.updatedAt = now();
      } else
        s.shipments.push({
          id: generateId('shipment'),
          orderId,
          carrier: 'Servientrega',
          trackingNumber: code,
          cost: o.shippingCost,
          status: 'LABEL_REGISTERED',
          notes: reason,
          history: [],
          createdAt: now(),
          updatedAt: now(),
        });
      o.shipmentStatus = 'LABEL_REGISTERED';
      event(
        s,
        o,
        user,
        'SHIPMENT_REGISTERED',
        `Guía ficticia ${code} registrada. Aún no se ha despachado.`,
      );
      audit(
        s,
        user,
        'SHIPMENT_REGISTERED',
        orderId,
        reason,
        before,
        o,
        generateId('operation'),
      );
    });
  },
  ship(
    orderId: string,
    action:
      | 'DISPATCH'
      | 'IN_TRANSIT'
      | 'DELIVERED'
      | 'DELIVERY_FAILED'
      | 'RETURNED',
    reason: string,
    version: number,
  ) {
    return transaction((s) => {
      const o = target(s, orderId);
      const user = authorize(s, 'shipping.dispatch', o);
      const op = `shipping:${orderId}:${action}`;
      if (
        s.operations[op] &&
        !['DELIVERY_FAILED', 'IN_TRANSIT'].includes(action)
      )
        return;
      checkVersion(o, version);
      needReason(reason);
      const before = structuredClone(o);
      const sh = s.shipments.find((sh) => sh.orderId === orderId);
      if (!sh) throw new Error('Registra una guía antes de continuar.');
      const previousShipment = sh.status;
      if (action === 'DISPATCH') {
        if (
          o.status !== 'READY_FOR_SHIPMENT' ||
          o.paymentStatus !== 'APPROVED' ||
          !o.packed ||
          sh.status !== 'LABEL_REGISTERED' ||
          o.items.some((it) => o.preparedItems?.[it.variantId] !== it.quantity)
        )
          throw new Error(
            'Revisa pago, preparación y guía antes de despachar.',
          );
        for (const it of o.items) {
          const r = s.reservations.find(
            (r) =>
              r.orderId === orderId &&
              r.variantId === it.variantId &&
              r.status === 'COMMITTED',
          );
          const v = variant(s, it.variantId);
          if (!r || v.stockActual < r.quantity || v.stockReservado < r.quantity)
            throw new Error('Reserva/stock insuficiente para despachar.');
          v.stockActual -= r.quantity;
          v.stockReservado -= r.quantity;
          r.status = 'CONSUMED';
          move(s, v, -r.quantity, 'ORDER_CONSUMED', user, o.orderNumber);
        }
        o.status = 'DISPATCHED';
        sh.status = 'HANDED_TO_CARRIER';
        sh.dispatchedAt = now();
      } else {
        const allowed: Record<string, string[]> = {
          IN_TRANSIT: ['HANDED_TO_CARRIER', 'DISPATCHED', 'DELIVERY_FAILED'],
          DELIVERED: ['IN_TRANSIT', 'HANDED_TO_CARRIER', 'DISPATCHED'],
          DELIVERY_FAILED: ['IN_TRANSIT', 'HANDED_TO_CARRIER', 'DISPATCHED'],
          RETURNED: ['DELIVERY_FAILED', 'RETURNING', 'INCIDENT'],
        };
        if (!allowed[action].includes(sh.status))
          throw new Error('Esta transición logística no está permitida.');
        sh.status = action;
        if (action === 'DELIVERED') {
          o.status = 'COMPLETED';
          sh.deliveredAt = now();
          o.incident = undefined;
        }
        if (action === 'DELIVERY_FAILED') o.incident = reason;
        if (action === 'IN_TRANSIT') o.incident = undefined;
        if (action === 'RETURNED') {
          o.status = 'RETURNED';
          o.incident = reason;
        }
      }
      sh.updatedAt = now();
      sh.history.push({
        id: generateId('ship-event'),
        shipmentId: sh.id,
        previousStatus: previousShipment,
        newStatus: sh.status,
        actor: user.name,
        comment: reason,
        createdAt: now(),
      });
      o.shipmentStatus = sh.status;
      event(
        s,
        o,
        user,
        `SHIPMENT_${action}`,
        `Logística DEMO: ${reason}`,
        before.status,
      );
      audit(s, user, `SHIPMENT_${action}`, orderId, reason, before, o, op);
      s.operations[op] = { entityId: orderId, actorId: user.id };
    });
  },
  addNote(orderId: string, note: string, version: number) {
    return transaction((s) => {
      const o = target(s, orderId);
      const user = staff(s);
      if (!user) throw new Error('Usuario no autenticado.');
      if (user.role !== 'ADMIN' && o.assignedSellerId !== user.id) {
        throw new Error('Solo el vendedor asignado o un administrador pueden agregar notas.');
      }
      checkVersion(o, version);
      needReason(note);
      event(s, o, user, 'INTERNAL_NOTE', note, o.status, false);
      audit(
        s,
        user,
        'INTERNAL_NOTE',
        orderId,
        note,
        null,
        o,
        generateId('operation'),
      );
    });
  },
  cancel(orderId: string, reason: string, version: number) {
    return transaction((s) => {
      const o = target(s, orderId);
      const currentCustomer = s.users.find(
        (u) => u.id === customerIdentity.getState().userId,
      );
      const user =
        staff(s)?.role === 'ADMIN'
          ? authorize(s, 'orders.assign')
          : customer(s, o);
      needReason(reason);
      if (s.operations[`cancel:${orderId}`]) return;
      checkVersion(o, version);
      if (
        ['DISPATCHED', 'COMPLETED', 'RETURNED'].includes(o.status) ||
        ['HANDED_TO_CARRIER', 'IN_TRANSIT', 'DELIVERED', 'DISPATCHED'].includes(
          o.shipmentStatus,
        )
      )
        throw new Error(
          'Ya hubo salida física. Debes gestionar una incidencia/devolución.',
        );
      if (user === currentCustomer && o.paymentStatus === 'APPROVED')
        throw new Error('Solicita al equipo una cancelación/reembolso.');
      if (user.role === 'CUSTOMER' && s.settings.allowCustomerCancel === false)
        throw new Error(
          'La cancelación directa está deshabilitada. Solicítala al equipo.',
        );
      const before = structuredClone(o);
      release(s, o, user);
      o.status = 'CANCELLED';
      if (o.paymentStatus === 'APPROVED') {
        o.paymentStatus = 'REFUND_PENDING';
        o.incident = 'Pendiente de reembolso simulado';
      }
      event(s, o, user, 'ORDER_CANCELLED', reason, before.status);
      audit(
        s,
        user,
        'ORDER_CANCELLED',
        orderId,
        reason,
        before,
        o,
        `cancel:${orderId}`,
      );
      s.operations[`cancel:${orderId}`] = {
        entityId: orderId,
        actorId: user.id,
      };
    });
  },
  refund(
    orderId: string,
    amountCents: number,
    reason: string,
    version: number,
  ) {
    return transaction((s) => {
      const user = authorize(s, 'orders.assign');
      const o = target(s, orderId);
      checkVersion(o, version);
      needReason(reason);
      if (
        !['CANCELLED', 'RETURNED', 'COMPLETED'].includes(o.status) ||
        !['APPROVED', 'REFUND_PENDING', 'PARTIALLY_REFUNDED'].includes(
          o.paymentStatus,
        )
      )
        throw new Error(
          'Resuelve la cancelación/devolución antes del reembolso demo.',
        );
      const remaining = o.totalCents! - (o.refundedCents || 0);
      if (
        !Number.isSafeInteger(amountCents) ||
        amountCents <= 0 ||
        amountCents > remaining
      )
        throw new Error('Importe de reembolso inválido.');
      const before = structuredClone(o);
      o.refundedCents = (o.refundedCents || 0) + amountCents;
      o.paymentStatus =
        o.refundedCents === o.totalCents ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
      const p = s.payments.find(
        (p) =>
          p.orderId === orderId &&
          ['APPROVED', 'PARTIALLY_REFUNDED'].includes(p.status),
      );
      if (p) updatePayment(p, o.paymentStatus, user, reason);
      event(
        s,
        o,
        user,
        'REFUND_RECORDED',
        `Reembolso ficticio: USD ${dollars(amountCents).toFixed(2)}. ${reason}`,
        before.status,
      );
      audit(
        s,
        user,
        'REFUND_RECORDED',
        orderId,
        reason,
        before,
        { amountCents, order: o },
        generateId('operation'),
      );
    });
  },
  expireReservations() {
    const current = businessStore.getState();
    if (
      !current.reservations.some(
        (r) => r.status === 'HELD' && Date.parse(r.expiresAt) < Date.now(),
      )
    )
      return;
    transaction((s) => {
      for (const o of s.orders) {
        if (
          o.paymentStatus === 'APPROVED' ||
          (s.settings.freezeReview &&
            ['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(o.paymentStatus))
        )
          continue;
        if (
          !s.reservations.some(
            (r) =>
              r.orderId === o.id &&
              r.status === 'HELD' &&
              Date.parse(r.expiresAt) < Date.now(),
          )
        )
          continue;
        const system: User = {
          id: 'system',
          name: 'Sistema DEMO',
          role: 'ADMIN',
          isActive: true,
          email: '',
          phone: '',
          createdAt: now(),
        };
        const before = structuredClone(o);
        release(s, o, system, true);
        o.status = 'EXPIRED';
        event(
          s,
          o,
          system,
          'RESERVATION_EXPIRED',
          'Reserva temporal vencida. Unidades liberadas.',
          before.status,
        );
        audit(
          s,
          system,
          'RESERVATION_EXPIRED',
          o.id,
          'Vencimiento configurado',
          before,
          o,
          `expire:${o.id}`,
        );
      }
    });
  },
  saveCategory(data: Category) {
    transaction((s) => {
      const user = authorize(s, 'catalog.write');
      const before = s.categories.find((c) => c.id === data.id);
      if (
        !data.name.trim() ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug) ||
        s.categories.some(
          (c) =>
            c.id !== data.id &&
            (c.slug === data.slug ||
              (c.name.toLowerCase() === data.name.toLowerCase() &&
                c.parentId === data.parentId)),
        )
      )
        throw new Error('Nombre/slug duplicado o inválido.');
      let parent = data.parentId;
      const seen = new Set([data.id]);
      while (parent) {
        if (seen.has(parent))
          throw new Error('La jerarquía no puede contener ciclos.');
        seen.add(parent);
        const p = s.categories.find((c) => c.id === parent);
        if (!p) throw new Error('Categoría padre inválida.');
        parent = p.parentId;
      }
      if (!Number.isInteger(data.displayOrder) || data.displayOrder! < 0)
        throw new Error('Orden inválido.');
      const saved = {
        ...data,
        createdAt: before?.createdAt || now(),
        updatedAt: now(),
      };
      s.categories = [saved, ...s.categories.filter((c) => c.id !== data.id)];
      s.products
        .filter((p) => p.categoryId === data.id)
        .forEach((p) => (p.categoryName = data.name));
      audit(
        s,
        user,
        'CATEGORY_SAVED',
        data.id,
        'Categoría guardada; no se borran dependencias',
        before,
        saved,
        generateId('operation'),
        'CATEGORY',
      );
    });
  },
  saveProduct(data: Product) {
    transaction((s) => {
      const user = authorize(s, 'catalog.write');
      const before = s.products.find((p) => p.id === data.id);
      if (before && data.version !== before.version)
        throw new Error(
          'Producto actualizado por otra operación. Vuelve a abrirlo.',
        );
      if (
        !data.name.trim() ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug) ||
        s.products.some((p) => p.id !== data.id && p.slug === data.slug)
      )
        throw new Error('Nombre/slug inválido o duplicado.');
      const cat = s.categories.find((c) => c.id === data.categoryId);
      if (!cat) throw new Error('Selecciona una categoría.');
      const skus = data.variants.map((v) => v.sku.trim().toUpperCase());
      if (
        !data.variants.length ||
        new Set(skus).size !== skus.length ||
        skus.some((sku) => !sku) ||
        s.products
          .filter((p) => p.id !== data.id)
          .some((p) =>
            p.variants.some((v) => skus.includes(v.sku.toUpperCase())),
          )
      )
        throw new Error('Debe existir al menos un SKU único por presentación.');
      for (const v of data.variants) {
        const old = before?.variants.find((it) => it.id === v.id);
        if (
          old &&
          (old.stockActual !== v.stockActual ||
            old.stockReservado !== v.stockReservado)
        )
          throw new Error(
            'Modifica existencias desde Inventario para conservar movimientos.',
          );
        if (
          !Number.isInteger(v.stockActual) ||
          v.stockActual < 0 ||
          !Number.isInteger(v.stockMinimo) ||
          v.stockMinimo < 0 ||
          (v.price !== null && (!Number.isFinite(v.price) || v.price < 0))
        )
          throw new Error('Precio o inventario inválido.');
        if (
          data.compareAtPrice !== undefined &&
          v.price !== null &&
          data.compareAtPrice < v.price
        )
          throw new Error(
            'El precio regular debe ser igual o mayor al precio de venta.',
          );
      }
      if (
        before?.variants.some(
          (v) =>
            v.stockReservado > 0 && !data.variants.some((it) => it.id === v.id),
        )
      )
        throw new Error(
          'No puedes eliminar un SKU reservado. Desactívalo para nuevas ventas.',
        );
      if (
        data.status === 'ACTIVE' &&
        (cat.isActive === false ||
          data.variants.some((v) => v.active !== false && v.price === null))
      )
        throw new Error(
          'Publicar requiere categoría activa y precios válidos. Sin imagen se usará un placeholder explícito.',
        );
      const combinations = data.variants.map((v) =>
        Object.keys(v.attributes || {}).length
          ? JSON.stringify(
              Object.entries(v.attributes!).sort(([a], [b]) =>
                a.localeCompare(b),
              ),
            )
          : v.name.trim().toLowerCase(),
      );
      if (new Set(combinations).size !== combinations.length)
        throw new Error('Las combinaciones de variantes deben ser únicas.');
      const saved = {
        ...data,
        categoryName: cat.name,
        variants: data.variants.map((v) => ({
          ...v,
          price: v.price === null ? null : dollars(cents(v.price)),
        })),
        version: (before?.version || 0) + 1,
        createdAt: before?.createdAt || now(),
        updatedAt: now(),
      };
      s.products = [saved, ...s.products.filter((p) => p.id !== data.id)];
      audit(
        s,
        user,
        'PRODUCT_SAVED',
        data.id,
        `Estado: ${data.status}`,
        before,
        saved,
        generateId('operation'),
        'PRODUCT',
      );
    });
  },
  adjustStock(
    variantId: string,
    delta: number,
    reason: string,
    reorderPoint?: number,
  ) {
    transaction((s) => {
      const user = authorize(s, 'inventory.adjust');
      needReason(reason);
      const v = variant(s, variantId);
      const before = structuredClone(v);
      if (
        !Number.isInteger(delta) ||
        v.stockActual + delta < v.stockReservado ||
        v.stockActual + delta < 0
      )
        throw new Error(
          'El ajuste debe ser entero y respetar las unidades comprometidas.',
        );
      if (
        reorderPoint !== undefined &&
        (!Number.isInteger(reorderPoint) || reorderPoint < 0)
      )
        throw new Error('Umbral inválido.');
      v.stockActual += delta;
      if (reorderPoint !== undefined) v.stockMinimo = reorderPoint;
      move(s, v, delta, 'MANUAL_ADJUSTMENT', user, reason);
      audit(
        s,
        user,
        'STOCK_ADJUSTED',
        variantId,
        reason,
        before,
        v,
        generateId('operation'),
        'INVENTORY',
      );
    });
  },
  saveSeller(
    data: Pick<
      User,
      'id' | 'name' | 'email' | 'phone' | 'isActive' | 'permissions'
    >,
    replacementId?: string,
  ) {
    transaction((s) => {
      const user = authorize(s, 'users.manage');
      const old = s.users.find((u) => u.id === data.id);
      if (
        !data.name.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
        s.users.some(
          (u) =>
            u.id !== data.id &&
            u.email.toLowerCase() === data.email.toLowerCase(),
        )
      )
        throw new Error('Nombre/correo inválido o correo duplicado.');
      if (old && old.role !== 'SELLER')
        throw new Error('Esta cuenta no es de ventas.');
      if (
        (data.permissions || []).some(
          (p) =>
            !sellerDefaults.includes(p) &&
            !['payments.review', 'payments.approve'].includes(p),
        )
      )
        throw new Error('Permisos de vendedor inválidos.');
      if (
        data.permissions?.includes('payments.approve') &&
        !data.permissions.includes('payments.review')
      )
        throw new Error(
          'Aprobar pagos requiere también permiso para revisar comprobantes.',
        );
      const replacement = s.users.find(
        (u) =>
          u.id === replacementId &&
          u.role === 'SELLER' &&
          u.isActive &&
          u.id !== data.id,
      );
      if (replacementId && !replacement) throw new Error('Reemplazo inválido.');
      if (!data.isActive)
        s.orders
          .filter(
            (o) =>
              o.assignedSellerId === data.id &&
              !['COMPLETED', 'CANCELLED', 'EXPIRED', 'RETURNED'].includes(
                o.status,
              ),
          )
          .forEach((o) => {
            const before = structuredClone(o);
            o.assignedSellerId = replacement?.id;
            o.assignedSellerName = replacement?.name;
            event(
              s,
              o,
              user,
              'SELLER_DEACTIVATED',
              'Responsable desactivado. Trabajo liberado/reasignado.',
              o.status,
              false,
            );
            audit(
              s,
              user,
              'SELLER_REASSIGNED',
              o.id,
              'Desactivación de vendedor',
              before,
              o,
              generateId('operation'),
            );
          });
      const saved: User = {
        ...old,
        ...data,
        email: data.email.toLowerCase(),
        role: 'SELLER',
        createdAt: old?.createdAt || now(),
      };
      s.users = [saved, ...s.users.filter((u) => u.id !== saved.id)];
      audit(
        s,
        user,
        'SELLER_SAVED',
        saved.id,
        saved.isActive
          ? 'Cuenta habilitada/actualizada'
          : 'Cuenta desactivada; trabajos resueltos',
        old,
        saved,
        generateId('operation'),
        'USER',
      );
    });
  },
  registerCustomer(
    name: string,
    email: string,
    phone: string,
    addresses: Address[] = [],
  ) {
    return transaction((s) => {
      if (
        !name.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        s.users.some((u) => u.email.toLowerCase() === email.toLowerCase())
      )
        throw new Error('Nombre/correo inválido o cuenta ya registrada.');
      const user: User = {
        id: generateId('customer'),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone,
        addresses,
        role: 'CUSTOMER',
        isActive: true,
        createdAt: now(),
      };
      s.users.push(user);
      return user;
    });
  },
  addAddress(address: Address) {
    transaction((s) => {
      const user = customer(s);
      user.addresses = [...(user.addresses || []), address];
    });
  },
  readNotifications() {
    transaction((s) => {
      const user = customer(s);
      s.notifications
        .filter((n) => n.targetUserId === user.id)
        .forEach((n) => (n.read = true));
    });
  },
  saveSettings(settings: Settings) {
    transaction((s) => {
      const user = authorize(s, 'settings.manage');
      if (
        !settings.businessName.trim() ||
        !settings.bankInstructions.trim() ||
        !Number.isFinite(settings.reservationHours) ||
        settings.reservationHours < 1 ||
        !Number.isInteger(settings.lowStock) ||
        settings.lowStock < 0 ||
        !settings.shippingZones.length ||
        settings.shippingZones.some(
          (z) =>
            !z.name.trim() ||
            !Number.isSafeInteger(z.priceCents) ||
            z.priceCents < 0,
        )
      )
        throw new Error('Revisa plazos, umbrales y tarifas.');
      try {
        new Intl.DateTimeFormat(settings.locale, {
          timeZone: settings.timezone,
        });
      } catch {
        throw new Error('Idioma o zona horaria inválidos.');
      }
      if (
        new Set(settings.shippingZones.map((z) => z.name.trim().toLowerCase()))
          .size !== settings.shippingZones.length
      )
        throw new Error('Hay zonas de envío duplicadas.');
      const before = s.settings;
      s.settings = settings;
      audit(
        s,
        user,
        'SETTINGS_SAVED',
        'settings',
        'Cambios aplicados a futuras operaciones',
        before,
        settings,
        generateId('operation'),
        'SETTINGS',
      );
    });
  },
  reset() {
    authorize(businessStore.getState(), 'settings.manage');
    businessStore.setState(normalizeState(makeInitialState()));
  },
  loadScenarios() {
    transaction((s) => {
      const user = authorize(s, 'settings.manage');
      const initial = makeInitialState();
      for (const p of initial.products.filter(
        (p) =>
          p.id.startsWith('prod-training') || p.id.startsWith('prod-demo-'),
      ))
        if (!s.products.some((it) => it.id === p.id)) s.products.push(p);
      for (const u of initial.users.filter((u) =>
        ['usr-customer-demo', 'usr-seller-lucia'].includes(u.id),
      ))
        if (!s.users.some((it) => it.id === u.id)) s.users.push(u);
      for (const o of initial.orders.filter((o) =>
        o.id.startsWith('ord-scenario-'),
      ))
        if (!s.orders.some((it) => it.id === o.id)) {
          s.orders.push(o);
          s.payments.push(
            ...initial.payments.filter((p) => p.orderId === o.id),
          );
          s.shipments.push(
            ...initial.shipments.filter((sh) => sh.orderId === o.id),
          );
        }
      Object.assign(s, normalizeState(s));
      audit(
        s,
        user,
        'DEMO_SCENARIOS_LOADED',
        'scenarios',
        'Escenarios añadidos sin eliminar datos existentes',
        null,
        null,
        generateId('operation'),
        'SETTINGS',
      );
    });
  },
  dismissMigration() {
    transaction((s) => {
      authorize(s, 'settings.manage');
      s.migrationNotice = undefined;
    });
  },
};
