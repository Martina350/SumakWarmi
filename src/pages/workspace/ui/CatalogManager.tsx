import React, { useState } from 'react';
import {
  useBusinessStore,
  available,
} from '../../../shared/domain/businessStore.ts';
import { operations } from '../../../shared/domain/operations.ts';
import {
  Product,
  ProductVariant,
  Category,
} from '../../../shared/types/index.ts';
import { generateId } from '../../../shared/lib/id.ts';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import {
  Field,
  Heading,
  Pager,
  Empty,
  readDemoFile,
  type Run,
} from './common.tsx';

const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const blankVariant = (threshold = 5): ProductVariant => ({
  id: generateId('sku'),
  name: 'Presentación única',
  sku: '',
  price: 0,
  stockActual: 0,
  stockReservado: 0,
  stockMinimo: threshold,
  active: true,
  attributes: {},
});
export function CatalogManager({
  run,
  path,
  navigate,
}: {
  run: Run;
  path: string;
  navigate: (path: string) => void;
}) {
  const state = useBusinessStore();
  const editId = path.match(/productos\/([^/]+)\/editar/)?.[1];
  const initial = editId
    ? state.products.find((p) => p.id === editId)
    : undefined;
  const editing = path.endsWith('/nuevo') || !!editId;
  const [draft, setDraft] = useState<Product>(() =>
    structuredClone(
      initial || {
        id: generateId('product'),
        name: '',
        slug: '',
        categoryId: state.categories[0]?.id || '',
        categoryName: '',
        summary: '',
        description: '',
        status: 'DRAFT',
        variants: [blankVariant(state.settings.lowStock)],
        priceSource: 'mock',
      },
    ),
  );
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [stock, setStock] = useState('all');
  const [selected, select] = useState<string[]>([]);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [variantFilter, setVariantFilter] = useState('all');
  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const updateVariant = (id: string, patch: Partial<ProductVariant>) =>
    set(
      'variants',
      draft.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    );
  const filtered = state.products.filter(
    (p) =>
      (!query ||
        `${p.name} ${p.variants.map((v) => v.sku).join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (status === 'all' || p.status === status) &&
      (category === 'all' || p.categoryId === category) &&
      (stock === 'all' ||
        p.variants.some((v) =>
          stock === 'empty'
            ? available(v) === 0
            : available(v) <= v.stockMinimo,
        )) &&
      (variantFilter === 'all' ||
        p.variants.length > 1 === (variantFilter === 'multiple')) &&
      (!min ||
        p.variants.some((v) => v.price !== null && v.price >= Number(min))) &&
      (!max ||
        p.variants.some((v) => v.price !== null && v.price <= Number(max))),
  );
  const changePublication = (p: Product, next: Product['status']) => {
    if (
      window.confirm(
        `${next === 'ACTIVE' ? 'Publicar' : 'Ocultar/archivar'} ${p.name}? Los pedidos históricos se conservan.`,
      )
    )
      run(
        () => operations.saveProduct({ ...p, status: next }),
        'Publicación actualizada',
      );
  };
  if (editing && editId && !initial)
    return (
      <Empty>
        Producto no encontrado.{' '}
        <button onClick={() => navigate('/catalogo/productos')}>
          Volver al catálogo
        </button>
      </Empty>
    );
  if (editing)
    return (
      <>
        <Heading
          title={initial ? 'Editar producto' : 'Nuevo producto'}
          description="Los pedidos anteriores conservan sus datos y precios originales."
          action={
            <button onClick={() => navigate('/catalogo/productos')}>
              Volver al catálogo
            </button>
          }
        />
        <form
          className="system-panel system-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (run(() => operations.saveProduct(draft), 'Producto guardado'))
              navigate('/catalogo/productos');
          }}
        >
          <h2>Información y publicación</h2>
          <div className="system-grid">
            <Field label="Nombre">
              <input
                required
                value={draft.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  if (!initial) set('slug', slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Slug">
              <input
                required
                value={draft.slug}
                onChange={(e) => set('slug', e.target.value)}
              />
            </Field>
            <Field label="Categoría">
              <select
                value={draft.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
              >
                {state.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.isActive === false ? ' (inactiva)' : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estado comercial">
              <select
                value={draft.status}
                onChange={(e) =>
                  set('status', e.target.value as Product['status'])
                }
              >
                <option value="DRAFT">Borrador</option>
                <option value="ACTIVE">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
                <option value="INACTIVE">No visible</option>
                <option value="OUT_OF_STOCK">Publicado / agotado</option>
              </select>
            </Field>
          </div>
          <Field label="Descripción corta">
            <input
              value={draft.summary}
              onChange={(e) => set('summary', e.target.value)}
            />
          </Field>
          <Field label="Descripción">
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>
          <h2>Presentaciones y precios</h2>
          <p className="system-muted">
            Para un producto simple usa una presentación única. Las existencias
            de productos guardados se ajustan desde Inventario.
          </p>
          {draft.variants.map((v) => (
            <div key={v.id} className="system-subpanel">
              <div className="system-grid">
                <Field label="Presentación">
                  <input
                    required
                    value={v.name}
                    onChange={(e) =>
                      updateVariant(v.id, { name: e.target.value })
                    }
                  />
                </Field>
                <Field label="SKU único">
                  <input
                    required
                    value={v.sku}
                    onChange={(e) =>
                      updateVariant(v.id, { sku: e.target.value.toUpperCase() })
                    }
                  />
                </Field>
                <Field label="Precio de venta USD">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.price ?? ''}
                    onChange={(e) =>
                      updateVariant(v.id, {
                        price:
                          e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Existencias iniciales">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={!!initial?.variants.some((it) => it.id === v.id)}
                    value={v.stockActual}
                    onChange={(e) =>
                      updateVariant(v.id, {
                        stockActual: Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field
                  label="Atributos (talla, color, etc.)"
                  hint="Formato: talla=S, color=rosa"
                >
                  <input
                    defaultValue={Object.entries(v.attributes || {})
                      .map(([k, value]) => `${k}=${value}`)
                      .join(', ')}
                    onChange={(e) =>
                      updateVariant(v.id, {
                        attributes: Object.fromEntries(
                          e.target.value
                            .split(',')
                            .filter((it) => it.includes('='))
                            .map((it) => it.split('=').map((s) => s.trim())),
                        ),
                      })
                    }
                  />
                </Field>
                <label className="system-check">
                  <input
                    type="checkbox"
                    checked={v.active !== false}
                    onChange={(e) =>
                      updateVariant(v.id, { active: e.target.checked })
                    }
                  />
                  Disponible para nuevas ventas
                </label>
              </div>
              {draft.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    set(
                      'variants',
                      draft.variants.filter((it) => it.id !== v.id),
                    )
                  }
                >
                  Quitar presentación
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set('variants', [
                ...draft.variants,
                blankVariant(state.settings.lowStock),
              ])
            }
          >
            Añadir presentación
          </button>
          <div className="system-grid">
            <Field label="Precio regular de referencia (opcional)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.compareAtPrice ?? ''}
                onChange={(e) =>
                  set(
                    'compareAtPrice',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </Field>
            <Field label="Etiquetas">
              <input
                value={draft.tags || ''}
                onChange={(e) => set('tags', e.target.value)}
              />
            </Field>
          </div>
          <h2>Imágenes</h2>
          <Field label="Imagen principal (URL o carga local)">
            <input
              value={draft.featuredImage || ''}
              onChange={(e) => set('featuredImage', e.target.value)}
            />
          </Field>
          <Field
            label="Subir imagen ficticia"
            hint="JPG, PNG o WebP; hasta 350 KB."
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const url = await readDemoFile(f, 350000);
                  set('featuredImage', url);
                } catch (error) {
                  run(() => {
                    throw error;
                  });
                }
              }}
            />
          </Field>
          <Field label="Texto alternativo">
            <input
              value={draft.imageAlt || ''}
              onChange={(e) => set('imageAlt', e.target.value)}
            />
          </Field>
          <Field label="Añadir imagen a galería (URL)">
            <input
              type="url"
              placeholder="Pega una URL y pulsa Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value && draft.galleryImages?.length !== 6) {
                    set('galleryImages', [
                      ...(draft.galleryImages || []),
                      value,
                    ]);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </Field>
          <div className="system-inline">
            {(draft.galleryImages || []).map((url, index) => (
              <div key={`${url}-${index}`}>
                <img
                  src={url}
                  alt={`Galería ${index + 1}`}
                  className="system-thumbnail"
                />
                <button
                  type="button"
                  disabled={!index}
                  onClick={() => {
                    const a = [...draft.galleryImages!];
                    [a[index - 1], a[index]] = [a[index], a[index - 1]];
                    set('galleryImages', a);
                  }}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      'galleryImages',
                      draft.galleryImages!.filter((_, i) => i !== index),
                    )
                  }
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <details>
            <summary>Uso, precauciones, logística y SEO</summary>
            <div className="system-form">
              <Field label="Modo de uso">
                <textarea
                  value={draft.instructions || ''}
                  onChange={(e) => set('instructions', e.target.value)}
                />
              </Field>
              <Field label="Materiales">
                <input
                  value={draft.materials || ''}
                  onChange={(e) => set('materials', e.target.value)}
                />
              </Field>
              <Field label="Precauciones (sin afirmaciones médicas inventadas)">
                <textarea
                  value={draft.precautions || ''}
                  onChange={(e) => set('precautions', e.target.value)}
                />
              </Field>
              <div className="system-grid">
                <Field label="Peso (gramos)">
                  <input
                    min="0"
                    type="number"
                    value={draft.weight || ''}
                    onChange={(e) => set('weight', Number(e.target.value))}
                  />
                </Field>
                <Field label="Dimensiones">
                  <input
                    value={draft.dimensions || ''}
                    onChange={(e) => set('dimensions', e.target.value)}
                  />
                </Field>
                <Field label="Metatítulo">
                  <input
                    value={draft.seoTitle || ''}
                    onChange={(e) => set('seoTitle', e.target.value)}
                  />
                </Field>
                <Field label="Metadescripción">
                  <input
                    value={draft.seoDescription || ''}
                    onChange={(e) => set('seoDescription', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </details>
          <div className="system-subpanel">
            <h3>Vista previa</h3>
            {draft.featuredImage ? (
              <img
                className="system-preview-image"
                src={draft.featuredImage}
                alt={draft.imageAlt || draft.name}
              />
            ) : (
              <p className="system-muted">
                Sin imagen · se mostrará el placeholder del catálogo
              </p>
            )}
            <strong>{draft.name || 'Nombre del producto'}</strong>
            <p>{draft.summary}</p>
            <p>{formatCurrency(draft.variants[0]?.price)}</p>
          </div>
          <button className="system-primary" type="submit">
            Guardar producto
          </button>
        </form>
      </>
    );
  return (
    <>
      <Heading
        title="Productos"
        description="Gestiona publicaciones, presentaciones y precios."
        action={
          <button
            className="system-primary"
            onClick={() => navigate('/catalogo/productos/nuevo')}
          >
            Nuevo producto
          </button>
        }
      />
      <div className="system-toolbar">
        <input
          aria-label="Buscar productos"
          placeholder="Buscar por nombre o SKU"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Estado"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          {['ACTIVE', 'DRAFT', 'ARCHIVED', 'INACTIVE', 'OUT_OF_STOCK'].map(
            (v) => (
              <option key={v}>{v}</option>
            ),
          )}
        </select>
        <select
          aria-label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {state.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Disponibilidad"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        >
          <option value="all">Todo el stock</option>
          <option value="empty">Agotados</option>
          <option value="low">Stock crítico</option>
        </select>
        <select
          aria-label="Variantes"
          value={variantFilter}
          onChange={(e) => setVariantFilter(e.target.value)}
        >
          <option value="all">Todas las presentaciones</option>
          <option value="simple">Producto simple</option>
          <option value="multiple">Con variantes</option>
        </select>
        <input
          aria-label="Precio mínimo"
          placeholder="Precio desde"
          min="0"
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <input
          aria-label="Precio máximo"
          placeholder="Precio hasta"
          min="0"
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
      </div>
      {!!selected.length && (
        <div className="system-inline">
          <span>{selected.length} seleccionados</span>
          {(['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                if (
                  window.confirm(
                    '¿Aplicar esta publicación a los productos seleccionados?',
                  )
                ) {
                  for (const p of state.products.filter((p) =>
                    selected.includes(p.id),
                  ))
                    if (
                      !run(
                        () => operations.saveProduct({ ...p, status: v }),
                        'Productos actualizados',
                      )
                    )
                      break;
                  select([]);
                }
              }}
            >
              {v === 'ACTIVE'
                ? 'Publicar'
                : v === 'ARCHIVED'
                  ? 'Archivar'
                  : 'Despublicar'}
            </button>
          ))}
        </div>
      )}
      <Pager items={filtered}>
        {(page) => (
          <div className="system-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Seleccionar</th>
                  <th>Producto / SKU</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Disponible</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {page.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        aria-label={`Seleccionar ${p.name}`}
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={(e) =>
                          select(
                            e.target.checked
                              ? [...selected, p.id]
                              : selected.filter((id) => id !== p.id),
                          )
                        }
                      />
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      <small>
                        {p.variants.map((v) => v.sku).join(', ')} ·{' '}
                        {p.variants.length} presentación(es)
                      </small>
                    </td>
                    <td>{p.categoryName}</td>
                    <td>{formatCurrency(p.variants[0]?.price)}</td>
                    <td>
                      {p.variants.reduce((sum, v) => sum + available(v), 0)}
                    </td>
                    <td>
                      {p.status}
                      <small>{p.updatedAt?.slice(0, 10)}</small>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          navigate(`/catalogo/productos/${p.id}/editar`)
                        }
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          changePublication(
                            p,
                            p.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE',
                          )
                        }
                      >
                        {p.status === 'ACTIVE' ? 'Archivar' : 'Publicar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!page.length && <Empty>No hay productos con estos filtros.</Empty>}
          </div>
        )}
      </Pager>
    </>
  );
}

export function CategoriesManager({ run }: { run: Run }) {
  const { categories, products } = useBusinessStore();
  const [draft, setDraft] = useState<Category | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const list = [...categories]
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) &&
        (status === 'all' || (c.isActive !== false) === (status === 'active')),
    );
  return (
    <>
      <Heading
        title="Categorías"
        description="Organiza la navegación sin modificar pedidos históricos."
        action={
          <button
            className="system-primary"
            onClick={() =>
              setDraft({
                id: generateId('category'),
                name: '',
                slug: '',
                description: '',
                isActive: true,
                isVisible: true,
                displayOrder: categories.length,
              })
            }
          >
            Nueva categoría
          </button>
        }
      />
      <div className="system-toolbar">
        <input
          aria-label="Buscar categorías"
          placeholder="Buscar categoría"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Estado de categoría"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
      </div>
      {draft && (
        <form
          className="system-panel system-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              draft.isActive === false &&
              !window.confirm(
                'Desactivar afecta la navegación y futuras publicaciones. Los productos y pedidos vinculados se conservan. ¿Continuar?',
              )
            )
              return;
            if (run(() => operations.saveCategory(draft), 'Categoría guardada'))
              setDraft(null);
          }}
        >
          <h2>
            {categories.some((c) => c.id === draft.id)
              ? 'Editar categoría'
              : 'Crear categoría'}
          </h2>
          <div className="system-grid">
            <Field label="Nombre">
              <input
                required
                value={draft.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    name: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Slug">
              <input
                required
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              />
            </Field>
            <Field label="Orden">
              <input
                type="number"
                min="0"
                step="1"
                value={draft.displayOrder}
                onChange={(e) =>
                  setDraft({ ...draft, displayOrder: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Categoría padre">
              <select
                value={draft.parentId || ''}
                onChange={(e) =>
                  setDraft({ ...draft, parentId: e.target.value || undefined })
                }
              >
                <option value="">Sin padre</option>
                {categories
                  .filter((c) => c.id !== draft.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Imagen (URL)">
              <input
                type="url"
                value={draft.image || ''}
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Descripción">
            <textarea
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </Field>
          <div className="system-inline">
            <label>
              <input
                type="checkbox"
                checked={draft.isActive !== false}
                onChange={(e) =>
                  setDraft({ ...draft, isActive: e.target.checked })
                }
              />{' '}
              Activa
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.isVisible !== false}
                onChange={(e) =>
                  setDraft({ ...draft, isVisible: e.target.checked })
                }
              />{' '}
              Visible en navegación
            </label>
          </div>
          <div className="system-subpanel">
            <strong>Vista previa: {draft.name}</strong>
            <p>{draft.description}</p>
          </div>
          <div className="system-inline">
            <button type="submit" className="system-primary">
              Guardar categoría
            </button>
            <button type="button" onClick={() => setDraft(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      <Pager items={list}>
        {(page) => (
          <div className="system-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Orden / Padre</th>
                  <th>Productos publicados</th>
                  <th>Estado</th>
                  <th>Actualizada</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {page.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <small>{c.slug}</small>
                    </td>
                    <td>
                      {c.displayOrder} ·{' '}
                      {categories.find((p) => p.id === c.parentId)?.name ||
                        'Raíz'}
                    </td>
                    <td>
                      {
                        products.filter(
                          (p) => p.categoryId === c.id && p.status === 'ACTIVE',
                        ).length
                      }
                    </td>
                    <td>
                      {c.isActive === false
                        ? 'Inactiva'
                        : c.isVisible === false
                          ? 'Oculta'
                          : 'Visible'}
                    </td>
                    <td>{c.updatedAt?.slice(0, 10)}</td>
                    <td>
                      <button onClick={() => setDraft(structuredClone(c))}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Pager>
    </>
  );
}
