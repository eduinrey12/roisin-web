import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-6">
      <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full">
        <CheckCircle2 size={48} />
      </div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">¡Pedido Recibido!</h1>
      <p className="text-xs text-gray-500 max-w-sm mx-auto">
        Gracias por tu compra en ROISIN Joyas. Puedes revisar tus compras y estados desde tu cuenta.
      </p>
      <div className="flex justify-center gap-4 pt-2">
        <Link
          href="/cuenta"
          className="text-xs uppercase tracking-widest font-semibold bg-black text-white px-6 py-3 rounded-full hover:bg-zinc-800 transition"
        >
          Ver Mis Pedidos
        </Link>
        <Link
          href="/productos"
          className="text-xs uppercase tracking-widest font-semibold border border-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition"
        >
          Ver Catálogo
        </Link>
      </div>
    </div>
  );
}
