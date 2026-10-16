import { ProductStatus } from './models.ts';

export interface Category {
  image?: string;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
  isVisible?: boolean;
  updatedAt?: string;
  createdAt?: string;
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface ProductVariant {
  active?: boolean;
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
  version?: number;
  updatedAt?: string;
  createdAt?: string;
  compareAtPrice?: number;
  tags?: string;
  precautions?: string;
  weight?: number;
  dimensions?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageAlt?: string;
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
