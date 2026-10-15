import { PaymentStatus, PaymentMethod } from './models.ts';

export interface TransferProof {
  id: string;
  paymentId: string;
  orderId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  fileUrl?: string;
}

export interface PaymentHistory {
  id: string;
  paymentId: string;
  previousStatus: PaymentStatus;
  newStatus: PaymentStatus;
  actor: string;
  comment: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  proof?: TransferProof;
  history: PaymentHistory[];
  createdAt: string;
  updatedAt: string;
}
