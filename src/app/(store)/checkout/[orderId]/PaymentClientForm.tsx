'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { selectPaymentMethodAction, submitEvidenceAction } from '@/lib/actions/checkout.actions';
import { STORE_CONFIG } from '@/lib/config/store';
import { Landmark, Banknote, Upload, CheckCircle2, MessageCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

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

      // 2. If transfer and has evidence, submit evidence
      if (method === 'BANK_TRANSFER' && evidenceUrl) {
        await submitEvidenceAction(order.id, evidenceUrl, referenceNumber);
      }

      router.push(`/orden-confirmada/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al confirmar');
      setLoading(false);
    }
  };

  const whatsappMessage = `Hola ${STORE_CONFIG.name}, acabo de generar mi pedido #${order.orderNumber} por un total de $${order.total.toFixed(2)}.`;
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Payment Method Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bank Transfer */}
        <div
          onClick={() => setMethod('BANK_TRANSFER')}
          className={`p-5 rounded-3xl border cursor-pointer transition flex flex-col justify-between ${
            method === 'BANK_TRANSFER'
              ? 'border-[#BE6C7C] bg-[#FAF4F5] ring-1 ring-[#BE6C7C]'
              : 'border-[#F0E6E8] bg-white hover:border-[#EFCFD6]'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white rounded-2xl text-[#BE6C7C] border border-[#EFCFD6] shadow-xs">
              <Landmark size={22} />
            </div>
            {method === 'BANK_TRANSFER' && (
              <span className="w-5 h-5 rounded-full bg-[#BE6C7C] text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
            )}
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-zinc-900">Transferencia Bancaria</h3>
            <p className="text-[11px] text-zinc-500 mt-1">
              Banco Pichincha, Guayaquil, Pacífico, Produbanco o DeUna.
            </p>
          </div>
        </div>

        {/* Cash on Delivery */}
        <div
          onClick={() => setMethod('CASH_ON_DELIVERY')}
          className={`p-5 rounded-3xl border cursor-pointer transition flex flex-col justify-between ${
            method === 'CASH_ON_DELIVERY'
              ? 'border-[#BE6C7C] bg-[#FAF4F5] ring-1 ring-[#BE6C7C]'
              : 'border-[#F0E6E8] bg-white hover:border-[#EFCFD6]'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white rounded-2xl text-[#BE6C7C] border border-[#EFCFD6] shadow-xs">
              <Banknote size={22} />
            </div>
            {method === 'CASH_ON_DELIVERY' && (
              <span className="w-5 h-5 rounded-full bg-[#BE6C7C] text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
            )}
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-zinc-900">Pago Contra Entrega</h3>
            <p className="text-[11px] text-zinc-500 mt-1">
              Paga en efectivo al recibir tu joya (disponible en Quito).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Bank Details Accordion */}
      {method === 'BANK_TRANSFER' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F0E6E8] space-y-5">
          <div className="border-b border-[#F0E6E8] pb-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#BE6C7C]">
              Cuentas Oficiales
            </span>
            <h4 className="font-serif font-bold text-base text-zinc-900 mt-0.5">
              Cuentas Bancarias para Transferencia
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAF4F5] p-4 rounded-2xl border border-[#EFCFD6] text-xs space-y-1">
              <p className="font-bold text-zinc-900">Banco Pichincha (Cta. Corriente)</p>
              <p className="text-zinc-600">No. 2100234567</p>
              <p className="text-zinc-600">Titular: ROISIN JOYAS S.A.S.</p>
              <p className="text-zinc-500 text-[10px]">RUC: 1792983748001</p>
            </div>
            <div className="bg-[#FAF4F5] p-4 rounded-2xl border border-[#EFCFD6] text-xs space-y-1">
              <p className="font-bold text-zinc-900">Banco Guayaquil (Cta. Ahorros)</p>
              <p className="text-zinc-600">No. 0034567891</p>
              <p className="text-zinc-600">Titular: ROISIN JOYAS S.A.S.</p>
              <p className="text-zinc-500 text-[10px]">RUC: 1792983748001</p>
            </div>
          </div>

          {/* Upload Receipt */}
          <div className="pt-3 space-y-3">
            <label className="text-xs font-semibold text-zinc-800 block">
              Subir Comprobante de Transferencia (Opcional, acelera tu despacho):
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto bg-[#FAF4F5] hover:bg-[#F6E8EB] text-zinc-800 border border-[#EFCFD6] px-5 py-3 rounded-2xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                <Upload size={16} className="text-[#BE6C7C]" />
                {uploading ? 'Subiendo imagen...' : 'Seleccionar Comprobante'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {evidenceUrl && (
                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-2xl border border-emerald-200 text-xs">
                  <CheckCircle2 size={16} />
                  <span>Comprobante cargado con éxito</span>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-emerald-300">
                    <Image src={evidenceUrl} alt="Comprobante" fill sizes="96px" className="object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Número de Referencia / Comprobante:
              </label>
              <input
                type="text"
                placeholder="Ej: 98347102"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl focus:outline-none focus:border-[#BE6C7C]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Confirm CTA */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleFinishPayment}
          disabled={loading || uploading}
          className="w-full bg-zinc-900 hover:bg-black text-white py-4 px-8 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition shadow-md active:scale-[0.99] disabled:opacity-50 shimmer-button"
        >
          {loading ? 'Confirmando pedido...' : 'Confirmar Pedido & Proceder'}
          <ArrowRight size={16} />
        </button>

        <div className="text-center pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <MessageCircle size={15} /> ¿Prefieres enviar el comprobante por WhatsApp? Haz clic aquí
          </a>
        </div>
      </div>
    </div>
  );
}
