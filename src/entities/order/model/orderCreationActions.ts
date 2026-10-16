import { operations } from '../../../shared/domain/operations.ts';
import { OrderItem, Address } from '../../../shared/types/index.ts';
import { generateId } from '../../../shared/lib/id.ts';
export function createOrderAction(params: { customer: { id: string; name: string; email: string; phone: string }; items: OrderItem[]; shippingAddress: Address; shippingCost: number; paymentMethod: 'TRANSFER' | 'PAYPHONE'; operationId?: string }) {
  return operations.createOrder({ ...params, operationId: params.operationId || generateId('checkout') });
}
