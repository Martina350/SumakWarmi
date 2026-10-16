import { createStore } from '../../../shared/lib/createStore.ts';
let userId: string | null = null;
try {
  const old = JSON.parse(
    localStorage.getItem('sumakwarmi_session_v1') || 'null',
  );
  if (old?.currentUser?.role === 'CUSTOMER') userId = old.currentUser.id;
} catch {
  /* First visit */
}
export const customerIdentity = createStore(
  { userId },
  'sumakwarmi_customer_identity_v2',
);
