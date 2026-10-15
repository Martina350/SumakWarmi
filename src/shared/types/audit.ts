export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'ORDER' | 'PAYMENT' | 'SHIPMENT' | 'PRODUCT' | 'USER' | 'SETTINGS';
  entityId: string;
  details: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  targetRole?: 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'ALL';
  targetUserId?: string;
  read: boolean;
  createdAt: string;
}
