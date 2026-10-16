import React, { useState } from 'react';
import {
  useBusinessStore,
  available,
} from '../../../shared/domain/businessStore.ts';
import { visibleOrders, can } from '../../../shared/domain/operations.ts';
import { report } from '../../../shared/domain/reporting.ts';
import { User } from '../../../shared/types/index.ts';
import { formatDate } from '../../../shared/lib/formatters.ts';
import { Heading, Field, Empty, money } from './common.tsx';

export function Dashboard({
  user,
  navigate,
  reportMode = false,
  sellerId,
}: {
  user: User;
  navigate: (p: string) => void;
  reportMode?: boolean;
  sellerId?: string;
}) {
  const s = useBusinessStore();
  const admin = user.role === 'ADMIN';
  const ownId = sellerId || (admin ? undefined : user.id);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [period, setPeriod] = useState('all');
  const data = report(s, ownId, from, to);
  const orders = visibleOrders(s, user);
  const own = orders.filter((o) => o.assignedSellerId === (ownId || user.id));
  const setPreset = (value: string) => {
    setPeriod(value);
    const end = new Date();
    const start = new Date(end);
    if (value === 'day') start.setDate(end.getDate());
    if (value === 'week') start.setDate(end.getDate() - 6);
    if (value === 'month') start.setDate(1);
    if (value === 'year') {
      start.setMonth(0);
      start.setDate(1);
    }
    setFrom(
      value === 'all'
        ? ''
        : start.toLocaleDateString('en-CA', { timeZone: s.settings.timezone }),
    );
    setTo(
      value === 'all'
        ? ''
        : end.toLocaleDateString('en-CA', { timeZone: s.settings.timezone }),
    );
  };
  const urgent = [
    ...(admin || can(user, 'payments.review')
      ? [
          {
            title: 'Pagos por revisar',
            value: orders.filter((o) =>
              ['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(
                o.paymentStatus,
              ),
            ).length,
            path: '/pagos',
          },
        ]
      : []),
    {
      title: admin ? 'Sin responsable' : 'Cola disponible',
      value: orders.filter(
        (o) => !o.assignedSellerId && o.paymentStatus === 'APPROVED',
      ).length,
      path: '/ventas?filter=unassigned',
    },
    {
      title: 'Por preparar',
      value: (admin ? orders : own).filter((o) =>
        ['CONFIRMED', 'PROCESSING'].includes(o.status),
      ).length,
      path: admin ? '/ventas?filter=paid' : '/preparacion',
    },
    {
      title: 'Por despachar',
      value: (admin ? orders : own).filter(
        (o) => o.status === 'READY_FOR_SHIPMENT',
      ).length,
      path: admin ? '/logistica' : '/despachos',
    },
    {
      title: 'Incidencias',
      value: (admin ? orders : own).filter((o) => !!o.incident).length,
      path: '/ventas?filter=incident',
    },
    ...(admin
      ? [
          {
            title: 'SKU críticos',
            value: s.products
              .flatMap((p) => p.variants)
              .filter((v) => available(v) <= v.stockMinimo).length,
            path: '/inventario',
          },
        ]
      : []),
  ];
  const maxSales = Math.max(1, ...Object.values(data.byDay));
  const approvalTimes = s.payments
    .filter(
      (p) =>
        p.status === 'APPROVED' &&
        p.proof &&
        p.resolvedAt &&
        (!ownId || p.reviewerId === ownId),
    )
    .map(
      (p) =>
        (Date.parse(p.resolvedAt!) - Date.parse(p.proof!.uploadedAt)) / 60000,
    );
  return (
    <>
      <Heading
        title={
          reportMode
            ? ownId
              ? 'Rendimiento comercial'
              : 'Reportes del negocio'
            : admin
              ? 'Resumen del negocio'
              : `Hola, ${user.name.split(' ')[0]}`
        }
        description="Métricas derivadas de pedidos y pagos locales. Importes de demostración en USD."
      />
      <div className="system-toolbar">
        <Field label="Periodo">
          <select value={period} onChange={(e) => setPreset(e.target.value)}>
            <option value="all">Todo el historial</option>
            <option value="day">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
            <option value="custom">Personalizado</option>
          </select>
        </Field>
        <Field label="Desde">
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setPeriod('custom');
              setFrom(e.target.value);
            }}
          />
        </Field>
        <Field label="Hasta">
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setPeriod('custom');
              setTo(e.target.value);
            }}
          />
        </Field>
      </div>
      {!reportMode && (
        <section>
          <h2 className="mb-3">Atención prioritaria</h2>
          <div className="system-urgent">
            {urgent.map((u) => (
              <button key={u.title} onClick={() => navigate(u.path)}>
                <span>{u.title}</span>
                <strong>{u.value}</strong>
                <small>Abrir bandeja →</small>
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="system-metrics">
        {[
          ['Ventas netas demo', money(data.net)],
          ['Pedidos pagados', data.paidCount],
          ['Ticket promedio', money(data.average)],
          ['Pedidos creados', data.created],
          ['Reembolsos demo', money(data.refunds)],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="system-grid">
        <section className="system-panel">
          <h2>Ventas confirmadas por fecha de pago</h2>
          <p className="system-muted">
            Total bruto USD · {from || 'Inicio'} a {to || 'Hoy'} · Fuente:
            pedidos mock
          </p>
          {Object.keys(data.byDay).length ? (
            <div
              className="system-bars"
              role="img"
              aria-label="Ventas brutas por fecha, en USD"
            >
              {Object.entries(data.byDay)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, value]) => (
                  <div key={day}>
                    <span>{day}</span>
                    <div>
                      <span
                        style={{
                          width: `${Math.max(1, (value / maxSales) * 100)}%`,
                        }}
                      />
                    </div>
                    <strong>{money(value)}</strong>
                  </div>
                ))}
            </div>
          ) : (
            <Empty>No hay pagos confirmados en este periodo.</Empty>
          )}
        </section>
        <section className="system-panel">
          <h2>Productos más vendidos</h2>
          <p className="system-muted">
            Unidades brutas de pedidos pagados. Los reembolsos monetarios se
            muestran por separado.
          </p>
          {data.byProduct.slice(0, 6).map((p) => (
            <div className="system-order-line" key={p.name}>
              <span>{p.name}</span>
              <strong>{p.quantity} unid.</strong>
            </div>
          ))}
          {!data.byProduct.length && (
            <Empty>Los productos aparecerán al confirmar pagos.</Empty>
          )}
          <h3>Categorías por importe de líneas pagadas</h3>
          {Object.entries(data.byCategory).map(([cat, amount]) => (
            <p className="system-order-line" key={cat}>
              <span>{cat}</span>
              <strong>{money(amount)}</strong>
            </p>
          ))}
        </section>
      </div>
      {admin && !ownId && (
        <section className="system-panel">
          <h2>Atribución por vendedor</h2>
          <div className="system-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Responsable comercial</th>
                  <th>Ventas netas</th>
                  <th>Pedidos pagados</th>
                  <th>Abiertos asignados actualmente</th>
                </tr>
              </thead>
              <tbody>
                {s.users
                  .filter((u) => u.role === 'SELLER')
                  .map((u) => {
                    const d = report(s, u.id, from, to);
                    return (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{money(d.net)}</td>
                        <td>{d.paidCount}</td>
                        <td>
                          {
                            s.orders.filter(
                              (o) =>
                                o.assignedSellerId === u.id &&
                                ![
                                  'COMPLETED',
                                  'CANCELLED',
                                  'EXPIRED',
                                  'RETURNED',
                                ].includes(o.status),
                            ).length
                          }
                        </td>
                      </tr>
                    );
                  })}
                <tr>
                  <td>Sin atribución</td>
                  <td>
                    {money(
                      data.paid
                        .filter((o) => !o.salesAttributionSellerId)
                        .reduce(
                          (sum, o) =>
                            sum + o.totalCents! - (o.refundedCents || 0),
                          0,
                        ),
                    )}
                  </td>
                  <td colSpan={2}>
                    Conserva ventas hasta su primera asignación elegible
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
      <div className="system-grid">
        <section className="system-panel">
          <h2>Indicadores operativos</h2>
          <p>
            Tiempo medio de aprobación:{' '}
            {approvalTimes.length
              ? `${Math.round(approvalTimes.reduce((a, b) => a + b, 0) / approvalTimes.length)} minutos`
              : 'Sin revisiones resueltas'}
          </p>
          <p>
            Entregas completadas:{' '}
            {
              (admin && !ownId ? orders : own).filter(
                (o) => o.shipmentStatus === 'DELIVERED',
              ).length
            }
          </p>
          <p>
            Despachos gestionados:{' '}
            {
              s.auditLogs.filter(
                (a) =>
                  a.action === 'SHIPMENT_DISPATCH' &&
                  (!ownId || a.actorId === ownId),
              ).length
            }
          </p>
        </section>
        <section className="system-panel">
          <h2>Actividad reciente</h2>
          {(admin && !ownId
            ? s.auditLogs
            : s.auditLogs.filter((a) => a.actorId === ownId)
          )
            .slice(0, 5)
            .map((a) => (
              <div className="system-order-line" key={a.id}>
                <span>
                  {a.action}
                  <small>{a.actorName}</small>
                </span>
                <small>{formatDate(a.createdAt)}</small>
              </div>
            ))}
        </section>
      </div>
      <section className="system-panel">
        <h2>Últimos pedidos habilitados</h2>
        {[...(ownId ? own : orders)]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 5)
          .map((o) => (
            <div className="system-order-line" key={o.id}>
              <div>
                <strong>{o.orderNumber}</strong>
                <small>
                  {o.customerName} · {o.status}
                </small>
              </div>
              <button onClick={() => navigate(`/ventas/${o.id}`)}>
                Ver pedido
              </button>
            </div>
          ))}
      </section>
    </>
  );
}
