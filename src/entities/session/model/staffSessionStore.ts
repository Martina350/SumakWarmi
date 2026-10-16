import { staffIdentity } from './staffIdentity.ts';
import { useSessionStore } from './sessionStore.ts';

// Prototype credentials only. Production authentication must be handled by a server.
export const STAFF_PROTOTYPE_PASSWORD = 'Sumak2026!';
const staffStore = staffIdentity;

export function useStaffSessionStore() {
  const { userId } = staffStore.useStore();
  const { users } = useSessionStore();
  const currentUser = users.find((user) => user.id === userId && user.isActive && (user.role === 'ADMIN' || user.role === 'SELLER')) ?? null;
  return { currentUser };
}

export const staffSessionActions = {
  login: (userId: string) => staffStore.setState({ userId }),
  logout: () => staffStore.setState({ userId: null }),
};
