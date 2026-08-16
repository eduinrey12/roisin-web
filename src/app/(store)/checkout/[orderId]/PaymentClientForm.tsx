'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { selectPaymentMethodAction, submitEvidenceAction } from '@/lib/actions/checkout.actions';
import { STORE_CONFIG } from '@/lib/config/store';
import { Landmark, Banknote, Upload, CheckCircle2, MessageCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface PaymentClientFormProps {
  order: {
    id: string;
    orderNumber: string;
    total: number;
    customerName: string;
    payment: {
      method: string;
      status: string;
      evidenceUrl: string | null;
    } | null;
  };
}

export default function PaymentClientForm({ order }: PaymentClientFormProps) {
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'CASH_ON_DELIVERY'>('BANK_TRANSFER');
  const [uploading, setUploading] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string>(order.payment?.evidenceUrl || '');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setEvidenceUrl(data.url);
      } else {
        setError(data.error || 'Error al subir la imagen del comprobante');
      }
    } catch {
      setError('Error de conexión al subir comprobante');
    } finally {
      setUploading(false);
    }
  };

  const handleFinishPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Register payment method
      const payRes = await selectPaymentMethodAction(order.id, method);
      if (!payRes.success) {
        setError(payRes.error || 'Error al registrar el método de pago');
        setLoading(false);
        return;
      }

      // 2. If transfer and evidence uploaded, submit evidence
      if (method === 'BANK_TRANSFER' && evidenceUrl) {
        await submitEvidenceAction(order.id, evidenceUrl, referenceNumber);
      }

      // 3. Redirect to Order Confirmation
      router.push(`/orden-confirmada/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al completar el proceso');
      setLoading(false);
    }
  };

  const whatsappMessage = `Hola ${STORE_CONFIG.name}, he realizado el pedido ${order.orderNumber} por un total de $${order.total.toFixed(2)}. Adjunto mi comprobante de pago.`;
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Payment Method Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label
          className={`relative p-5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
            method === 'BANK_TRANSFER'
              ? 'border-black bg-zinc-50 ring-2 ring-black/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-black text-white rounded-lg">
              <Landmark size={20} />
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={method === 'BANK_TRANSFER'}
              onChange={() => setMethod('BANK_TRANSFER')}
              className="w-4 h-4 text-black focus:ring-black"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Transferencia / Depósito Bancario</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Cuentas en Ecuador. Tu pedido se procesa inmediatamente al validar el comprobante.
            </p>
          </div>
        </label>

        <label
          className={`relative p-5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
            method === 'CASH_ON_DELIVERY'
              ? 'border-black bg-zinc-50 ring-2 ring-black/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-black text-white rounded-lg">
              <Banknote size={20} />
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={method === 'CASH_ON_DELIVERY'}
              onChange={() => setMethod('CASH_ON_DELIVERY')}
              className="w-4 h-4 text-black focus:ring-black"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Pago Contra Entrega</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Paga en efectivo al recibir el paquete en tu domicilio (Zonas seleccionadas).
            </p>
          </div>
        </label>
      </div>

      {/* Bank Transfer Detailed Box */}
      {method === 'BANK_TRANSFER' && (
        <div className="space-y-6 pt-4 border-t border-gray-100 animate-fade-in">
          <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200/80 space-y-3 text-xs">
            <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
              Cuentas Bancarias Registradas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-700">
              {STORE_CONFIG.bankAccounts.map((b, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-zinc-200/60 space-y-1">
                  <p className="font-semibold text-black">{b.bankName}</p>
                  <p>{b.accountType}: <strong>{b.accountNumber}</strong></p>
                  <p>Titular: {b.beneficiary}</p>
                  <p>CI/RUC: {b.idDocument}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Upload Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-800 block">
              Subir Comprobante de Pago (Opcional en este paso, puedes enviarlo luego por WhatsApp)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-black rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition">
                <Upload size={24} className="text-gray-400 mb-1.5" />
                <span className="text-xs font-medium text-gray-700">
                  {uploading ? 'Subiendo...' : 'Seleccionar foto del comprobante'}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG o WebP (Máx. 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {evidenceUrl && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-emerald-500 shrink-0">
                  <Image src={evidenceUrl} alt="Comprobante" fill sizes="96px" className="object-cover" />
                  <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Número de Referencia / Comprobante (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: 009847162"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <MessageCircle size={15} /> ¿Prefieres enviar el comprobante directamente por WhatsApp? Haz clic aquí
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleFinishPayment}
        disabled={loading || uploading}
        className="w-full bg-black text-white py-4 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition active:scale-[0.99] disabled:opacity-50 shadow-md"
      >
        {loading ? 'Confirmando...' : 'Finalizar y Confirmar Pedido'}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
