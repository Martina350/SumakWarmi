import { UserRole } from './models.ts';

export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  parish?: string;
  mainStreet: string;
  secondaryStreet?: string;
  reference?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  addresses?: Address[];
  createdAt: string;
  permissions?: string[];
}
