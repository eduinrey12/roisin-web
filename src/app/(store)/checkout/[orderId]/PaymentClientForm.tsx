'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  selectPaymentMethodAction,
  submitEvidenceAction,
  processCardPaymentAction,
} from '@/lib/actions/checkout.actions';
import { STORE_CONFIG } from '@/lib/config/store';
import {
  Landmark,
  Building2,
  CreditCard,
  Upload,
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
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
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'BANK_DEPOSIT' | 'CREDIT_CARD'>(
    'BANK_TRANSFER'
  );
  const [uploading, setUploading] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string>(order.payment?.evidenceUrl || '');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Card Form States
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: order.customerName || '',
    expiryDate: '',
    cvv: '',
    installments: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

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

  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const matches = clean.match(/.{1,4}/g);
    return matches ? matches.join(' ') : clean;
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
    }
    return clean;
  };

  const handleFinishPayment = async () => {
    setLoading(true);
    setError('');

    try {
      if (method === 'CREDIT_CARD') {
        if (!cardData.cardNumber || cardData.cardNumber.replace(/\s+/g, '').length < 15) {
          setError('Ingresa un número de tarjeta válido');
          setLoading(false);
          return;
        }
        if (!cardData.cardHolder.trim()) {
          setError('Ingresa el nombre del titular de la tarjeta');
          setLoading(false);
          return;
        }
        if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
          setError('Ingresa una fecha de expiración válida (MM/AA)');
          setLoading(false);
          return;
        }
        if (!cardData.cvv || cardData.cvv.length < 3) {
          setError('Ingresa el código de seguridad CVV/CVC');
          setLoading(false);
          return;
        }

        const cardRes = await processCardPaymentAction(order.id, cardData);
        if (!cardRes.success) {
          setError(cardRes.error || 'Error al procesar el pago con tarjeta');
          setLoading(false);
          return;
        }

        router.push(`/orden-confirmada/${order.id}`);
        return;
      }

      // Bank Transfer or Bank Deposit
      const payRes = await selectPaymentMethodAction(order.id, method);
      if (!payRes.success) {
        setError(payRes.error || 'Error al registrar el método de pago');
        setLoading(false);
        return;
      }

      if (evidenceUrl) {
        await submitEvidenceAction(order.id, evidenceUrl, referenceNumber);
      }

      router.push(`/orden-confirmada/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al confirmar el pedido');
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

      {/* 1. 3 Payment Method Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Option 1: Bank Transfer */}
        <button
          type="button"
          onClick={() => setMethod('BANK_TRANSFER')}
          className={`p-4 rounded-3xl border text-left cursor-pointer transition flex flex-col justify-between ${
            method === 'BANK_TRANSFER'
              ? 'border-[#3F235F] bg-[#F0E9F5] ring-2 ring-[#7043A0]/40 shadow-xs'
              : 'border-[#DFD0EC] bg-white hover:border-[#7043A0]'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="p-2.5 bg-white rounded-2xl text-[#3F235F] border border-[#DFD0EC] shadow-xs">
              <Landmark size={20} />
            </div>
            {method === 'BANK_TRANSFER' && (
              <span className="w-5 h-5 rounded-full bg-[#3F235F] text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            )}
          </div>
          <div>
            <h3 className="font-sans font-bold text-xs text-zinc-900">Transferencia Bancaria</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Pichincha, Guayaquil, Produbanco o DeUna
            </p>
          </div>
        </button>

        {/* Option 2: Bank Deposit */}
        <button
          type="button"
          onClick={() => setMethod('BANK_DEPOSIT')}
          className={`p-4 rounded-3xl border text-left cursor-pointer transition flex flex-col justify-between ${
            method === 'BANK_DEPOSIT'
              ? 'border-[#3F235F] bg-[#F0E9F5] ring-2 ring-[#7043A0]/40 shadow-xs'
              : 'border-[#DFD0EC] bg-white hover:border-[#7043A0]'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="p-2.5 bg-white rounded-2xl text-[#3F235F] border border-[#DFD0EC] shadow-xs">
              <Building2 size={20} />
            </div>
            {method === 'BANK_DEPOSIT' && (
              <span className="w-5 h-5 rounded-full bg-[#3F235F] text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            )}
          </div>
          <div>
            <h3 className="font-sans font-bold text-xs text-zinc-900">Depósito Bancario</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Pichincha Mi Vecino, Banco del Barrio o Agencias
            </p>
          </div>
        </button>

        {/* Option 3: Credit Card */}
        <button
          type="button"
          onClick={() => setMethod('CREDIT_CARD')}
          className={`p-4 rounded-3xl border text-left cursor-pointer transition flex flex-col justify-between ${
            method === 'CREDIT_CARD'
              ? 'border-[#3F235F] bg-[#F0E9F5] ring-2 ring-[#7043A0]/40 shadow-xs'
              : 'border-[#DFD0EC] bg-white hover:border-[#7043A0]'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="p-2.5 bg-white rounded-2xl text-[#3F235F] border border-[#DFD0EC] shadow-xs">
              <CreditCard size={20} />
            </div>
            {method === 'CREDIT_CARD' && (
              <span className="w-5 h-5 rounded-full bg-[#3F235F] text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            )}
          </div>
          <div>
            <h3 className="font-sans font-bold text-xs text-zinc-900">Tarjeta de Crédito</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Visa, Mastercard, Diners, Amex (Hasta 12 cuotas)
            </p>
          </div>
        </button>
      </div>

      {/* 2. Method 1: Bank Transfer Details */}
      {method === 'BANK_TRANSFER' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#DFD0EC] space-y-5 animate-fade-in">
          <div className="border-b border-[#DFD0EC] pb-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F]">
              Cuentas Oficiales
            </span>
            <h4 className="font-sans font-bold text-base text-zinc-900 mt-0.5">
              Cuentas Bancarias para Transferencia
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#F8F5FA] p-4 rounded-2xl border border-[#DFD0EC] text-xs space-y-1 relative">
              <p className="font-bold text-zinc-900">Banco Pichincha (Cta. Corriente)</p>
              <div className="flex items-center justify-between">
                <p className="text-zinc-700 font-mono font-bold">2100234567</p>
                <button
                  type="button"
                  onClick={() => copyToClipboard('2100234567', 'pichincha')}
                  className="text-[10px] font-bold text-[#3F235F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedAccount === 'pichincha' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedAccount === 'pichincha' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="text-zinc-600">Titular: ROISIN JOYAS S.A.S.</p>
              <p className="text-zinc-500 text-[10px]">RUC: 1792983748001 • joyas@roisin.com</p>
            </div>

            <div className="bg-[#F8F5FA] p-4 rounded-2xl border border-[#DFD0EC] text-xs space-y-1 relative">
              <p className="font-bold text-zinc-900">Banco Guayaquil (Cta. Ahorros)</p>
              <div className="flex items-center justify-between">
                <p className="text-zinc-700 font-mono font-bold">0034567891</p>
                <button
                  type="button"
                  onClick={() => copyToClipboard('0034567891', 'guayaquil')}
                  className="text-[10px] font-bold text-[#3F235F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedAccount === 'guayaquil' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedAccount === 'guayaquil' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="text-zinc-600">Titular: ROISIN JOYAS S.A.S.</p>
              <p className="text-zinc-500 text-[10px]">RUC: 1792983748001 • joyas@roisin.com</p>
            </div>
          </div>

          {/* Upload Receipt */}
          <div className="pt-3 space-y-3">
            <label className="text-xs font-semibold text-zinc-800 block">
              Subir Comprobante de Transferencia (Acelera tu despacho):
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto bg-[#F8F5FA] hover:bg-[#F0E9F5] text-zinc-800 border border-[#DFD0EC] px-5 py-3 rounded-2xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                <Upload size={16} className="text-[#3F235F]" />
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
                className="w-full sm:w-72 px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Method 2: Bank Deposit Details */}
      {method === 'BANK_DEPOSIT' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#DFD0EC] space-y-5 animate-fade-in">
          <div className="border-b border-[#DFD0EC] pb-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F]">
              Puntos de Depósito No Bancarios
            </span>
            <h4 className="font-sans font-bold text-base text-zinc-900 mt-0.5">
              Depósito en Pichincha Mi Vecino, Banco del Barrio o Agencias
            </h4>
          </div>

          <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-2 text-xs">
            <p className="font-semibold text-zinc-800">
              Acércate a cualquier punto corresponsal o agencia bancaria e indica los siguientes datos:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 font-medium">
              <li><strong>Banco Pichincha (Mi Vecino):</strong> Cuenta Corriente # 2100234567</li>
              <li><strong>Banco Guayaquil (Banco del Barrio):</strong> Cuenta Ahorros # 0034567891</li>
              <li><strong>Beneficiario:</strong> ROISIN JOYAS S.A.S. (RUC 1792983748001)</li>
              <li><strong>Monto Exacto:</strong> ${order.total.toFixed(2)}</li>
            </ul>
          </div>

          {/* Upload Receipt */}
          <div className="pt-2 space-y-3">
            <label className="text-xs font-semibold text-zinc-800 block">
              Subir Foto de la Papeleta o Ticket de Depósito:
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto bg-[#F8F5FA] hover:bg-[#F0E9F5] text-zinc-800 border border-[#DFD0EC] px-5 py-3 rounded-2xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                <Upload size={16} className="text-[#3F235F]" />
                {uploading ? 'Subiendo ticket...' : 'Subir Ticket de Depósito'}
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
                  <span>Ticket cargado</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Número de Transacción / Secuencial:
              </label>
              <input
                type="text"
                placeholder="Ej: 004819"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Method 3: Credit Card Form */}
      {method === 'CREDIT_CARD' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#DFD0EC] space-y-5 animate-fade-in">
          <div className="border-b border-[#DFD0EC] pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F]">
                Pasarela Segura Encriptada SSL
              </span>
              <h4 className="font-sans font-bold text-base text-zinc-900 mt-0.5">
                Datos de la Tarjeta de Crédito o Débito
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
              <ShieldCheck size={16} /> 256-bit SSL
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Número de Tarjeta *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardData.cardNumber}
                  onChange={(e) =>
                    setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })
                  }
                  className="w-full pl-11 pr-4 py-3 text-xs font-mono bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
                />
                <CreditCard
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Nombre del Titular (como aparece en la tarjeta) *
              </label>
              <input
                type="text"
                placeholder="MARIA GONZALEZ"
                value={cardData.cardHolder}
                onChange={(e) =>
                  setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })
                }
                className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Vencimiento (MM/AA) *
                </label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  maxLength={5}
                  value={cardData.expiryDate}
                  onChange={(e) =>
                    setCardData({ ...cardData, expiryDate: formatExpiry(e.target.value) })
                  }
                  className="w-full px-4 py-3 text-xs font-mono bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Código de Seguridad (CVV) *
                </label>
                <input
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  value={cardData.cvv}
                  onChange={(e) =>
                    setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-4 py-3 text-xs font-mono bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Diferido / Cuotas de Pago
              </label>
              <select
                value={cardData.installments}
                onChange={(e) =>
                  setCardData({ ...cardData, installments: Number(e.target.value) })
                }
                className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0] font-bold text-zinc-800 cursor-pointer"
              >
                <option value="1">1 pago corriente (${order.total.toFixed(2)})</option>
                <option value="3">3 meses sin intereses (${(order.total / 3).toFixed(2)}/mes)</option>
                <option value="6">6 meses sin intereses (${(order.total / 6).toFixed(2)}/mes)</option>
                <option value="12">12 meses sin intereses (${(order.total / 12).toFixed(2)}/mes)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 5. Final Confirmation CTA */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleFinishPayment}
          disabled={loading || uploading}
          className="w-full btn-purple-diamond py-4 px-8 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition shadow-xl active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading
            ? 'Procesando pago...'
            : method === 'CREDIT_CARD'
            ? `Pagar con Tarjeta • $${order.total.toFixed(2)}`
            : 'Confirmar Pedido & Finalizar'}
          <ArrowRight size={16} />
        </button>

        <div className="text-center pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <MessageCircle size={15} /> ¿Deseas asistencia personalizada por WhatsApp? Haz clic aquí
          </a>
        </div>
      </div>
    </div>
  );
}

