import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Order, User } from '../../../shared/types/index.ts';
import { useBusinessStore, businessStore } from '../../../shared/domain/businessStore.ts';
import { operations, can } from '../../../shared/domain/operations.ts';
import { formatCurrency, formatDate } from '../../../shared/lib/formatters.ts';
import {
  getPaymentStatusLabel,
  getShipmentStatusLabel,
  getPublicOrderStatus,
} from '../../../shared/lib/statusLabels.ts';
import { type Run } from './common.tsx';
import {
  Package,
  Truck,
  CreditCard,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface OrderManagementModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  user: User;
  run: Run;
}

export const OrderManagementModal: React.FC<OrderManagementModalProps> = ({
  orderId,
  isOpen,
  onClose,
  user,
  run,
}) => {
  const state = useBusinessStore();
  const [internalNote, setInternalNote] = useState('');
  const [guideNumber, setGuideNumber] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');

  if (!orderId || !isOpen) return null;

  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return null;

  const payments = state.payments.filter((p) => p.orderId === order.id);
  const shipment = state.shipments.find((s) => s.orderId === order.id);
  const pendingPayment = payments.find((p) =>
    ['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(p.status),
  );

  const canReviewPayments = can(user, 'payments.review');
  const canPrepare = can(user, 'orders.prepare');
  const canDispatch = can(user, 'shipping.dispatch');

  const statusInfo = getPublicOrderStatus(
    order.status,
    order.paymentStatus,
    order.shipmentStatus,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gestión de Pedido · ${order.orderNumber}`}
      description={`Cliente: ${order.customerName} · Creado el ${formatDate(order.createdAt)}`}
      maxWidth="xl"
    >
      <div className="space-y-6 text-left">
        {/* Status Bar */}
        <div className="p-4 sm:p-5 bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#665D65] uppercase tracking-wider block">
              Estado Operativo
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-[#A91E50]">
                {statusInfo.label}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#E9DFE4] text-[#241B24]">
                {getPaymentStatusLabel(order.paymentStatus).label}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-[#665D65] uppercase tracking-wider block">
              Total a Liquidar
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#241B24] font-data">
              {formatCurrency(order.total)}
            </span>
          </div>

          {order.incident && (
            <div className="w-full pt-2.5 mt-1 border-t border-[#E9DFE4] text-xs text-[#B42336] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Incidencia: {order.incident}</span>
            </div>
          )}
        </div>

        {/* 2-Column Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer & Delivery */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9DFE4] space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-[#241B24]">
              <Truck className="w-4 h-4 text-[#D52C69]" />
              <span>Datos de Entrega y Cliente</span>
            </div>
            <div className="text-[#665D65] space-y-1 pt-1">
              <p>
                <strong className="text-[#241B24]">{order.customerName}</strong> ·{' '}
                {order.customerEmail}
              </p>
              <p>Teléfono: {order.customerPhone}</p>
              <p>
                Dirección: {order.shippingAddressSnapshot.mainStreet}
                {order.shippingAddressSnapshot.secondaryStreet
                  ? ` y ${order.shippingAddressSnapshot.secondaryStreet}`
                  : ''}
                , {order.shippingAddressSnapshot.city} (
                {order.shippingAddressSnapshot.province})
              </p>
              {order.shippingAddressSnapshot.reference && (
                <p className="italic text-[#8C828A]">
                  Ref: {order.shippingAddressSnapshot.reference}
                </p>
              )}
            </div>
          </div>

          {/* Responsibility & Workflow */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9DFE4] space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-[#241B24]">
              <UserCheck className="w-4 h-4 text-[#2563A6]" />
              <span>Responsable Asignado</span>
            </div>
            <div className="space-y-3 pt-1">
              <p className="text-[#665D65]">
                Asignado actualmente a:{' '}
                <strong className="text-[#241B24]">
                  {order.assignedSellerName || 'Sin responsable asignado'}
                </strong>
              </p>

              {user.role === 'ADMIN' ? (
                <div className="flex items-center gap-2">
                  <select
                    className="p-2 border border-[#E9DFE4] rounded-xl text-xs bg-white text-[#241B24] flex-1"
                    value={selectedSeller || order.assignedSellerId || ''}
                    onChange={(e) => setSelectedSeller(e.target.value)}
                  >
                    <option value="">Seleccionar vendedor...</option>
                    {state.users
                      .filter((u) => u.role === 'SELLER' && u.isActive)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                  <button
                    disabled={!selectedSeller || selectedSeller === order.assignedSellerId}
                    onClick={() => {
                      run(() => {
                        operations.assign(
                          order.id,
                          selectedSeller,
                          'Reasignación manual desde modal administrativo',
                          order.version!,
                        );
                      }, 'Responsable actualizado');
                    }}
                    className="px-3 py-2 bg-[#FBE7ED] hover:bg-[#D52C69] text-[#A91E50] hover:text-white rounded-xl font-semibold transition-all disabled:opacity-40 cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                !order.assignedSellerId &&
                order.paymentStatus === 'APPROVED' && (
                  <button
                    onClick={() => {
                      run(() => {
                        operations.assign(
                          order.id,
                          user.id,
                          'Tomado por vendedor desde panel',
                          order.version!,
                        );
                      }, 'Pedido asignado a tu cuenta');
                    }}
                    className="px-4 py-2 bg-[#D52C69] hover:bg-[#A91E50] text-white font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Tomar este pedido
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Products Breakdown */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9DFE4] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#665D65] uppercase tracking-wider block">
              Líneas de Productos ({order.items.reduce((a, b) => a + b.quantity, 0)} unidades)
            </span>
            <span className="text-xs text-[#665D65]">
              Método: {order.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'PayPhone'}
            </span>
          </div>

          <div className="divide-y divide-[#E9DFE4]">
            {order.items.map((it) => (
              <div
                key={it.variantId}
                className="py-2.5 flex justify-between items-center text-xs sm:text-sm gap-3"
              >
                <div>
                  <p className="font-semibold text-[#241B24]">{it.productName}</p>
                  <p className="text-xs text-[#665D65]">
                    {it.variantName} × {it.quantity} unid.
                  </p>
                </div>
                <strong className="text-[#241B24] font-data">
                  {formatCurrency(it.subtotal)}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Actions Section */}
        <div className="p-4 sm:p-5 bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4] space-y-4">
          <h4 className="text-xs font-bold text-[#665D65] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D52C69]" />
            <span>Acciones Rápidas del Pedido</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Review Payment */}
            {pendingPayment && canReviewPayments ? (
              <div className="p-3 bg-white rounded-xl border border-[#E9DFE4] space-y-2">
                <span className="text-xs font-bold text-[#9A6200] block">
                  Pago por verificar
                </span>
                <p className="text-[11px] text-[#665D65]">
                  Comprobante adjunto por cliente listo para auditar.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      run(() => {
                        if (pendingPayment.status === 'PENDING_VERIFICATION') {
                          operations.review(order.id, pendingPayment.id, 'START', '', order.version!);
                          const currentVersion = (order.version || 0) + 1;
                          operations.review(
                            order.id,
                            pendingPayment.id,
                            'APPROVE',
                            'Comprobante revisado y aprobado desde modal',
                            currentVersion,
                          );
                        } else {
                          operations.review(
                            order.id,
                            pendingPayment.id,
                            'APPROVE',
                            'Comprobante revisado y aprobado desde modal',
                            order.version!,
                          );
                        }
                      }, 'Pago bancario aprobado');
                    }}
                    className="flex-1 py-1.5 bg-[#E8F3EE] hover:bg-[#267A59] text-[#267A59] hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer text-center"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => {
                      const note = window.prompt(
                        'Motivo del rechazo o solicitud de corrección:',
                        'Comprobante ilegible o importe no coincide',
                      );
                      if (!note) return;
                      run(() => {
                        if (pendingPayment.status === 'PENDING_VERIFICATION') {
                          operations.review(order.id, pendingPayment.id, 'START', '', order.version!);
                          const currentVersion = (order.version || 0) + 1;
                          operations.review(
                            order.id,
                            pendingPayment.id,
                            'REQUIRE_CORRECTION',
                            note,
                            currentVersion,
                          );
                        } else {
                          operations.review(
                            order.id,
                            pendingPayment.id,
                            'REQUIRE_CORRECTION',
                            note,
                            order.version!,
                          );
                        }
                      }, 'Corrección solicitada');
                    }}
                    className="flex-1 py-1.5 bg-[#FDEBED] hover:bg-[#B42336] text-[#B42336] hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer text-center"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ) : null}

            {/* 2. Packing / Preparation */}
            {canPrepare && ['CONFIRMED', 'PROCESSING'].includes(order.status) && (
              <div className="p-3 bg-white rounded-xl border border-[#E9DFE4] space-y-2">
                <span className="text-xs font-bold text-[#D52C69] block">
                  Preparación y empaque
                </span>
                <p className="text-[11px] text-[#665D65]">
                  Confirmar que los productos han sido seleccionados y empaquetados.
                </p>
                <button
                  onClick={() => {
                    run(() => {
                      const prep = order.items.reduce(
                        (acc, it) => ({ ...acc, [it.variantId]: it.quantity }),
                        {} as Record<string, number>,
                      );
                      operations.prepare(order.id, prep, true, true, order.version!);
                    }, 'Pedido marcado como preparado y listo');
                  }}
                  className="w-full py-1.5 bg-[#D52C69] hover:bg-[#A91E50] text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Confirmar empaque listo
                </button>
              </div>
            )}

            {/* 3. Dispatch Servientrega */}
            {canDispatch && order.status === 'READY_FOR_SHIPMENT' && (
              <div className="p-3 bg-white rounded-xl border border-[#E9DFE4] space-y-2">
                <span className="text-xs font-bold text-[#267A59] block">
                  Despacho Servientrega
                </span>
                <input
                  type="text"
                  placeholder="DEMO-SERV123..."
                  value={guideNumber}
                  onChange={(e) => setGuideNumber(e.target.value)}
                  className="w-full p-2 border border-[#E9DFE4] rounded-lg text-xs"
                />
                <button
                  onClick={() => {
                    const raw = guideNumber.trim().toUpperCase();
                    const guide = raw.startsWith('DEMO-') ? raw : `DEMO-${raw || Date.now().toString(36).toUpperCase()}`;
                    run(() => {
                      operations.registerShipment(
                        order.id,
                        guide,
                        'Registro de guía desde modal',
                        order.version!,
                      );
                      const currentVersion = (order.version || 0) + 1;
                      operations.ship(
                        order.id,
                        'DISPATCH',
                        'Salida física a Servientrega confirmada',
                        currentVersion,
                      );
                    }, `Despacho completado con guía ${guide}`);
                  }}
                  className="w-full py-1.5 bg-[#267A59] hover:bg-[#1C5941] text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Registrar envío
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Internal Audit Note */}
        <div className="p-4 bg-white rounded-2xl border border-[#E9DFE4] space-y-2.5 text-xs">
          <span className="font-bold text-[#241B24] block">
            Agregar anotación u observación interna
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. Cliente solicitó entrega por la tarde..."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              className="flex-1 p-2.5 border border-[#E9DFE4] rounded-xl text-xs"
            />
            <button
              disabled={!internalNote.trim()}
              onClick={() => {
                run(() => {
                  operations.addNote(order.id, internalNote.trim(), order.version!);
                  setInternalNote('');
                }, 'Nota interna guardada');
              }}
              className="px-4 py-2.5 bg-[#241B24] hover:bg-[#3D313D] text-white rounded-xl font-semibold transition-all disabled:opacity-40 cursor-pointer"
            >
              Anotar
            </button>
          </div>
        </div>

        {/* History Audit Timeline */}
        <div className="p-4 bg-white rounded-2xl border border-[#E9DFE4] divide-y divide-[#E9DFE4] text-xs">
          <h5 className="font-bold text-[#665D65] uppercase tracking-wider pb-2">
            Trazabilidad y Registro de Auditoría
          </h5>
          {order.history.map((h) => (
            <div key={h.id} className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#241B24]">{h.comment}</p>
                <p className="text-[11px] text-[#665D65] mt-0.5">
                  Por: <strong>{h.actor}</strong> ({h.origin})
                </p>
              </div>
              <span className="text-[11px] text-[#665D65] font-data shrink-0">
                {formatDate(h.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
