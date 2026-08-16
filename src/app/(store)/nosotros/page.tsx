import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre ROISIN | Nuestra Historia y Compromiso con la Joyería Fina',
  description:
    'Conoce la historia detrás de ROISIN Joyas y Accesorios. Compromiso con la calidad en Plata 925, baño de oro 18k y atención personalizada en Ecuador.',
};

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center justify-center bg-zinc-950 text-white overflow-hidden text-center px-4">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop"
            alt="Taller de Joyería"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4 py-16">
          <span className="text-xs uppercase font-bold tracking-[0.3em] text-zinc-400">
            Nuestra Esencia
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold">
            El arte de crear momentos inolvidables
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto font-light leading-relaxed">
            ROISIN nace de la pasión por las piezas elegantes, duraderas y con un significado profundo para quien las lleva.
          </p>
        </div>
      </section>

      {/* Story Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl border border-zinc-100">
            <Image
              src="https://images.unsplash.com/photo-1605100804763-247f6612d4a5?q=80&w=1000&auto=format&fit=crop"
              alt="Anillos y Collares Roisin"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-gray-500">
              Calidad y Pasión
            </span>
            <h2 className="font-serif text-3xl font-bold text-gray-900 leading-snug">
              Materiales nobles, acabados de lujo y accesibilidad
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed font-light">
              Cada una de nuestras joyas es seleccionada con rigurosos estándares de calidad. Utilizamos auténtica Plata de Ley 925, circones de corte diamante y baños de oro de 18 quilates con capas protectoras que evitan el oscurecimiento prematuro.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed font-light">
              Nuestra misión es ofrecerte piezas que te acompañen en graduaciones, aniversarios, declaraciones de amor o simplemente en tu día a día, haciéndote sentir única y especial.
            </p>

            <div className="pt-2">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-black text-white px-8 py-3.5 rounded-full hover:bg-zinc-800 transition shadow-sm"
              >
                Ver Colección <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
