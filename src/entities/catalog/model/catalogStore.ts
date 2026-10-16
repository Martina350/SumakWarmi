import { useBusinessStore, businessStore } from '../../../shared/domain/businessStore.ts';
import { operations } from '../../../shared/domain/operations.ts';
import { Product } from '../../../shared/types/index.ts';
import { generateId } from '../../../shared/lib/id.ts';

export function useCatalogStore() {
  const state = useBusinessStore();
  // Public consumers receive publication-filtered products; internal modules use useBusinessStore.
  return { products: state.products.filter((p) => ['ACTIVE', 'OUT_OF_STOCK'].includes(p.status)), categories: state.categories.filter((c) => c.isActive !== false && c.isVisible !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) };
}
export const catalogActions = {
  updateVariantPrice: (productId: string, variantId: string, price: number) => {
    const p = businessStore.getState().products.find((p) => p.id === productId); if (!p) return;
    operations.saveProduct({ ...p, variants: p.variants.map((v) => v.id === variantId ? { ...v, price } : v) });
  },
  adjustVariantStock: (_productId: string, variantId: string, delta: number) => operations.adjustStock(variantId, delta, 'Ajuste administrativo'),
  addProduct: (data: Omit<Product, 'id'>) => operations.saveProduct({ ...data, id: generateId('product') }),
  resetCatalog: () => operations.reset(),
};
