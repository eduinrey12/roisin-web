import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts, getCategories } from '@/services/catalog.service';
import ProductCard from '@/components/storefront/ProductCard';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Star, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <div className="space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-zinc-950 text-white overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop"
            alt="Joyería Fina Roisin"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20 z-0" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8 py-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-[0.25em] text-white">
            <Sparkles size={14} className="text-amber-300" /> Nueva Colección 2026
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white">
            Elegancia que trasciende el tiempo.
          </h1>

          <p className="text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
            Descubre piezas de alta joyería en Plata de Ley 925 y Baño de Oro 18k. Diseños exclusivos pensados para iluminar cada uno de tus momentos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/productos"
              className="w-full sm:w-auto bg-white text-zinc-950 hover:bg-zinc-100 text-xs uppercase tracking-widest font-bold px-8 py-4 rounded-full transition shadow-xl flex items-center justify-center gap-2 active:scale-95"
            >
              Explorar Colección <ArrowRight size={16} />
            </Link>
            <Link
              href="/productos?category=anillos"
              className="w-full sm:w-auto bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 text-xs uppercase tracking-widest font-semibold px-8 py-4 rounded-full transition flex items-center justify-center"
            >
              Ver Anillos de Promesa
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.3em] text-gray-500">
            Categorías Exclusivas
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Encuentra la joya ideal para ti
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?category=${cat.slug}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100 flex items-end p-6"
            >
              <Image
                src={
                  cat.imageUrl ||
                  'https://images.unsplash.com/photo-1605100804763-247f6612d4a5?q=80&w=800&auto=format&fit=crop'
                }
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-zinc-300 font-medium inline-flex items-center gap-1 group-hover:text-white transition">
                  Ver Colección <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.3em] text-gray-500">
              Selección Especial
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
              Piezas Más Vendidas
            </h2>
          </div>
          <Link
            href="/productos"
            className="text-xs uppercase font-bold tracking-widest text-black hover:text-gray-600 transition flex items-center gap-2 border-b-2 border-black pb-1"
          >
            Ver Todo el Catálogo <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                title: p.title,
                slug: p.slug,
                basePrice: p.basePrice,
                category: p.category,
                images: p.images,
                variants: p.variants,
              }}
            />
          ))}
        </div>
      </section>

      {/* 4. Brand Story & Craftsmanship Banner */}
      <section className="bg-zinc-100 py-20 border-y border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase font-bold tracking-[0.3em] text-zinc-500">
                La Promesa Roisin
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-900 leading-tight">
                Cada detalle cuenta una historia de amor y elegancia.
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed font-light">
                En Roisin creemos que una joya no es solo un accesorio, sino un reflejo de tus recuerdos más preciados. Cada pieza es seleccionada y terminada a mano con metales nobles certificados, garantizando brillo perdurable y resistencia para el día a día.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="border-l-2 border-black pl-4">
                  <span className="font-serif text-2xl font-bold text-black">100%</span>
                  <p className="text-xs text-zinc-500 mt-0.5">Plata 925 & Oro 18k Certificado</p>
                </div>
                <div className="border-l-2 border-black pl-4">
                  <span className="font-serif text-2xl font-bold text-black">24-48h</span>
                  <p className="text-xs text-zinc-500 mt-0.5">Entrega Rápida en Ecuador</p>
                </div>
              </div>
            </div>

            <div className="relative aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop"
                alt="Elaboración de Joyas Roisin"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews / Social Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.3em] text-gray-500">
            Opiniones Reales
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Lo que dicen nuestras clientas
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              &ldquo;Compré el anillo de promesa en plata y superó todas mis expectativas. El brillo es espectacular y la cajita de regalo llegó impecable en 24 horas a Quito.&rdquo;
            </p>
            <div>
              <p className="text-xs font-bold text-gray-900">Camila Mendoza</p>
              <span className="text-[10px] text-gray-400">Quito, Ecuador</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              &ldquo;La pulsera tennis tiene una calidad increíble para su precio. Me asesoraron por WhatsApp con la talla correcta y la atención fue de 10.&rdquo;
            </p>
            <div>
              <p className="text-xs font-bold text-gray-900">Valeria Salazar</p>
              <span className="text-[10px] text-gray-400">Guayaquil, Ecuador</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              &ldquo;Excelente experiencia de compra. Pagué por transferencia, envié mi comprobante y al día siguiente ya tenía mi pedido en Cuenca.&rdquo;
            </p>
            <div>
              <p className="text-xs font-bold text-gray-900">Sofía Narváez</p>
              <span className="text-[10px] text-gray-400">Cuenca, Ecuador</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
