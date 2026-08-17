import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import RoisinLogo from '@/components/branding/RoisinLogo';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#FAD1DC] shadow-xl">
        <div className="flex justify-center">
          <div className="p-4 bg-[#FFF5F7] rounded-full border border-[#FAD1DC] shadow-xs">
            <RoisinDiamond size={42} color="#E65573" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#D33658] block">
            Página No Encontrada • Error 404
          </span>
          <h1 className="font-serif text-3xl font-bold text-zinc-900">
            Esta joya no está disponible
          </h1>
          <p className="text-xs text-zinc-500 font-light leading-relaxed">
            La página o joya que buscas no existe o ha sido reubicada en una nueva colección.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/productos"
            className="btn-pink-diamond py-4 px-6 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-md shimmer-button"
          >
            <ShoppingBag size={15} /> Explorar Joyería
          </Link>
          <Link
            href="/"
            className="btn-pink-outline py-3.5 px-6 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
