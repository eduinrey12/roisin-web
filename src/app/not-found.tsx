import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#DFD0EC] shadow-xl">
        <div className="flex justify-center">
          <div className="p-4 bg-[#F8F5FA] rounded-full border border-[#DFD0EC] shadow-xs">
            <RoisinDiamond size={42} color="#7043A0" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F] block">
            Página No Encontrada • Error 404
          </span>
          <h1 className="font-sans text-3xl font-bold text-zinc-900">
            Esta joya no está disponible
          </h1>
          <p className="text-xs text-zinc-500 font-light leading-relaxed">
            La página o joya que buscas no existe o ha sido reubicada en una nueva colección.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/productos"
            className="btn-purple-diamond py-3.5 px-6 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <ShoppingBag size={15} /> Explorar Joyería
          </Link>
          <Link
            href="/"
            className="btn-purple-outline py-3 px-6 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

