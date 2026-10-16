import React, { useState } from 'react';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
export type Run = (action: () => unknown, message?: string) => boolean;
export const money = (cents: number) => formatCurrency(cents / 100);
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="system-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Heading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="system-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="system-empty">{children}</div>;
}
export function Pager<T>({
  items,
  children,
  size = 8,
}: {
  items: T[];
  children: (page: T[]) => React.ReactNode;
  size?: number;
}) {
  const [requested, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.min(requested, pages);
  return (
    <>
      {children(items.slice((page - 1) * size, page * size))}
      <div className="system-pagination">
        <span>
          {items.length} resultados · Página {page} de {pages}
        </span>
        <div>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <button disabled={page === pages} onClick={() => setPage(page + 1)}>
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
export { readDemoFile } from '../../../shared/lib/files.ts';
