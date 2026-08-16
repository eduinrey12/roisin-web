import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts, getCategories } from '@/services/catalog.service';
import ProductCard from '@/components/storefront/ProductCard';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Star, Truck, Gift, CheckCircle2 } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { STORE_CONFIG } from '@/lib/config/store';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* 1. Romantic Luxury Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center bg-[#141415] text-white overflow-hidden">
        {/* Background Image with Warm Vignette */}
        <div className="absolute inset-0 z-0 opacity-35">
          <Image
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop"
            alt="ROISIN Joyería Fina"
            fill
            priority
            className="object-cover object-center scale-105 animate-pulse-slow"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141415] via-[#141415]/60 to-[#141415]/30 z-0" />

        {/* Floating Delicate Diamond Geometric Decor */}
        <div className="absolute top-1/4 left-10 opacity-20 hidden lg:block animate-float">
          <RoisinDiamond size={60} color="#E2A3B0" />
        </div>
        <div className="absolute bottom-1/4 right-12 opacity-20 hidden lg:block animate-float-delayed">
          <RoisinDiamond size={80} color="#E2A3B0" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7 py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#E2A3B0]/40 text-xs font-semibold uppercase tracking-[0.25em] text-[#F6E8EB] shadow-xs">
            <RoisinDiamond size={13} color="#E2A3B0" /> Colección Exclusiva 2026
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white">
            Elegancia que celebra <br />
            <span className="italic font-normal text-[#F6E8EB]">tu historia de amor.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
            Piezas de alta joyería en Plata de Ley 925 y Baño de Oro 18k. Diseños creados para momentos inolvidables, promesas y detalles especiales.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-3">
            <Link
              href="/productos"
              className="w-full sm:w-auto bg-[#E2A3B0] hover:bg-[#D28695] text-zinc-950 text-xs uppercase tracking-widest font-extrabold px-9 py-4 rounded-full transition shadow-lg flex items-center justify-center gap-2 active:scale-95 shimmer-button"
            >
              Explorar Joyas <ArrowRight size={16} />
            </Link>
            <Link
              href="/productos?category=anillos"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs uppercase tracking-widest font-semibold px-8 py-4 rounded-full transition flex items-center justify-center backdrop-blur-xs"
            >
              Anillos de Promesa
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Brand Value Pillars (Romance & Trust) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EFCFD6] shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-[#FAF4F5] rounded-xl text-[#BE6C7C] border border-[#EFCFD6]/60 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-zinc-900">Metales Nobles Certificados</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Plata de Ley 925 auténtica & Baño de Oro 18k hipoalergénico.</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EFCFD6] shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-[#FAF4F5] rounded-xl text-[#BE6C7C] border border-[#EFCFD6]/60 shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-zinc-900">Envíos Rápidos en Ecuador</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Entregas seguras en 24h a 48h con seguimiento directo.</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EFCFD6] shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-[#FAF4F5] rounded-xl text-[#BE6C7C] border border-[#EFCFD6]/60 shrink-0">
              <Gift size={24} />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-zinc-900">Presentación para Regalo</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Cajas de lujo y cinta satinada listas para sorprender.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.3em] text-[#BE6C7C]">
            <RoisinDiamond size={12} color="#E2A3B0" /> Colecciones Exclusivas
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Descubre la joya perfecta
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Seleccionadas meticulosamente para realzar tu belleza y estilo.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?category=${cat.slug}`}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xs border border-[#F0E6E8] bg-zinc-100 flex items-end p-5 sm:p-6 luxury-card-hover"
            >
              <Image
                src={
                  cat.imageUrl ||
                  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop'
                }
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 space-y-1 w-full">
                <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#E2A3B0]">
                  <RoisinDiamond size={9} color="#E2A3B0" /> Joyería Fina
                </div>
                <h3 className="font-serif text-base sm:text-xl font-bold text-white tracking-wide">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-zinc-300 font-medium inline-flex items-center gap-1 group-hover:text-white transition pt-1">
                  Ver Colección <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Best-Sellers (Product Cards Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4 border-b border-[#F0E6E8] pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.3em] text-[#BE6C7C]">
              Selección Especial
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 mt-1">
              Piezas Más Deseadas
            </h2>
          </div>
          <Link
            href="/productos"
            className="text-xs uppercase font-bold tracking-widest text-zinc-800 hover:text-[#BE6C7C] transition flex items-center gap-2 border-b border-zinc-800 pb-1"
          >
            Ver Todo el Catálogo <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                description: p.description,
              }}
            />
          ))}
        </div>
      </section>

      {/* 5. The Perfect Gift / Romance Experience Banner */}
      <section className="bg-[#FAF4F5] py-20 sm:py-24 border-y border-[#EFCFD6]/70 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1 rounded-full border border-[#EFCFD6] text-[10px] uppercase font-bold tracking-widest text-[#BE6C7C]">
                <Heart size={12} className="fill-[#E2A3B0] text-[#E2A3B0]" /> Momentos Inolvidables
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-900 leading-tight">
                El detalle perfecto para quien hace latir tu corazón.
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed font-light">
                Cada joya de Roisin llega en un empaque cuidado hasta el último detalle: caja rígida grabada, lazo de seda y tarjeta para dedicatoria personalizada. Porque regalar una joya es entregar un recuerdo para siempre.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                  <CheckCircle2 size={16} className="text-[#BE6C7C]" />
                  <span>Garantía de autenticidad en plata 925 y baño de oro 18k</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                  <CheckCircle2 size={16} className="text-[#BE6C7C]" />
                  <span>Opción de caja de regalo de lujo y bolsa de terciopelo</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                  <CheckCircle2 size={16} className="text-[#BE6C7C]" />
                  <span>Asesoría personalizada por WhatsApp para elegir la talla ideal</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-black text-white text-xs uppercase tracking-widest font-bold px-8 py-4 rounded-full transition shadow-md"
                >
                  Elegir Regalo <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl border border-[#EFCFD6]">
              <Image
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop"
                alt="Empaque de Regalo Roisin"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Experiences / Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.3em] text-[#BE6C7C]">
            Experiencias Reales
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Clientas que brillan con ROISIN
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#EFCFD6] shadow-xs space-y-4 luxury-card-hover">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed italic">
              &ldquo;Compré el anillo solitario en plata y el brillo es simplemente espectacular. La presentación para regalo superó mis expectativas y llegó en menos de 24h a Quito.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#FAF4F5]">
              <p className="text-xs font-bold text-zinc-900">Camila M.</p>
              <span className="text-[10px] text-zinc-400">Quito, Ecuador</span>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#EFCFD6] shadow-xs space-y-4 luxury-card-hover">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed italic">
              &ldquo;La pulsera tennis tiene un acabado finísimo y un peso perfecto. Me ayudaron con la medida por WhatsApp y la atención fue sumamente cálida y atenta.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#FAF4F5]">
              <p className="text-xs font-bold text-zinc-900">Valeria S.</p>
              <span className="text-[10px] text-zinc-400">Guayaquil, Ecuador</span>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#EFCFD6] shadow-xs space-y-4 luxury-card-hover">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed italic">
              &ldquo;Los aretes huggies no me los quito para nada; son súper cómodos, no pesan y no pierden el brillo. 100% recomendados para cualquier ocasión.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#FAF4F5]">
              <p className="text-xs font-bold text-zinc-900">Sofía N.</p>
              <span className="text-[10px] text-zinc-400">Cuenca, Ecuador</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
