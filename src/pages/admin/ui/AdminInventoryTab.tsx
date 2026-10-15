import React from 'react';
import { useCatalogStore, catalogActions } from '../../../entities/catalog/index.ts';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../../shared/ui/Table.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AdminInventoryTab: React.FC = () => {
  const { products } = useCatalogStore();

  const handleAdjust = (prodId: string, varId: string, delta: number) => {
    catalogActions.adjustVariantStock(prodId, varId, delta);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#241B24] font-heading">Control de Inventario y Existencias</h3>
        <p className="text-xs text-[#665D65]">Visualiza existencias físicas, reservas activas y aplica ajustes rápidos.</p>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>SKU</Th>
            <Th>Producto / Variante</Th>
            <Th>Stock actual</Th>
            <Th>Stock mínimo</Th>
            <Th>Alerta</Th>
            <Th className="text-right">Ajuste rápido</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.flatMap((prod) =>
            prod.variants.map((v) => {
              const isLow = v.stockActual <= v.stockMinimo;
              return (
                <Tr key={v.id}>
                  <Td className="font-data font-semibold text-xs text-[#A91E50]">{v.sku}</Td>
                  <Td className="text-xs">
                    <span className="font-semibold text-[#241B24]">{prod.name}</span> · {v.name}
                  </Td>
                  <Td className="font-data font-bold text-xs text-[#241B24]">{v.stockActual} unid.</Td>
                  <Td className="font-data text-xs text-[#665D65]">{v.stockMinimo} unid.</Td>
                  <Td>
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B42336] bg-[#FDEBED] px-2.5 py-0.5 rounded-full border border-[#B42336]/20">
                        <AlertTriangle className="w-3 h-3 text-[#B42336]" />
                        Bajo stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#267A59] bg-[#E8F3EE] px-2.5 py-0.5 rounded-full border border-[#267A59]/20 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-[#267A59]" />
                        Óptimo
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdjust(prod.id, v.id, -1)}
                        className="w-8 h-8 p-0"
                        title="Restar 1 unidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdjust(prod.id, v.id, 5)}
                        className="w-8 h-8 p-0 text-[#267A59] hover:bg-[#E8F3EE]"
                        title="Sumar 5 unidades"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
