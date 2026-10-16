import React, { useState } from 'react';
import { useBusinessStore } from '../../../shared/domain/businessStore.ts';
import { operations } from '../../../shared/domain/operations.ts';
import { readDemoFile } from '../../../shared/lib/files.ts';
import { MockPaymentProvider } from '../../../shared/domain/providers.ts';
import { generateId } from '../../../shared/lib/id.ts';
import { PayPhoneModal } from './PayPhoneModal.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { getPaymentStatusLabel } from '../../../shared/lib/statusLabels.ts';

export function CustomerPaymentTools({
  orderId,
  onOpenPayphone,
}: {
  orderId: string;
  onOpenPayphone?: () => void;
}) {
  const { orders, payments } = useBusinessStore();
  const order = orders.find((o) => o.id === orderId);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPayphone, setShowPayphone] = useState(false);
  if (!order) return null;
  const attempts = payments.filter((p) => p.orderId === orderId);
  const eligible =
    ['PAYMENT_PENDING', 'ON_HOLD'].includes(order.status) &&
    [
      'PENDING',
      'FAILED',
      'REQUIRES_CORRECTION',
      'REJECTED',
      'CANCELLED',
    ].includes(order.paymentStatus);
  return (
    <div className="space-y-4 text-left">
      <p className="text-xs text-[#665D65]">
        Entorno de demostración · No realices depósitos ni uses documentos
        bancarios reales.
      </p>
      <p className="text-sm font-semibold">
        Pago: {getPaymentStatusLabel(order.paymentStatus).label}
      </p>
      {attempts[0]?.reason && (
        <p className="text-xs rounded-xl bg-[#FFF1D9] text-[#9A6200] p-3">
          {attempts[0].reason}
        </p>
      )}
      {order.paymentMethod === 'TRANSFER' && (
        <>
          <p className="text-xs leading-relaxed bg-[#FFF7F9] border border-[#E9DFE4] p-4 rounded-xl whitespace-pre-wrap">
            {order.bankInstructionsSnapshot}
          </p>
          {eligible && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!file || busy) return;
                setBusy(true);
                setError('');
                try {
                  const fileUrl = await readDemoFile(file);
                  operations.uploadProof(orderId, {
                    fileName: file.name,
                    fileSize: file.size,
                    fileUrl,
                  });
                  setFile(null);
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : 'No se pudo adjuntar el comprobante.',
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="block text-xs font-semibold">
                Adjunta un comprobante ficticio (JPG, PNG, WebP o PDF; máximo
                750 KB)
                <input
                  className="block mt-2 w-full border border-[#E9DFE4] rounded-xl p-3 text-xs"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              <Button type="submit" size="sm" disabled={busy || !file}>
                {busy ? 'Guardando archivo…' : 'Enviar comprobante a revisión'}
              </Button>
            </form>
          )}
        </>
      )}
      {order.paymentMethod === 'PAYPHONE' && eligible && (
        <Button
          size="sm"
          onClick={() =>
            onOpenPayphone ? onOpenPayphone() : setShowPayphone(true)
          }
        >
          Abrir PayPhone simulado / reintentar
        </Button>
      )}
      {error && (
        <p role="alert" className="text-xs text-[#B42336]">
          {error}
        </p>
      )}
      <details className="text-xs">
        <summary className="cursor-pointer font-semibold">
          Historial de intentos ({attempts.length})
        </summary>
        <div className="mt-3 space-y-2">
          {attempts.map((p) => (
            <div className="border-b border-[#E9DFE4] pb-2" key={p.id}>
              <p>
                {getPaymentStatusLabel(p.status).label} ·{' '}
                {p.method === 'TRANSFER' ? 'Transferencia' : 'PayPhone DEMO'}
              </p>
              {p.proof && <p>{p.proof.fileName}</p>}
              {p.reason && <p>{p.reason}</p>}
            </div>
          ))}
        </div>
      </details>
      <PayPhoneModal
        onSimulateCancelled={() => {
          try {
            MockPaymentProvider.processNew(orderId, 'CANCELLED');
            setShowPayphone(false);
          } catch (e) {
            setError(String(e));
          }
        }}
        isOpen={showPayphone}
        onClose={() => setShowPayphone(false)}
        orderNumber={order.orderNumber}
        amount={order.total}
        onSimulateResult={(success) => {
          try {
            MockPaymentProvider.processNew(
              orderId,
              success ? 'SUCCESS' : 'FAILURE',
            );
            setShowPayphone(false);
          } catch (e) {
            setError(String(e));
            setShowPayphone(false);
          }
        }}
      />
    </div>
  );
}
