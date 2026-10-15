import { createStore } from '../../../shared/lib/createStore.ts';
import { User, Address } from '../../../shared/types/index.ts';
import { INITIAL_USERS } from '../../../shared/data/index.ts';
import { generateId } from '../../../shared/lib/id.ts';

interface SessionState {
  currentUser: User | null;
  users: User[];
}

const sessionStore = createStore<SessionState>(
  {
    currentUser: null, // Visitor by default or Martina
    users: INITIAL_USERS,
  },
  'sumakwarmi_session_v1'
);

export const useSessionStore = sessionStore.useStore;

export const sessionActions = {
  setCurrentUser: (user: User | null) => {
    sessionStore.setState((prev) => ({ ...prev, currentUser: user }));
  },
  switchUserById: (userId: string | null) => {
    if (!userId) {
      sessionStore.setState((prev) => ({ ...prev, currentUser: null }));
      return;
    }
    const found = sessionStore.getState().users.find((u) => u.id === userId);
    if (found) {
      sessionStore.setState((prev) => ({ ...prev, currentUser: found }));
    }
  },
  registerCustomer: (name: string, email: string, phone: string, address?: Omit<Address, 'id'>) => {
    const newId = generateId('usr');
    const newAddr: Address[] = address
      ? [{ ...address, id: generateId('addr'), isDefault: true }]
      : [];
    const newUser: User = {
      id: newId,
      name,
      email,
      phone,
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date().toISOString(),
      addresses: newAddr,
    };
    sessionStore.setState((prev) => ({
      users: [...prev.users, newUser],
      currentUser: newUser,
    }));
    return newUser;
  },
  addAddressToCurrentUser: (address: Omit<Address, 'id'>) => {
    const { currentUser, users } = sessionStore.getState();
    if (!currentUser) return;
    const newAddr: Address = { ...address, id: generateId('addr') };
    const updatedUser = {
      ...currentUser,
      addresses: [...(currentUser.addresses || []), newAddr],
    };
    sessionStore.setState({
      currentUser: updatedUser,
      users: users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
    });
  },
  toggleSellerActive: (userId: string) => {
    sessionStore.setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
    }));
  },
  createSeller: (name: string, email: string, phone: string) => {
    const newSeller: User = {
      id: generateId('usr-seller'),
      name,
      email,
      phone,
      role: 'SELLER',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    sessionStore.setState((prev) => ({
      ...prev,
      users: [...prev.users, newSeller],
    }));
    return newSeller;
  },
  resetUsers: () => {
    sessionStore.setState({ currentUser: null, users: INITIAL_USERS });
  },
};
