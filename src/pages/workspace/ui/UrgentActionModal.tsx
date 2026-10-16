import React from 'react';
import { Modal } from '../../../shared/ui/Modal.tsx';
import { Order, ProductVariant, User } from '../../../shared/types/index.ts';
import { formatCurrency, formatDate } from '../../../shared/lib/formatters.ts';
import { operations } from '../../../shared/domain/operations.ts';
import {
  getPaymentStatusLabel,
  getShipmentStatusLabel,
} from '../../../shared/lib/statusLabels.ts';
import {
  AlertTriangle,
  Clock,
  Package,
  Truck,
  UserCheck,
  CheckCircle2,
  Eye,
  Boxes,
} from 'lucide-react';
import { type Run } from './common.tsx';

export interface UrgentCategory {
  type:
    | 'payments_review'
    | 'unassigned'
    | 'preparing'
    | 'dispatch'
    | 'incidents'
    | 'critical_skus';
  title: string;
  description: string;
}

interface UrgentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: UrgentCategory | null;
  orders: Order[];
  criticalVariants?: { product: string; variant: ProductVariant }[];
  user: User;
  run: Run;
  onSelectOrder?: (orderId: string) => void;
}

export const UrgentActionModal: React.FC<UrgentActionModalProps> = ({
  isOpen,
  onClose,
  category,
  orders,
  criticalVariants = [],
  user,
  run,
  onSelectOrder,
}) => {
  if (!category) return null;

  const getIcon = () => {
    switch (category.type) {
      case 'payments_review':
        return <Clock className="w-5 h-5 text-[#9A6200]" />;
      case 'unassigned':
        return <UserCheck className="w-5 h-5 text-[#2563A6]" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-[#D52C69]" />;
      case 'dispatch':
        return <Truck className="w-5 h-5 text-[#267A59]" />;
      case 'incidents':
        return <AlertTriangle className="w-5 h-5 text-[#B42336]" />;
      case 'critical_skus':
        return <Boxes className="w-5 h-5 text-[#B42336]" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category.title}
      description={category.description}
      maxWidth="lg"
    >
      <div className="space-y-4 text-left">
        {category.type === 'critical_skus' ? (
          <div className="space-y-3">
            {criticalVariants.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#665D65] bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4]">
                ¡Excelente! No hay SKUs con existencias por debajo del mínimo.
              </div>
            ) : (
              criticalVariants.map(({ product, variant }) => (
                <div
                  key={variant.id}
                  className="p-4 bg-white rounded-2xl border border-[#E9DFE4] shadow-xs flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#241B24]">{product}</h4>
                    <p className="text-xs text-[#665D65] mt-0.5">
                      Presentación: <strong>{variant.name}</strong> · SKU: {variant.sku}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-[#B42336] font-bold">
                        Stock actual: {variant.stockActual} u.
                      </span>
                      <span className="text-[#665D65]">
                        Mínimo recomendado: {variant.stockMinimo} u.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const qty = window.prompt(
                        `Ingresa la cantidad a ingresar para ${product} (${variant.name}):`,
                        '10',
                      );
                      if (!qty || isNaN(Number(qty)) || Number(qty) <= 0) return;
                      run(() => {
                        operations.adjustStock(
                          variant.id,
                          Number(qty),
                          'Entrada rápida por stock crítico desde panel de control',
                        );
                      }, 'Inventario ajustado con éxito');
                    }}
                    className="px-3.5 py-2 bg-[#FBE7ED] hover:bg-[#D52C69] text-[#A91E50] hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    + Ajustar stock
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#665D65] bg-[#FFF7F9] rounded-2xl border border-[#E9DFE4]">
                <CheckCircle2 className="w-8 h-8 text-[#267A59] mx-auto mb-2" />
                No hay pedidos pendientes en esta bandeja de atención prioritaria.
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9DFE4] shadow-xs hover:border-[#EE839F] transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#F4F0F2] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {getIcon()}
                        <strong className="text-sm font-bold text-[#241B24] font-heading">
                          {o.orderNumber}
                        </strong>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FBE7ED] text-[#A91E50]">
                          {getPaymentStatusLabel(o.paymentStatus).label}
                        </span>
                      </div>
                      <p className="text-xs text-[#665D65] mt-1">
                        Cliente: <strong>{o.customerName}</strong> ({o.shippingAddressSnapshot.city}) · Creado: {formatDate(o.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#665D65] block">Total</span>
                      <strong className="text-sm font-bold text-[#241B24] font-data">
                        {formatCurrency(o.total)}
                      </strong>
                    </div>
                  </div>

                  {/* Incident note if applicable */}
                  {o.incident && (
                    <div className="p-2.5 bg-[#FDEBED] border border-[#B42336]/20 rounded-xl text-xs text-[#B42336] font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{o.incident}</span>
                    </div>
                  )}

                  {/* Actions Bar inside Modal */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="text-xs text-[#665D65]">
                      Responsable:{' '}
                      <strong>{o.assignedSellerName || 'Sin asignar'}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Claim button if unassigned */}
                      {!o.assignedSellerId && o.paymentStatus === 'APPROVED' && (
                        <button
                          onClick={() => {
                            run(() => {
                              operations.assign(
                                o.id,
                                user.id,
                                'Tomado desde panel de atención prioritaria',
                                o.version!,
                              );
                            }, 'Pedido asignado a tu cuenta');
                          }}
                          className="px-3 py-1.5 bg-[#EAF3FF] hover:bg-[#2563A6] text-[#2563A6] hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          Asignarme
                        </button>
                      )}

                      {/* Quick prepare action */}
                      {['CONFIRMED', 'PROCESSING'].includes(o.status) && (
                        <button
                          onClick={() => {
                            run(() => {
                              const prep = o.items.reduce(
                                (acc, it) => ({ ...acc, [it.variantId]: it.quantity }),
                                {},
                              );
                              operations.prepare(
                                o.id,
                                prep,
                                true,
                                true,
                                o.version!,
                              );
                            }, 'Pedido marcado como preparado y listo');
                          }}
                          className="px-3 py-1.5 bg-[#FBE7ED] hover:bg-[#D52C69] text-[#A91E50] hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          Marcar empaquetado
                        </button>
                      )}

                      {/* Quick dispatch action */}
                      {o.status === 'READY_FOR_SHIPMENT' && (
                        <button
                          onClick={() => {
                            const guide = window.prompt(
                              'Ingresa el número de guía Servientrega para este pedido:',
                              `SERV-${Date.now().toString().slice(-6)}`,
                            );
                            if (!guide) return;
                            run(() => {
                              operations.registerShipment(
                                o.id,
                                guide.trim(),
                                'Guía registrada desde panel de control',
                                o.version!,
                              );
                              operations.ship(
                                o.id,
                                'DISPATCH',
                                'Salida física a Servientrega confirmada',
                                o.version!,
                              );
                            }, 'Despacho Servientrega registrado');
                          }}
                          className="px-3 py-1.5 bg-[#E8F3EE] hover:bg-[#267A59] text-[#267A59] hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          Registrar guía y despachar
                        </button>
                      )}

                      {/* Open Full Operational Detail Modal */}
                      <button
                        onClick={() => {
                          if (onSelectOrder) {
                            onSelectOrder(o.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-white border border-[#E9DFE4] hover:border-[#D52C69] hover:text-[#A91E50] text-[#241B24] rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver detalle</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
