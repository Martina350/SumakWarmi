import { useBusinessStore } from '../../../shared/domain/businessStore.ts';
import { operations } from '../../../shared/domain/operations.ts';
import { customerIdentity } from './customerIdentity.ts';
import { User, Address } from '../../../shared/types/index.ts';
import { generateId } from '../../../shared/lib/id.ts';

export function useSessionStore() {
  const { users } = useBusinessStore();
  const { userId } = customerIdentity.useStore();
  return { users, currentUser: users.find((u) => u.id === userId && u.role === 'CUSTOMER' && u.isActive) ?? null };
}
export const sessionActions = {
  setCurrentUser: (user: User | null) => customerIdentity.setState({ userId: user?.role === 'CUSTOMER' ? user.id : null }),
  switchUserById: (id: string | null) => customerIdentity.setState({ userId: id }),
  registerCustomer: (name: string, email: string, phone: string, address?: Omit<Address, 'id'>) => {
    const user = operations.registerCustomer(name, email, phone, address ? [{ ...address, id: generateId('address') }] : []);
    customerIdentity.setState({ userId: user.id }); return user;
  },
  addAddressToCurrentUser: (address: Omit<Address, 'id'>) => operations.addAddress({ ...address, id: generateId('address') }),
  createSeller: (name: string, email: string, phone: string) => operations.saveSeller({ id: generateId('seller'), name, email, phone, isActive: true, permissions: ['orders.claim', 'orders.prepare', 'shipping.dispatch', 'analytics.own'] }),
  toggleSellerActive: (_id: string) => { throw new Error('Utiliza la gestión de equipo para resolver los pedidos abiertos antes de desactivar.'); },
  resetUsers: () => operations.reset(),
};
