import type { BusinessState } from './businessStore.ts';
import { cents } from './businessStore.ts';
export function report(
  state: BusinessState,
  sellerId?: string,
  from = '',
  to = '',
) {
  const within = (date: string) =>
    (!from || date.slice(0, 10) >= from) && (!to || date.slice(0, 10) <= to);
  const scope = state.orders.filter(
    (o) => !sellerId || o.salesAttributionSellerId === sellerId,
  );
  const paid = scope.filter(
    (o) => o.paymentApprovedAt && within(o.paymentApprovedAt),
  );
  const gross = paid.reduce(
    (sum, o) => sum + (o.totalCents ?? cents(o.total)),
    0,
  );
  const refunds = state.auditLogs
    .filter(
      (a) =>
        a.action === 'REFUND_RECORDED' &&
        within(a.createdAt) &&
        scope.some((o) => o.id === a.entityId),
    )
    .reduce(
      (sum, a) =>
        sum + (Number((a.next as { amountCents?: number })?.amountCents) || 0),
      0,
    );
  const byDay: Record<string, number> = {};
  const byProduct: Record<
    string,
    { name: string; quantity: number; revenue: number }
  > = {};
  const byCategory: Record<string, number> = {};
  paid.forEach((o) => {
    const day = o.paymentApprovedAt!.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + o.totalCents!;
    o.items.forEach((it) => {
      const p = (byProduct[it.productId] ??= {
        name: it.productName,
        quantity: 0,
        revenue: 0,
      });
      p.quantity += it.quantity;
      p.revenue += cents(it.subtotal);
      const cat =
        state.products.find((p) => p.id === it.productId)?.categoryName ||
        'Histórico';
      byCategory[cat] = (byCategory[cat] || 0) + cents(it.subtotal);
    });
  });
  return {
    gross,
    refunds,
    net: gross - refunds,
    paidCount: paid.length,
    average: paid.length ? Math.round((gross - refunds) / paid.length) : 0,
    paid,
    created: scope.filter((o) => within(o.createdAt)).length,
    byDay,
    byProduct: Object.values(byProduct).sort((a, b) => b.quantity - a.quantity),
    byCategory,
  };
}
