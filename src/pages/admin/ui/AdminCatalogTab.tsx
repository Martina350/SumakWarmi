import React, { useState } from 'react';
import { useCatalogStore, catalogActions } from '../../../entities/catalog/index.ts';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../../shared/ui/Table.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { formatCurrency } from '../../../shared/lib/formatters.ts';
import { DollarSign, Check, AlertCircle } from 'lucide-react';

export const AdminCatalogTab: React.FC = () => {
  const { products } = useCatalogStore();
  const [editingVariant, setEditingVariant] = useState<{ prodId: string; varId: string; price: string } | null>(null);

  const handleSavePrice = (prodId: string, varId: string) => {
    if (!editingVariant) return;
    const num = parseFloat(editingVariant.price);
    if (isNaN(num) || num < 0) return;
    catalogActions.updateVariantPrice(prodId, varId, num);
    setEditingVariant(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-[#272329]">Catálogo y Precios Oficiales</h3>
          <p className="text-xs text-[#716A70]">Edita precios de referencia y variantes antes de la compra pública.</p>
        </div>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Producto</Th>
            <Th>Categoría</Th>
            <Th>SKU / Variante</Th>
            <Th>Precio actual</Th>
            <Th>Stock</Th>
            <Th className="text-right">Acción</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.flatMap((prod) =>
            prod.variants.map((v) => {
              const isEditing = editingVariant?.prodId === prod.id && editingVariant?.varId === v.id;
              return (
                <Tr key={v.id}>
                  <Td className="font-semibold text-xs text-[#272329]">{prod.name}</Td>
                  <Td className="text-xs text-[#716A70]">{prod.categoryName}</Td>
                  <Td className="text-xs">
                    <span className="font-data text-[#7A3F65] font-medium">{v.sku}</span> · {v.name}
                  </Td>
                  <Td className="font-data font-bold text-xs text-[#272329]">
                    {isEditing && editingVariant ? (
                      <div className="flex items-center gap-1 w-24">
                        <Input
                          type="number"
                          step="0.5"
                          value={editingVariant.price}
                          onChange={(e) => setEditingVariant({ prodId: prod.id, varId: v.id, price: e.target.value })}
                          className="h-8 text-xs px-2"
                        />
                      </div>
                    ) : v.price !== null ? (
                      formatCurrency(v.price)
                    ) : (
                      <span className="text-[#9A6414] text-[11px] font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Sin precio
                      </span>
                    )}
                  </Td>
                  <Td className="font-data text-xs">{v.stockActual} u.</Td>
                  <Td className="text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="primary" onClick={() => handleSavePrice(prod.id, v.id)} icon={<Check className="w-3.5 h-3.5" />}>
                          Guardar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingVariant(null)}>
                          X
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingVariant({ prodId: prod.id, varId: v.id, price: (v.price ?? 0).toString() })}
                        icon={<DollarSign className="w-3.5 h-3.5" />}
                      >
                        {v.price === null ? 'Fijar precio' : 'Modificar'}
                      </Button>
                    )}
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </div>
  );
};
