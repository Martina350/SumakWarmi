import { createStore } from '../../../shared/lib/createStore.ts';
import { Product, Category } from '../../../shared/types/index.ts';
import { ALL_INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../../../shared/data/index.ts';
import { generateId } from '../../../shared/lib/id.ts';

interface CatalogState {
  categories: Category[];
  products: Product[];
}

const catalogStore = createStore<CatalogState>(
  {
    categories: INITIAL_CATEGORIES,
    products: ALL_INITIAL_PRODUCTS,
  },
  'sumakwarmi_catalog_v1'
);

export const useCatalogStore = catalogStore.useStore;

export const catalogActions = {
  updateVariantPrice: (productId: string, variantId: string, price: number) => {
    catalogStore.setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          variants: p.variants.map((v) => (v.id === variantId ? { ...v, price } : v)),
        };
      }),
    }));
  },
  adjustVariantStock: (productId: string, variantId: string, delta: number) => {
    catalogStore.setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          variants: p.variants.map((v) =>
            v.id === variantId
              ? { ...v, stockActual: Math.max(0, v.stockActual + delta) }
              : v
          ),
        };
      }),
    }));
  },
  addProduct: (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: generateId('prod'),
    };
    catalogStore.setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
    }));
    return newProduct;
  },
  resetCatalog: () => {
    catalogStore.setState({
      categories: INITIAL_CATEGORIES,
      products: ALL_INITIAL_PRODUCTS,
    });
  },
};
