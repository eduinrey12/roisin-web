import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre ROISIN | Nuestra Historia y Compromiso con la Joyería Fina',
  description:
    'Conoce la historia detrás de ROISIN Joyas y Accesorios. Compromiso con la calidad en Plata 925, baño de oro 18k y atención personalizada en Ecuador.',
};

export default function AboutPage() {
  return (
    <div className="space-y-20 sm:space-y-24 pb-20">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-[#141415] text-white overflow-hidden text-center px-4">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop"
            alt="Taller de Joyería"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4 py-20">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.3em] text-[#E2A3B0]">
            <RoisinDiamond size={13} color="#E2A3B0" /> Nuestra Esencia
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight">
            El arte de crear <br />
            <span className="italic font-normal text-[#F6E8EB]">momentos inolvidables</span>
          </h1>
          <p className="text-xs sm:text-base text-zinc-300 max-w-xl mx-auto font-light leading-relaxed">
            ROISIN nace de la pasión por las piezas elegantes, duraderas y con un significado profundo para celebrar el amor y los instantes especiales.
          </p>
        </div>
      </section>

      {/* Story Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl border border-[#EFCFD6]">
            <Image
              src="https://images.unsplash.com/photo-1605100804763-247f6612d4a5?q=80&w=1000&auto=format&fit=crop"
              alt="Anillos y Collares Roisin"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#BE6C7C] block">
              Calidad & Pasión Artesanal
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 leading-snug">
              Materiales nobles, acabados de lujo y cercanía
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Cada una de nuestras joyas es seleccionada con rigurosos estándares de calidad. Utilizamos auténtica Plata de Ley 925, circones de corte suizo de alto brillo y baños de oro de 18 quilates con capas protectoras que conservan el acabado.
            </p>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Nuestra misión es ofrecerte piezas que te acompañen en aniversarios, promesas de amor, regalos inolvidables o simplemente en tu día a día, haciéndote sentir única y deslumbrante.
            </p>

            <div className="space-y-3 pt-2 text-xs font-medium text-zinc-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-[#BE6C7C]" />
                <span>100% Plata de Ley 925 Certificada & Baño de Oro 18k</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-[#BE6C7C]" />
                <span>Empaque de regalo exclusivo con lazo y tarjeta para dedicatoria</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-[#BE6C7C]" />
                <span>Envíos rápidos y asegurados con Servientrega a todo el Ecuador</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-zinc-900 text-white px-8 py-4 rounded-full hover:bg-black transition shadow-md shimmer-button"
              >
                Explorar Colección <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
