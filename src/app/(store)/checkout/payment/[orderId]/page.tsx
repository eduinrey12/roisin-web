'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'CASH_ON_DELIVERY'>('BANK_TRANSFER');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/payments/${params.orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method })
      });

      if (res.ok) {
        if (method === 'BANK_TRANSFER') {
          // If bank transfer, they need to submit evidence. For now, we simulate an upload or whatsapp.
          // Let's redirect to success page directly for the MVP, or we can just upload mock evidence.
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/payments/${params.orderId}/evidence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ evidenceUrl: 'http://mock-evidence-url.com/receipt.jpg' })
          });
        }
        router.push('/success');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = `Hola, he realizado el pedido con ID: ${params.orderId}. Adjunto mi comprobante de pago.`;
  const whatsappUrl = `https://wa.me/593999999999?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Método de Pago</h1>
      
      <div className="space-y-6">
        <label className={`block p-6 border rounded-lg cursor-pointer transition ${method === 'BANK_TRANSFER' ? 'border-black bg-gray-50' : 'hover:border-gray-400'}`}>
          <div className="flex items-center gap-4">
            <input 
              type="radio" 
              name="payment" 
              value="BANK_TRANSFER" 
              checked={method === 'BANK_TRANSFER'} 
              onChange={() => setMethod('BANK_TRANSFER')} 
              className="w-5 h-5"
            />
            <div>
              <h3 className="font-semibold text-lg">Transferencia Bancaria</h3>
              <p className="text-sm text-gray-600">Transfiere directamente a nuestra cuenta bancaria. Tu pedido será procesado una vez que se reciba el dinero.</p>
            </div>
          </div>
        </label>

        <label className={`block p-6 border rounded-lg cursor-pointer transition ${method === 'CASH_ON_DELIVERY' ? 'border-black bg-gray-50' : 'hover:border-gray-400'}`}>
          <div className="flex items-center gap-4">
            <input 
              type="radio" 
              name="payment" 
              value="CASH_ON_DELIVERY" 
              checked={method === 'CASH_ON_DELIVERY'} 
              onChange={() => setMethod('CASH_ON_DELIVERY')} 
              className="w-5 h-5"
            />
            <div>
              <h3 className="font-semibold text-lg">Pago contra entrega</h3>
              <p className="text-sm text-gray-600">Paga en efectivo al momento de recibir tu pedido.</p>
            </div>
          </div>
        </label>
      </div>

      {method === 'BANK_TRANSFER' && (
        <div className="mt-8 p-6 bg-blue-50 text-blue-900 rounded-lg">
          <h4 className="font-semibold mb-2">Datos Bancarios</h4>
          <p>Banco Pichincha - Cuenta de Ahorros</p>
          <p>No. 1234567890</p>
          <p>Roisin Joyas - CI: 17xxxxxx</p>
          
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 text-green-700 font-medium underline">
            Opcional: Enviar comprobante por WhatsApp
          </a>
        </div>
      )}

      <button 
        onClick={handleConfirm}
        disabled={loading}
        className="w-full mt-8 bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
      >
        {loading ? 'Procesando...' : 'Confirmar y Finalizar'}
      </button>
    </div>
  );
}
