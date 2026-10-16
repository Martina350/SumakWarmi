import React, { useState } from 'react';
import {
  useBusinessStore,
  available,
  sellerDefaults,
  CAPABILITIES,
  businessStore,
} from '../../../shared/domain/businessStore.ts';
import { operations } from '../../../shared/domain/operations.ts';
import { User } from '../../../shared/types/index.ts';
import { generateId } from '../../../shared/lib/id.ts';
import { formatDate } from '../../../shared/lib/formatters.ts';
import { cartActions } from '../../../entities/cart/index.ts';
import { customerIdentity } from '../../../entities/session/model/customerIdentity.ts';
import { Field, Heading, Pager, Empty, money, type Run } from './common.tsx';

export function InventoryManager({
  run,
  movementsOnly = false,
}: {
  run: Run;
  movementsOnly?: boolean;
}) {
  const s = useBusinessStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [adjust, setAdjust] = useState<{
    id: string;
    delta: string;
    reason: string;
    threshold: number;
  } | null>(null);
  const variants = s.products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productName: p.name })),
  );
  const list = variants.filter(
    (v) =>
      `${v.sku} ${v.productName}`.toLowerCase().includes(query.toLowerCase()) &&
      (filter === 'all' ||
        (filter === 'empty'
          ? available(v) === 0
          : available(v) <= v.stockMinimo)),
  );
  return (
    <>
      <Heading
        title={
          movementsOnly ? 'Movimientos de inventario' : 'Inventario por SKU'
        }
        description="Reserva no equivale a salida física. El despacho consume la reserva una sola vez."
      />
      <div className="system-metrics">
        {[
          ['SKUs', variants.length],
          ['Disponibles', variants.reduce((sum, v) => sum + available(v), 0)],
          [
            'Reservadas',
            variants.reduce((sum, v) => sum + v.stockReservado, 0),
          ],
          ['Agotados', variants.filter((v) => available(v) === 0).length],
          [
            'Críticos',
            variants.filter((v) => available(v) <= v.stockMinimo).length,
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="system-toolbar">
        <input
          aria-label="Buscar inventario"
          placeholder="Producto o SKU"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Stock"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todo el inventario</option>
          <option value="low">Crítico</option>
          <option value="empty">Agotado</option>
        </select>
      </div>
      {adjust && (
        <form
          className="system-panel system-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              window.confirm(
                '¿Confirmar ajuste físico y registrar movimiento auditable?',
              ) &&
              run(
                () =>
                  operations.adjustStock(
                    adjust.id,
                    Number(adjust.delta),
                    adjust.reason,
                    adjust.threshold,
                  ),
                'Inventario actualizado',
              )
            )
              setAdjust(null);
          }}
        >
          <h2>Ajuste de {variants.find((v) => v.id === adjust.id)?.sku}</h2>
          <div className="system-grid">
            <Field label="Cambio de unidades (+ entrada / − salida)">
              <input
                type="number"
                step="1"
                required
                value={adjust.delta}
                onChange={(e) =>
                  setAdjust({ ...adjust, delta: e.target.value })
                }
              />
            </Field>
            <Field label="Umbral de alerta">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={adjust.threshold}
                onChange={(e) =>
                  setAdjust({ ...adjust, threshold: Number(e.target.value) })
                }
              />
            </Field>
          </div>
          <Field label="Motivo obligatorio">
            <textarea
              required
              value={adjust.reason}
              onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })}
            />
          </Field>
          <p>
            Existencia resultante:{' '}
            {(variants.find((v) => v.id === adjust.id)?.stockActual || 0) +
              Number(adjust.delta)}{' '}
            unidades. Las reservas deben seguir cubiertas.
          </p>
          <div className="system-inline">
            <button className="system-primary" type="submit">
              Confirmar ajuste
            </button>
            <button type="button" onClick={() => setAdjust(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      {!movementsOnly && (
        <Pager items={list}>
          {(page) => (
            <div className="system-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>SKU / producto</th>
                    <th>Físico</th>
                    <th>Reservado</th>
                    <th>Disponible</th>
                    <th>Umbral</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {page.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.sku}</strong>
                        <small>
                          {v.productName} · {v.name}
                        </small>
                      </td>
                      <td>{v.stockActual}</td>
                      <td>{v.stockReservado}</td>
                      <td>
                        <span
                          className={
                            available(v) <= v.stockMinimo ? 'system-error' : ''
                          }
                        >
                          {available(v)}
                        </span>
                      </td>
                      <td>{v.stockMinimo}</td>
                      <td>
                        <button
                          onClick={() =>
                            setAdjust({
                              id: v.id,
                              delta: '0',
                              reason: '',
                              threshold: v.stockMinimo,
                            })
                          }
                        >
                          Ajustar / umbral
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!page.length && <Empty>No hay SKU con estos filtros.</Empty>}
            </div>
          )}
        </Pager>
      )}
      <h2>Historial de movimientos</h2>
      <Pager
        items={s.movements.filter((m) =>
          `${m.sku} ${m.productName}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )}
      >
        {(page) => (
          <div className="system-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha / SKU</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Físico resultante</th>
                  <th>Actor / motivo</th>
                </tr>
              </thead>
              <tbody>
                {page.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {formatDate(m.createdAt)}
                      <small>{m.sku}</small>
                    </td>
                    <td>{m.type}</td>
                    <td>{m.quantityDelta}</td>
                    <td>{m.resultingStock}</td>
                    <td>
                      {m.actor}
                      <small>{m.reason}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!page.length && (
              <Empty>
                Los movimientos aparecerán al reservar, despachar o ajustar
                existencias.
              </Empty>
            )}
          </div>
        )}
      </Pager>
    </>
  );
}

export function TeamManager({
  run,
  navigate,
}: {
  run: Run;
  navigate: (p: string) => void;
}) {
  const s = useBusinessStore();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<User | null>(null);
  const [replacement, setReplacement] = useState('');
  const sellers = s.users.filter((u) => u.role === 'SELLER');
  const open = draft
    ? s.orders.filter(
        (o) =>
          o.assignedSellerId === draft.id &&
          !['COMPLETED', 'CANCELLED', 'EXPIRED', 'RETURNED'].includes(o.status),
      )
    : [];
  return (
    <>
      <Heading
        title="Equipo de ventas"
        description="Accesos, capacidades y carga de trabajo. La desactivación conserva el historial."
        action={
          <button
            className="system-primary"
            onClick={() => {
              setReplacement('');
              setDraft({
                id: generateId('seller'),
                name: '',
                email: '',
                phone: '',
                role: 'SELLER',
                isActive: true,
                createdAt: new Date().toISOString(),
                permissions: [...sellerDefaults],
              });
            }}
          >
            Nuevo vendedor
          </button>
        }
      />
      <div className="system-toolbar">
        <input
          aria-label="Buscar vendedor"
          placeholder="Nombre o correo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {draft && (
        <form
          className="system-panel system-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              !draft.isActive &&
              !window.confirm(
                `Se resolverán ${open.length} pedidos abiertos. Su atribución histórica se conserva. ¿Desactivar?`,
              )
            )
              return;
            if (
              run(
                () => operations.saveSeller(draft, replacement || undefined),
                'Cuenta de ventas guardada',
              )
            )
              setDraft(null);
          }}
        >
          <h2>Cuenta de ventas</h2>
          <div className="system-grid">
            <Field label="Nombre y apellido">
              <input
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>
            <Field label="Correo">
              <input
                type="email"
                required
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </Field>
            <Field label="Teléfono">
              <input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </Field>
            <label className="system-check">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) =>
                  setDraft({ ...draft, isActive: e.target.checked })
                }
              />
              Cuenta activa
            </label>
          </div>
          <h3>Capacidades operativas</h3>
          <div className="system-grid">
            {[...sellerDefaults, 'payments.review', 'payments.approve'].map(
              (p) => (
                <label key={p} className="system-check">
                  <input
                    type="checkbox"
                    checked={draft.permissions?.includes(p) || false}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        permissions: e.target.checked
                          ? [...(draft.permissions || []), p]
                          : draft.permissions?.filter((v) => v !== p),
                      })
                    }
                  />
                  {
                    (
                      {
                        'orders.claim': 'Tomar pedidos confirmados',
                        'orders.prepare': 'Preparar pedidos propios',
                        'shipping.dispatch': 'Gestionar despacho y entrega',
                        'analytics.own': 'Consultar rendimiento propio',
                        'payments.review': 'Revisar comprobantes',
                        'payments.approve': 'Resolver transferencias',
                      } as Record<string, string>
                    )[p]
                  }
                </label>
              ),
            )}
          </div>
          {!draft.isActive && (
            <div className="system-warning">
              <strong>{open.length} pedidos abiertos</strong>
              {open.map((o) => (
                <p key={o.id}>
                  {o.orderNumber} · {o.status}
                </p>
              ))}
              <Field label="Resolver trabajos">
                <select
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                >
                  <option value="">Liberar a bandeja sin responsable</option>
                  {sellers
                    .filter((u) => u.isActive && u.id !== draft.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        Reasignar a {u.name}
                      </option>
                    ))}
                </select>
              </Field>
            </div>
          )}
          <p className="system-muted">
            La cuenta usará la contraseña compartida del prototipo. No
            introducir credenciales productivas.
          </p>
          <div className="system-inline">
            <button className="system-primary" type="submit">
              Guardar cuenta
            </button>
            <button type="button" onClick={() => setDraft(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      <Pager
        items={sellers.filter((u) =>
          `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
        )}
      >
        {(page) => (
          <div className="system-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th>Estado</th>
                  <th>Abiertos</th>
                  <th>Ventas atribuidas netas</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {page.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      <small>{u.email}</small>
                    </td>
                    <td>{u.isActive ? 'Activo' : 'Inactivo'}</td>
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
                    <td>
                      {money(
                        s.orders
                          .filter(
                            (o) =>
                              o.salesAttributionSellerId === u.id &&
                              o.paymentApprovedAt,
                          )
                          .reduce(
                            (sum, o) =>
                              sum + o.totalCents! - (o.refundedCents || 0),
                            0,
                          ),
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setDraft(structuredClone(u));
                          setReplacement('');
                        }}
                      >
                        Editar / accesos
                      </button>
                      <button onClick={() => navigate(`/vendedores/${u.id}`)}>
                        Ver desempeño
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Pager>
    </>
  );
}

export function SettingsManager({ run }: { run: Run }) {
  const s = useBusinessStore();
  const [draft, setDraft] = useState(() => structuredClone(s.settings));
  return (
    <>
      <Heading
        title="Configuración"
        description="Valores de demostración editables. Los pedidos existentes conservan sus snapshots."
      />
      <form
        className="system-panel system-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => operations.saveSettings(draft),
            'Configuración aplicada a futuras operaciones',
          );
        }}
      >
        <div className="system-grid">
          <Field label="Nombre comercial">
            <input
              required
              value={draft.businessName}
              onChange={(e) =>
                setDraft({ ...draft, businessName: e.target.value })
              }
            />
          </Field>
          <Field label="Reserva temporal (horas demo)">
            <input
              type="number"
              min="1"
              value={draft.reservationHours}
              onChange={(e) =>
                setDraft({ ...draft, reservationHours: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Umbral por defecto para nuevos SKU">
            <input
              type="number"
              min="0"
              value={draft.lowStock}
              onChange={(e) =>
                setDraft({ ...draft, lowStock: Number(e.target.value) })
              }
            />
          </Field>
        </div>
        <Field label="Instrucciones bancarias ficticias">
          <textarea
            rows={4}
            required
            value={draft.bankInstructions}
            onChange={(e) =>
              setDraft({ ...draft, bankInstructions: e.target.value })
            }
          />
        </Field>
        <div className="system-inline">
          <label>
            <input
              type="checkbox"
              checked={draft.transferEnabled}
              onChange={(e) =>
                setDraft({ ...draft, transferEnabled: e.target.checked })
              }
            />{' '}
            Transferencia demo
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.payphoneEnabled}
              onChange={(e) =>
                setDraft({ ...draft, payphoneEnabled: e.target.checked })
              }
            />{' '}
            PayPhone demo
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.freezeReview}
              onChange={(e) =>
                setDraft({ ...draft, freezeReview: e.target.checked })
              }
            />{' '}
            Congelar vencimiento durante revisión
          </label>
        </div>
        <h2>Tarifas locales por provincia</h2>
        <p className="system-muted">
          La última fila es la tarifa por defecto para otros destinos. No son
          tarifas oficiales.
        </p>
        {draft.shippingZones.map((z, i) => (
          <div className="system-inline" key={i}>
            <Field label="Provincia / zona">
              <input
                required
                value={z.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    shippingZones: draft.shippingZones.map((it, idx) =>
                      idx === i ? { ...it, name: e.target.value } : it,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Costo USD">
              <input
                type="number"
                min="0"
                step="0.01"
                value={z.priceCents / 100}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    shippingZones: draft.shippingZones.map((it, idx) =>
                      idx === i
                        ? {
                            ...it,
                            priceCents: Math.round(
                              Number(e.target.value) * 100,
                            ),
                          }
                        : it,
                    ),
                  })
                }
              />
            </Field>
            <button
              type="button"
              disabled={draft.shippingZones.length === 1}
              onClick={() =>
                setDraft({
                  ...draft,
                  shippingZones: draft.shippingZones.filter(
                    (_, idx) => idx !== i,
                  ),
                })
              }
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setDraft({
              ...draft,
              shippingZones: [
                { name: '', priceCents: 0 },
                ...draft.shippingZones,
              ],
            })
          }
        >
          Añadir provincia
        </button>
        <div className="system-grid">
          <Field label="Idioma">
            <input
              value={draft.locale}
              onChange={(e) => setDraft({ ...draft, locale: e.target.value })}
            />
          </Field>
          <Field label="Moneda">
            <input value="USD" disabled />
          </Field>
          <Field label="Zona horaria">
            <input
              value={draft.timezone}
              onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
            />
          </Field>
        </div>
        <p className="system-muted">
          Cancelaciones antes de salida física liberan reservas; después de
          despacho requieren incidencia/devolución. Reembolso siempre simulado y
          autorizado por administración.
        </p>
        <h2>Políticas de la demostración</h2>
        <div className="system-inline">
          <label>
            <input
              type="checkbox"
              checked={draft.allowCustomerCancel !== false}
              onChange={(e) =>
                setDraft({ ...draft, allowCustomerCancel: e.target.checked })
              }
            />{' '}
            Permitir cancelación del cliente antes de pagar
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.allowPaymentRetry !== false}
              onChange={(e) =>
                setDraft({ ...draft, allowPaymentRetry: e.target.checked })
              }
            />{' '}
            Permitir reintento de pagos fallidos/rechazados
          </label>
        </div>
        <h2>Plantillas de notificación interna</h2>
        <p className="system-muted">
          Puedes utilizar {'{pedido}'} y {'{mensaje}'}. Las notificaciones
          permanecen en la aplicación; no se envían correos.
        </p>
        {[
          'ORDER_CREATED',
          'PAYMENT_APPROVE',
          'PAYMENT_REQUIRE_CORRECTION',
          'SHIPMENT_DISPATCH',
          'SHIPMENT_DELIVERED',
        ].map((event) => (
          <Field key={event} label={event}>
            <textarea
              value={draft.notificationTemplates?.[event] || '{mensaje}'}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  notificationTemplates: {
                    ...draft.notificationTemplates,
                    [event]: e.target.value,
                  },
                })
              }
            />
          </Field>
        ))}
        <button type="submit" className="system-primary">
          Guardar configuración
        </button>
      </form>
      <section className="system-panel system-form">
        <h2>Datos de demostración</h2>
        <p>
          El restablecimiento elimina cambios locales de negocio, carrito y
          sesión de cliente. Conserva las cuentas semilla del equipo.
        </p>
        <div className="system-inline">
          <button onClick={() => run(() => operations.loadScenarios())}>
            Escenarios demo
          </button>
          <button
            onClick={() => {
              const blob = new Blob(
                [
                  JSON.stringify(
                    {
                      business: businessStore.getState(),
                      sourceBackups: Object.fromEntries(
                        [
                          'sumakwarmi_catalog_v1',
                          'sumakwarmi_orders_v1',
                          'sumakwarmi_session_v1',
                          'sumakwarmi_business_v3',
                        ].map((key) => [key, localStorage.getItem(key)]),
                      ),
                    },
                    null,
                    2,
                  ),
                ],
                { type: 'application/json' },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sumakwarmi-respaldo-demo.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Descargar respaldo local
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  '¿Restablecer TODOS los datos de demostración? Descarga un respaldo si necesitas conservarlos.',
                )
              )
                run(() => {
                  operations.reset();
                  cartActions.clearCart();
                  customerIdentity.setState({ userId: null });
                  setDraft(structuredClone(businessStore.getState().settings));
                }, 'Datos demo restablecidos');
            }}
          >
            Restablecer datos demo
          </button>
        </div>
      </section>
    </>
  );
}

export function CustomersManager({
  navigate,
}: {
  navigate: (p: string) => void;
}) {
  const s = useBusinessStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const customers = s.users.filter(
    (u) =>
      u.role === 'CUSTOMER' &&
      `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  const user = s.users.find((u) => u.id === selected);
  return (
    <>
      <Heading
        title="Clientes"
        description="Información comercial para atención de pedidos. Direcciones históricas protegidas."
      />
      <div className="system-toolbar">
        <input
          aria-label="Buscar clientes"
          placeholder="Nombre o correo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Pager items={customers}>
        {(page) => (
          <div className="system-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Desde</th>
                  <th>Pedidos</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {page.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>
                      {u.email}
                      <small>{u.phone}</small>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      {s.orders.filter((o) => o.customerId === u.id).length}
                    </td>
                    <td>
                      <button onClick={() => setSelected(u.id)}>
                        Ver historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Pager>
      {user && (
        <section className="system-panel system-form">
          <h2>{user.name}</h2>
          {s.orders
            .filter((o) => o.customerId === user.id)
            .map((o) => (
              <div className="system-order-line" key={o.id}>
                <div>
                  <strong>{o.orderNumber}</strong>
                  <small>
                    {o.status} · {money(o.totalCents!)}
                  </small>
                </div>
                <button onClick={() => navigate(`/ventas/${o.id}`)}>
                  Abrir pedido
                </button>
              </div>
            ))}
          <details>
            <summary>Direcciones autorizadas</summary>
            {user.addresses?.map((a) => (
              <p key={a.id}>
                {a.mainStreet} · {a.city}, {a.province}
              </p>
            ))}
          </details>
        </section>
      )}
    </>
  );
}

export function AuditManager() {
  const { auditLogs } = useBusinessStore();
  const [query, setQuery] = useState('');
  const list = auditLogs.filter((a) =>
    `${a.actorName} ${a.action} ${a.entityId} ${a.details}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        title="Auditoría"
        description="Registro local de actor, acción, motivo y cambios. No editable desde la interfaz."
      />
      <div className="system-toolbar">
        <input
          aria-label="Buscar auditoría"
          placeholder="Actor, acción, entidad o motivo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Pager items={list}>
        {(page) => (
          <div className="system-form">
            {page.map((a) => (
              <details className="system-panel" key={a.id}>
                <summary>
                  <strong>{a.action}</strong> · {a.actorName} ·{' '}
                  {formatDate(a.createdAt)}
                </summary>
                <p>{a.details}</p>
                <small>
                  {a.entityType} · {a.entityId} · {a.operationId}
                </small>
                <div className="system-grid">
                  <div>
                    <h3>Antes</h3>
                    <pre>{JSON.stringify(a.previous ?? null, null, 2)}</pre>
                  </div>
                  <div>
                    <h3>Después</h3>
                    <pre>{JSON.stringify(a.next ?? null, null, 2)}</pre>
                  </div>
                </div>
              </details>
            ))}
            {!page.length && <Empty>No hay eventos con esta búsqueda.</Empty>}
          </div>
        )}
      </Pager>
    </>
  );
}
