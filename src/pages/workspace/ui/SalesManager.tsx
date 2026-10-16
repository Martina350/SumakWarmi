import React, { useEffect, useState } from 'react';
import {
  useBusinessStore,
  available,
} from '../../../shared/domain/businessStore.ts';
import {
  operations,
  can,
  visibleOrders,
} from '../../../shared/domain/operations.ts';
import { Order, User } from '../../../shared/types/index.ts';
import { formatCurrency, formatDate } from '../../../shared/lib/formatters.ts';
import {
  getPaymentStatusLabel,
  getShipmentStatusLabel,
  getPublicOrderStatus,
} from '../../../shared/lib/statusLabels.ts';
import { Heading, Field, Empty, Pager, money, type Run } from './common.tsx';
import { Modal } from '../../../shared/ui/Modal.tsx';

export function SalesManager({
  user,
  run,
  section,
  navigate,
}: {
  user: User;
  run: Run;
  section: string;
  navigate: (path: string) => void;
}) {
  const state = useBusinessStore();
  const params = new URLSearchParams(window.location.hash.split('?')[1]);
  const [query, setQuery] = useState(params.get('q') || '');
  const [filter, setFilter] = useState(params.get('filter') || 'all');
  const [method, setMethod] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [payState, setPayState] = useState('all');
  const [quickId, setQuickId] = useState<string | null>(null);
  const quick = visibleOrders(state, user).find((o) => o.id === quickId);
  let orders = visibleOrders(state, user);
  if (section === 'preparacion')
    orders = orders.filter((o) =>
      ['CONFIRMED', 'PROCESSING'].includes(o.status),
    );
  if (section === 'despachos' || section === 'logistica')
    orders = orders.filter(
      (o) =>
        o.paymentStatus === 'APPROVED' ||
        state.shipments.some((sh) => sh.orderId === o.id),
    );
  if (section === 'pagos')
    orders = orders.filter(
      (o) => user.role === 'ADMIN' || can(user, 'payments.review'),
    );
  orders = orders
    .filter(
      (o) =>
        `${o.orderNumber} ${o.customerName} ${o.customerEmail}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (method === 'all' || o.paymentMethod === method) &&
        (!from || o.createdAt.slice(0, 10) >= from) &&
        (!to || o.createdAt.slice(0, 10) <= to) &&
        (!min || o.total >= Number(min)) &&
        (!max || o.total <= Number(max)) &&
        (filter === 'all' ||
          (filter === 'mine'
            ? o.assignedSellerId === user.id
            : filter === 'unassigned'
              ? !o.assignedSellerId && o.paymentStatus === 'APPROVED'
              : filter === 'pending'
                ? ['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(
                    o.paymentStatus,
                  )
                : filter === 'paid'
                  ? o.status === 'CONFIRMED'
                  : filter === 'preparing'
                    ? o.status === 'PROCESSING'
                    : filter === 'ready'
                      ? o.status === 'READY_FOR_SHIPMENT'
                      : filter === 'transit'
                        ? [
                            'DISPATCHED',
                            'HANDED_TO_CARRIER',
                            'IN_TRANSIT',
                          ].includes(o.shipmentStatus)
                        : filter === 'delivered'
                          ? o.shipmentStatus === 'DELIVERED'
                          : !!o.incident ||
                            ['CANCELLED', 'RETURNED'].includes(o.status))) &&
        (payState === 'all' || o.paymentStatus === payState),
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const saveFilters = (q: string, next: string) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (next !== 'all') p.set('filter', next);
    history.replaceState(
      null,
      '',
      `${window.location.hash.split('?')[0]}${p.size ? `?${p}` : ''}`,
    );
  };
  const titles: Record<string, string> = {
    ventas: 'Ventas y pedidos',
    pagos: 'Pagos y comprobantes',
    preparacion: 'Preparación',
    despachos: 'Despachos',
    logistica: 'Logística',
  };
  const attempts = state.payments.filter((p) =>
    orders.some((o) => o.id === p.orderId),
  );
  return (
    <>
      <Heading
        title={titles[section] || 'Ventas y pedidos'}
        description="Una sola fuente de pedidos, pagos y seguimiento. Operaciones simuladas."
      />
      <div className="system-toolbar">
        <input
          aria-label="Buscar pedido"
          placeholder="Pedido, cliente o correo"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            saveFilters(e.target.value, filter);
          }}
        />
        <select
          aria-label="Bandeja de pedidos"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            saveFilters(query, e.target.value);
          }}
        >
          {[
            ['all', 'Todos los habilitados'],
            ['mine', 'Mis pedidos'],
            ['unassigned', 'Confirmados sin responsable'],
            ['pending', 'Por verificar pago'],
            ['paid', 'Pagados por preparar'],
            ['preparing', 'En preparación'],
            ['ready', 'Por despachar'],
            ['transit', 'En tránsito'],
            ['delivered', 'Entregados'],
            ['incident', 'Incidencias / cancelados'],
          ].map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Método de pago"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="all">Todos los métodos</option>
          <option value="TRANSFER">Transferencia</option>
          <option value="PAYPHONE">PayPhone demo</option>
        </select>
        <select
          aria-label="Estado de pago"
          value={payState}
          onChange={(e) => setPayState(e.target.value)}
        >
          <option value="all">Todos los estados de pago</option>
          {[
            'PENDING',
            'PENDING_VERIFICATION',
            'UNDER_REVIEW',
            'REQUIRES_CORRECTION',
            'APPROVED',
            'REJECTED',
            'FAILED',
            'REFUNDED',
          ].map((s) => (
            <option key={s} value={s}>
              {getPaymentStatusLabel(s as Order['paymentStatus']).label}
            </option>
          ))}
        </select>
      </div>
      <details className="system-panel">
        <summary>Fecha e importe</summary>
        <div className="system-grid">
          <Field label="Desde">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="Hasta">
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
          <Field label="USD mínimo">
            <input
              type="number"
              min="0"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </Field>
          <Field label="USD máximo">
            <input
              type="number"
              min="0"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </Field>
        </div>
      </details>
      {section === 'pagos' ? (
        <Pager items={attempts}>
          {(page) => (
            <div className="system-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pedido / intento</th>
                    <th>Método / importe</th>
                    <th>Evidencia</th>
                    <th>Enviado</th>
                    <th>Estado / responsable</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {page.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>
                          {
                            state.orders.find((o) => o.id === p.orderId)
                              ?.orderNumber
                          }
                        </strong>
                        <small>{p.id}</small>
                      </td>
                      <td>
                        {p.method === 'TRANSFER'
                          ? 'Transferencia'
                          : 'PayPhone DEMO'}
                        <small>{formatCurrency(p.amount)}</small>
                      </td>
                      <td>{p.proof?.fileName || 'Sin comprobante'}</td>
                      <td>{formatDate(p.createdAt)}</td>
                      <td>
                        {getPaymentStatusLabel(p.status).label}
                        <small>
                          {state.users.find((u) => u.id === p.reviewerId)
                            ?.name || 'Sin revisión'}
                        </small>
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/ventas/${p.orderId}`)}
                        >
                          Abrir expediente
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!page.length && (
                <Empty>No hay intentos con estos filtros.</Empty>
              )}
            </div>
          )}
        </Pager>
      ) : (
        <Pager items={orders}>
          {(page) => (
            <div className="system-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pedido / fecha</th>
                    <th>Cliente</th>
                    <th>Total / método</th>
                    <th>Pago</th>
                    <th>Pedido / envío</th>
                    <th>Responsable</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {page.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>{o.orderNumber}</strong>
                        <small>{formatDate(o.createdAt)}</small>
                      </td>
                      <td>
                        {o.customerName}
                        <small>{o.shippingAddressSnapshot.city}</small>
                      </td>
                      <td>
                        {formatCurrency(o.total)}
                        <small>
                          {o.paymentMethod === 'TRANSFER'
                            ? 'Transferencia'
                            : 'PayPhone demo'}
                        </small>
                      </td>
                      <td>
                        <span
                          className={`system-badge ${o.paymentStatus === 'APPROVED' ? 'system-success' : ''}`}
                        >
                          {getPaymentStatusLabel(o.paymentStatus).label}
                        </span>
                      </td>
                      <td>
                        {o.status}
                        <small>
                          {getShipmentStatusLabel(o.shipmentStatus).label}
                        </small>
                        {o.incident && (
                          <small className="system-error">{o.incident}</small>
                        )}
                      </td>
                      <td>{o.assignedSellerName || 'Sin responsable'}</td>
                      <td>
                        <button onClick={() => setQuickId(o.id)}>
                          Vista rápida
                        </button>
                        <button onClick={() => navigate(`/ventas/${o.id}`)}>
                          Gestionar
                        </button>
                        {!o.assignedSellerId &&
                          o.paymentStatus === 'APPROVED' &&
                          can(user, 'orders.claim') &&
                          user.role === 'SELLER' && (
                            <button
                              onClick={() =>
                                run(
                                  () =>
                                    operations.assign(
                                      o.id,
                                      user.id,
                                      'Pedido tomado de cola compartida',
                                      o.version!,
                                    ),
                                  'Pedido asignado',
                                )
                              }
                            >
                              Tomar
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!page.length && (
                <Empty>
                  No hay pedidos en esta bandeja. Prueba otros filtros.
                </Empty>
              )}
            </div>
          )}
        </Pager>
      )}
      {quick && (
        <Modal
          isOpen
          onClose={() => setQuickId(null)}
          title={`Vista rápida · ${quick.orderNumber}`}
          placement="right"
        >
          <div className="system-workspace">
            <p>
              {quick.customerName} · {formatCurrency(quick.total)}
            </p>
            <p>Pago: {getPaymentStatusLabel(quick.paymentStatus).label}</p>
            <p>Envío: {getShipmentStatusLabel(quick.shipmentStatus).label}</p>
            <p>Responsable: {quick.assignedSellerName || 'Sin responsable'}</p>
            {quick.items.map((item) => (
              <div key={item.variantId} className="system-order-line">
                <span>
                  {item.productName} · {item.variantName}
                </span>
                <strong>× {item.quantity}</strong>
              </div>
            ))}
            {quick.incident && (
              <p className="system-warning">{quick.incident}</p>
            )}
            <button
              className="system-primary"
              onClick={() => navigate(`/ventas/${quick.id}`)}
            >
              Abrir detalle operativo
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function OrderWorkspace({
  id,
  user,
  run,
  navigate,
}: {
  id: string;
  user: User;
  run: Run;
  navigate: (p: string) => void;
}) {
  const state = useBusinessStore();
  const o = visibleOrders(state, user).find((o) => o.id === id);
  const [reason, setReason] = useState('');
  const [seller, setSeller] = useState(o?.assignedSellerId || '');
  const [code, setCode] = useState(
    `DEMO-${Date.now().toString(36).toUpperCase()}`,
  );
  const [prepared, setPrepared] = useState<Record<string, number>>(
    o?.preparedItems || {},
  );
  const [packed, setPacked] = useState(o?.packed || false);
  const [refund, setRefund] = useState('');
  useEffect(() => {
    setPrepared(o?.preparedItems || {});
    setPacked(o?.packed || false);
    setSeller(o?.assignedSellerId || '');
  }, [o?.version]);
  if (!o)
    return (
      <Empty>
        Pedido no encontrado o sin autorización.{' '}
        <button onClick={() => navigate('/ventas')}>Volver a pedidos</button>
      </Empty>
    );
  const payments = state.payments.filter((p) => p.orderId === id);
  const shipment = state.shipments.find((s) => s.orderId === id);
  const mine = user.role === 'ADMIN' || o.assignedSellerId === user.id;
  const reviewAllowed =
    can(user, 'payments.review') && (mine || !o.assignedSellerId);
  const latest = payments.find((p) =>
    ['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(p.status),
  );
  const reservations = state.reservations.filter((r) => r.orderId === id);
  const confirmAction = (action: () => unknown, message: string) => {
    if (!reason.trim()) {
      run(() => {
        throw new Error('Escribe un motivo u observación para esta operación.');
      });
      return;
    }
    if (
      window.confirm(
        `${message}\nPedido ${o.orderNumber} · ${formatCurrency(o.total)}\nOperación de demostración, sin efecto bancario ni logístico real.`,
      )
    )
      run(action, message);
  };
  return (
    <>
      <Heading
        title={o.orderNumber}
        description={`${formatDate(o.createdAt)} · ${o.customerName}`}
        action={
          <button onClick={() => navigate('/ventas')}>Volver a pedidos</button>
        }
      />
      <div className="system-inline">
        <span className="system-badge">Pedido: {o.status}</span>
        <span className="system-badge">
          Pago: {getPaymentStatusLabel(o.paymentStatus).label}
        </span>
        <span className="system-badge">
          Envío: {getShipmentStatusLabel(o.shipmentStatus).label}
        </span>
        <span className="system-muted">Versión {o.version}</span>
      </div>
      {o.incident && (
        <p role="status" className="system-warning">
          Incidencia: {o.incident}
        </p>
      )}
      <div className="system-columns">
        <div className="system-form">
          <section className="system-panel">
            <h2>Artículos del pedido</h2>
            {o.items.map((it) => (
              <div className="system-order-line" key={it.variantId}>
                <div>
                  <strong>{it.productName}</strong>
                  <small>
                    {it.variantName} · {it.sku} · {it.quantity} ×{' '}
                    {formatCurrency(it.unitPrice)}
                  </small>
                </div>
                <strong>{formatCurrency(it.subtotal)}</strong>
              </div>
            ))}
            <div className="system-totals">
              <p>
                Subtotal <span>{formatCurrency(o.subtotal)}</span>
              </p>
              <p>
                Envío <span>{formatCurrency(o.shippingCost)}</span>
              </p>
              <p>
                <strong>Total original</strong>{' '}
                <strong>{formatCurrency(o.total)}</strong>
              </p>
              {!!o.refundedCents && (
                <p>
                  Reembolso demo <span>{money(o.refundedCents)}</span>
                </p>
              )}
            </div>
          </section>
          <section className="system-panel system-form">
            <h2>Cliente y destino</h2>
            <p>
              {o.customerName} · {o.customerPhone}
            </p>
            <p>{o.customerEmail}</p>
            <p>
              {o.shippingAddressSnapshot.recipientName} ·{' '}
              {o.shippingAddressSnapshot.mainStreet},{' '}
              {o.shippingAddressSnapshot.secondaryStreet}
            </p>
            <p>
              {o.shippingAddressSnapshot.city},{' '}
              {o.shippingAddressSnapshot.province} ·{' '}
              {o.shippingAddressSnapshot.reference}
            </p>
            <details>
              <summary>Instrucciones de pago presentadas al cliente</summary>
              <p>{o.bankInstructionsSnapshot}</p>
            </details>
          </section>
          <section className="system-panel system-form">
            <h2>Pagos e intentos</h2>
            {payments.map((p) => (
              <div key={p.id} className="system-subpanel">
                <div className="system-inline">
                  <strong>
                    {p.method === 'TRANSFER'
                      ? 'Transferencia'
                      : 'PayPhone DEMO'}
                  </strong>
                  <span className="system-badge">
                    {getPaymentStatusLabel(p.status).label}
                  </span>
                  <span>{formatCurrency(p.amount)}</span>
                </div>
                <small>
                  {formatDate(p.createdAt)} · {p.id}
                </small>
                {p.proof && (
                  <details open={latest?.id === p.id}>
                    <summary>
                      {p.proof.fileName} · ver comprobante ficticio
                    </summary>
                    {p.proof.fileUrl ? (
                      p.proof.fileUrl.startsWith('data:application/pdf') ? (
                        <iframe
                          title="Comprobante PDF ficticio"
                          className="system-proof"
                          sandbox=""
                          src={p.proof.fileUrl}
                        />
                      ) : (
                        <a
                          href={p.proof.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            className="system-proof"
                            src={p.proof.fileUrl}
                            alt="Comprobante de transferencia ficticio"
                          />
                        </a>
                      )
                    ) : (
                      <p className="system-warning">
                        Archivo anterior no disponible. Solicita una corrección
                        antes de aprobar.
                      </p>
                    )}
                  </details>
                )}
                {p.reason && <p>{p.reason}</p>}
                <small>
                  Revisor:{' '}
                  {state.users.find((u) => u.id === p.reviewerId)?.name ||
                    'Sin asignar'}
                </small>
                {p.history.length > 0 && (
                  <details>
                    <summary>Historial del intento</summary>
                    {p.history.map((h) => (
                      <p key={h.id}>
                        {formatDate(h.createdAt)} · {h.newStatus} · {h.comment}
                      </p>
                    ))}
                  </details>
                )}
              </div>
            ))}
            {latest && reviewAllowed && (
              <div className="system-inline">
                {latest.status === 'PENDING_VERIFICATION' ? (
                  <button
                    className="system-primary"
                    onClick={() =>
                      run(
                        () =>
                          operations.review(
                            id,
                            latest.id,
                            'START',
                            '',
                            o.version!,
                          ),
                        'Revisión iniciada',
                      )
                    }
                  >
                    Iniciar revisión
                  </button>
                ) : (
                  can(user, 'payments.approve') && (
                    <>
                      <button
                        className="system-primary"
                        disabled={!latest.proof?.fileUrl}
                        onClick={() =>
                          confirmAction(
                            () =>
                              operations.review(
                                id,
                                latest.id,
                                'APPROVE',
                                reason,
                                o.version!,
                              ),
                            'Confirmar aprobación manual simulada',
                          )
                        }
                      >
                        Aprobar transferencia
                      </button>
                      <button
                        onClick={() =>
                          confirmAction(
                            () =>
                              operations.review(
                                id,
                                latest.id,
                                'REQUIRE_CORRECTION',
                                reason,
                                o.version!,
                              ),
                            'Solicitar corrección',
                          )
                        }
                      >
                        Solicitar corrección
                      </button>
                      <button
                        onClick={() =>
                          confirmAction(
                            () =>
                              operations.review(
                                id,
                                latest.id,
                                'REJECT',
                                reason,
                                o.version!,
                              ),
                            'Rechazar intento; conserva posibilidad de reintento',
                          )
                        }
                      >
                        Rechazar intento
                      </button>
                    </>
                  )
                )}
              </div>
            )}
          </section>
          {mine &&
            can(user, 'orders.prepare') &&
            o.paymentStatus === 'APPROVED' &&
            ['CONFIRMED', 'PROCESSING'].includes(o.status) && (
              <section className="system-panel system-form">
                <h2>Preparación por artículo</h2>
                {o.items.map((it) => (
                  <Field
                    key={it.variantId}
                    label={`${it.productName} · ${it.variantName} (${it.quantity} requeridas)`}
                  >
                    <input
                      type="number"
                      min="0"
                      max={it.quantity}
                      step="1"
                      value={prepared[it.variantId] || 0}
                      onChange={(e) =>
                        setPrepared({
                          ...prepared,
                          [it.variantId]: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                ))}
                <label className="system-check">
                  <input
                    type="checkbox"
                    checked={packed}
                    onChange={(e) => setPacked(e.target.checked)}
                  />
                  Empaque y dirección verificados
                </label>
                <div className="system-inline">
                  <button
                    onClick={() =>
                      run(
                        () =>
                          operations.prepare(
                            id,
                            prepared,
                            packed,
                            false,
                            o.version!,
                          ),
                        'Preparación guardada',
                      )
                    }
                  >
                    Guardar avance
                  </button>
                  <button
                    className="system-primary"
                    onClick={() =>
                      run(
                        () =>
                          operations.prepare(
                            id,
                            prepared,
                            packed,
                            true,
                            o.version!,
                          ),
                        'Pedido listo para despachar',
                      )
                    }
                  >
                    Completar preparación
                  </button>
                </div>
              </section>
            )}
          <section className="system-panel system-form">
            <h2>Logística · Servientrega DEMO</h2>
            <p>
              Guía ficticia:{' '}
              <strong>{shipment?.trackingNumber || 'Sin registrar'}</strong>
            </p>
            <p>
              {shipment
                ? getShipmentStatusLabel(shipment.status).label
                : 'Sin envío'}
            </p>
            {mine && can(user, 'shipping.dispatch') && (
              <>
                {o.status === 'READY_FOR_SHIPMENT' &&
                  ![
                    'HANDED_TO_CARRIER',
                    'DISPATCHED',
                    'IN_TRANSIT',
                    'DELIVERED',
                  ].includes(o.shipmentStatus) && (
                    <>
                      <Field label="Guía manual ficticia">
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                        />
                      </Field>
                      <button
                        onClick={() =>
                          confirmAction(
                            () =>
                              operations.registerShipment(
                                id,
                                code,
                                reason,
                                o.version!,
                              ),
                            'Registrar guía demo sin confirmar salida',
                          )
                        }
                      >
                        Registrar guía
                      </button>
                      {o.shipmentStatus === 'LABEL_REGISTERED' && (
                        <button
                          className="system-primary"
                          onClick={() =>
                            confirmAction(
                              () =>
                                operations.ship(
                                  id,
                                  'DISPATCH',
                                  reason,
                                  o.version!,
                                ),
                              'Confirmar salida física simulada y consumir reserva una sola vez',
                            )
                          }
                        >
                          Confirmar despacho
                        </button>
                      )}
                    </>
                  )}
                {[
                  'HANDED_TO_CARRIER',
                  'DISPATCHED',
                  'IN_TRANSIT',
                  'DELIVERY_FAILED',
                ].includes(o.shipmentStatus) && (
                  <div className="system-inline">
                    {o.shipmentStatus !== 'IN_TRANSIT' && (
                      <button
                        onClick={() =>
                          confirmAction(
                            () =>
                              operations.ship(
                                id,
                                'IN_TRANSIT',
                                reason,
                                o.version!,
                              ),
                            'Registrar tránsito / reprogramación demo',
                          )
                        }
                      >
                        En tránsito
                      </button>
                    )}
                    {o.shipmentStatus !== 'DELIVERY_FAILED' && (
                      <>
                        <button
                          className="system-primary"
                          onClick={() =>
                            confirmAction(
                              () =>
                                operations.ship(
                                  id,
                                  'DELIVERED',
                                  reason,
                                  o.version!,
                                ),
                              'Confirmar entrega con observación mock',
                            )
                          }
                        >
                          Confirmar entrega
                        </button>
                        <button
                          onClick={() =>
                            confirmAction(
                              () =>
                                operations.ship(
                                  id,
                                  'DELIVERY_FAILED',
                                  reason,
                                  o.version!,
                                ),
                              'Registrar entrega fallida',
                            )
                          }
                        >
                          Entrega fallida
                        </button>
                      </>
                    )}
                    {o.shipmentStatus === 'DELIVERY_FAILED' &&
                      user.role === 'ADMIN' && (
                        <button
                          onClick={() =>
                            confirmAction(
                              () =>
                                operations.ship(
                                  id,
                                  'RETURNED',
                                  reason,
                                  o.version!,
                                ),
                              'Registrar devolución física; revisar stock manualmente',
                            )
                          }
                        >
                          Registrar devolución
                        </button>
                      )}
                  </div>
                )}
              </>
            )}
            {shipment?.history.map((h) => (
              <small key={h.id}>
                {formatDate(h.createdAt)} ·{' '}
                {getShipmentStatusLabel(h.newStatus).label} · {h.comment}
              </small>
            ))}
          </section>
          <section className="system-panel">
            <h2>Historial del pedido</h2>
            <ol className="system-timeline">
              {[...o.history].reverse().map((h) => (
                <li key={h.id}>
                  <strong>{h.comment}</strong>
                  <small>
                    {formatDate(h.createdAt)} · {h.actor} · {h.eventType}
                  </small>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="system-form">
          <section className="system-panel system-form">
            <h2>Observación de la operación</h2>
            <Field
              label="Motivo / evidencia mock"
              hint="Obligatorio para decisiones, despacho, entrega y cancelación."
            >
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          </section>
          <section className="system-panel system-form">
            <h2>Responsable</h2>
            <p>{o.assignedSellerName || 'Sin responsable'}</p>
            {user.role === 'ADMIN' &&
              !['COMPLETED', 'CANCELLED', 'EXPIRED', 'RETURNED'].includes(
                o.status,
              ) && (
                <>
                  <Field label="Asignar / reasignar">
                    <select
                      value={seller}
                      onChange={(e) => setSeller(e.target.value)}
                    >
                      <option value="">Sin responsable</option>
                      {state.users
                        .filter((u) => u.role === 'SELLER' && u.isActive)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <button
                    onClick={() =>
                      confirmAction(
                        () =>
                          operations.assign(
                            id,
                            seller || null,
                            reason,
                            o.version!,
                          ),
                        'Actualizar responsable; conservar atribución histórica',
                      )
                    }
                  >
                    Guardar asignación
                  </button>
                </>
              )}
            {user.role === 'SELLER' &&
              !o.assignedSellerId &&
              o.paymentStatus === 'APPROVED' &&
              can(user, 'orders.claim') && (
                <button
                  onClick={() =>
                    run(
                      () =>
                        operations.assign(
                          id,
                          user.id,
                          'Pedido tomado de cola disponible',
                          o.version!,
                        ),
                      'Pedido asignado',
                    )
                  }
                >
                  Tomar pedido
                </button>
              )}
            <small>
              Atribución comercial:{' '}
              {state.users.find((u) => u.id === o.salesAttributionSellerId)
                ?.name || 'Sin atribución'}
            </small>
          </section>
          <section className="system-panel system-form">
            <h2>Reserva e inventario</h2>
            {reservations.map((r) => {
              const v = state.products
                .flatMap((p) => p.variants)
                .find((v) => v.id === r.variantId);
              return (
                <div key={r.id}>
                  <strong>{v?.sku || r.variantId}</strong>
                  <p>
                    {r.quantity} unid. · {r.status}
                  </p>
                  <small>Vence: {formatDate(r.expiresAt)}</small>
                  {v && (
                    <small>
                      Físico {v.stockActual} · Disponible {available(v)}
                    </small>
                  )}
                </div>
              );
            })}
            {!reservations.length && (
              <p className="system-muted">
                Pedido histórico sin reserva activa.
              </p>
            )}
          </section>
          {user.role === 'ADMIN' && (
            <section className="system-panel system-form">
              <h2>Cancelación y reembolso demo</h2>
              {![
                'COMPLETED',
                'DISPATCHED',
                'CANCELLED',
                'EXPIRED',
                'RETURNED',
              ].includes(o.status) && (
                <button
                  onClick={() =>
                    confirmAction(
                      () => operations.cancel(id, reason, o.version!),
                      'Cancelar pedido y liberar reservas; si está pagado, requiere reembolso',
                    )
                  }
                >
                  Cancelar pedido
                </button>
              )}
              {['COMPLETED', 'RETURNED', 'CANCELLED'].includes(o.status) &&
                ['APPROVED', 'REFUND_PENDING', 'PARTIALLY_REFUNDED'].includes(
                  o.paymentStatus,
                ) && (
                  <>
                    <Field
                      label={`Reembolso USD (máx. ${((o.totalCents! - (o.refundedCents || 0)) / 100).toFixed(2)})`}
                    >
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={refund}
                        onChange={(e) => setRefund(e.target.value)}
                      />
                    </Field>
                    <button
                      onClick={() =>
                        confirmAction(
                          () =>
                            operations.refund(
                              id,
                              Math.round(Number(refund) * 100),
                              reason,
                              o.version!,
                            ),
                          'Registrar reembolso ficticio sin mover dinero real',
                        )
                      }
                    >
                      Registrar reembolso demo
                    </button>
                  </>
                )}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
