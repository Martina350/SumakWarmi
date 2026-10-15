import { ProductStatus } from './models.ts';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number | null; // null if unconfirmed price
  stockActual: number;
  stockReservado: number;
  stockMinimo: number;
  attributes?: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  summary: string;
  description: string;
  materials?: string;
  instructions?: string;
  status: ProductStatus;
  variants: ProductVariant[];
  featuredImage?: string;
  galleryImages?: string[];
  isFeatured?: boolean;
  priceSource: 'site' | 'mock';
}
