import { createStore } from '../../../shared/lib/createStore.ts';
export const staffIdentity = createStore<{ userId: string | null }>(
  { userId: null },
  'sumakwarmi_staff_session_v1',
);
