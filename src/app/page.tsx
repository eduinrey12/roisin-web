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
    getFeaturedProducts(12),
    getCategories(),
  ]);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* 1. Luminous Pink Diamond Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center bg-[#1A1115] text-white overflow-hidden">
        {/* Background Image with Radiant Ambient Lighting */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop"
            alt="ROISIN Joyería Fina"
            fill
            priority
            className="object-cover object-center scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1115] via-[#1A1115]/65 to-[#1A1115]/30 z-0" />
        <div className="absolute inset-0 bg-radial from-[#F08097]/15 via-transparent to-transparent z-0" />

        {/* Floating Delicate Diamond Geometric Decor */}
        <div className="absolute top-1/4 left-12 opacity-30 hidden lg:block animate-float">
          <RoisinDiamond size={64} color="#F08097" />
        </div>
        <div className="absolute bottom-1/4 right-14 opacity-30 hidden lg:block animate-float-delayed">
          <RoisinDiamond size={84} color="#F08097" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 py-20">
          {/* Radiant Diamond Badge */}
          <div className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md px-5 py-2 rounded-full border border-[#FAD1DC]/50 text-xs font-bold uppercase tracking-[0.28em] text-[#FFF5F7] shadow-md">
            <RoisinDiamond size={14} color="#F08097" /> Colección Diamante Rosa 2026
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] text-white">
            Elegancia que celebra <br />
            <span className="italic font-normal text-[#FAD1DC]">tu historia de amor.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-200 max-w-2xl mx-auto font-light leading-relaxed">
            Alta joyería en Plata de Ley 925 y Baño de Oro 18k. Diseños creados para momentos inolvidables, promesas eternas y detalles que deslumbran.
          </p>

          {/* Call to Actions with Vibrant Pink Diamond Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/productos"
              className="w-full sm:w-auto btn-pink-diamond text-xs uppercase tracking-widest font-extrabold px-10 py-4.5 rounded-full transition shadow-xl flex items-center justify-center gap-2 active:scale-95 shimmer-button"
            >
              Explorar Joyas <ArrowRight size={16} />
            </Link>
            <Link
              href="/productos?category=anillos"
              className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-[#FAD1DC]/60 text-xs uppercase tracking-widest font-bold px-9 py-4.5 rounded-full transition flex items-center justify-center backdrop-blur-xs shadow-sm hover:border-[#E65573]"
            >
              Anillos de Promesa
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Brand Value Pillars (Romance & Trust) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 -mt-12 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="bg-white p-7 rounded-3xl border border-[#FAD1DC] shadow-sm flex items-center gap-4.5 diamond-glow">
            <div className="p-3.5 bg-[#FFF5F7] rounded-2xl text-[#D33658] border border-[#FAD1DC] shrink-0">
              <Sparkles size={26} />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-zinc-900">Metales Nobles Certificados</h4>
              <p className="text-xs text-zinc-500 mt-0.5 font-light">Plata de Ley 925 auténtica & Baño de Oro 18k hipoalergénico.</p>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-[#FAD1DC] shadow-sm flex items-center gap-4.5 diamond-glow">
            <div className="p-3.5 bg-[#FFF5F7] rounded-2xl text-[#D33658] border border-[#FAD1DC] shrink-0">
              <Truck size={26} />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-zinc-900">Envíos Rápidos en Ecuador</h4>
              <p className="text-xs text-zinc-500 mt-0.5 font-light">Entregas seguras en 24h a 48h con seguimiento directo.</p>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-[#FAD1DC] shadow-sm flex items-center gap-4.5 diamond-glow">
            <div className="p-3.5 bg-[#FFF5F7] rounded-2xl text-[#D33658] border border-[#FAD1DC] shrink-0">
              <Gift size={26} />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-zinc-900">Presentación para Regalo</h4>
              <p className="text-xs text-zinc-500 mt-0.5 font-light">Cajas de lujo y lazo de seda listas para sorprender.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.3em] text-[#D33658]">
            <RoisinDiamond size={13} color="#E65573" /> Colecciones Exclusivas
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Descubre la joya perfecta
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-light">
            Seleccionadas meticulosamente para realzar tu belleza y celebrar momentos únicos.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?category=${cat.slug}`}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xs border border-[#FAD1DC] bg-zinc-100 flex items-end p-5 sm:p-7 luxury-card-hover"
            >
              <Image
                src={
                  cat.imageUrl ||
                  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop'
                }
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-106 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="relative z-10 space-y-1.5 w-full">
                <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#FAD1DC]">
                  <RoisinDiamond size={10} color="#F08097" /> Joyería Fina
                </div>
                <h3 className="font-serif text-base sm:text-xl font-bold text-white tracking-wide">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-[#FFF5F7] font-semibold inline-flex items-center gap-1 group-hover:text-[#FAD1DC] transition pt-1">
                  Ver Colección <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Best-Sellers (Product Cards Grid) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4 border-b border-[#FAD1DC] pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.3em] text-[#D33658]">
              Selección Especial
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 mt-1">
              Piezas Más Deseadas
            </h2>
          </div>
          <Link
            href="/productos"
            className="text-xs uppercase font-bold tracking-widest text-[#D33658] hover:text-[#93203A] transition flex items-center gap-2 border-b border-[#E65573] pb-1"
          >
            Ver Catálogo Completo ({featuredProducts.length} joyas) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
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
      <section className="bg-[#FFF5F7] py-20 sm:py-24 border-y border-[#FAD1DC] relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-[#FAD1DC] text-[10px] uppercase font-bold tracking-widest text-[#D33658] shadow-xs">
                <Heart size={13} className="fill-[#E65573] text-[#E65573]" /> Momentos Inolvidables
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-900 leading-tight">
                El detalle perfecto para quien hace latir tu corazón.
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed font-light">
                Cada joya de Roisin llega en un empaque cuidado hasta el último detalle: caja rígida grabada, lazo de seda y tarjeta para dedicatoria personalizada. Porque regalar una joya es entregar un recuerdo para siempre.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                  <CheckCircle2 size={16} className="text-[#D33658]" />
                  <span>Garantía de autenticidad en plata 925 y baño de oro 18k</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                  <CheckCircle2 size={16} className="text-[#D33658]" />
                  <span>Opción de caja de regalo de lujo y bolsa de terciopelo rosa</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                  <CheckCircle2 size={16} className="text-[#D33658]" />
                  <span>Asesoría personalizada por WhatsApp para elegir la talla ideal</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 btn-pink-diamond text-xs uppercase tracking-widest font-bold px-9 py-4 rounded-full transition shadow-md shimmer-button"
                >
                  Elegir Joya para Regalo <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl border border-[#FAD1DC]">
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
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.3em] text-[#D33658]">
            Experiencias Reales
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Clientas que brillan con ROISIN
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-4 luxury-card-hover diamond-glow">
            <div className="flex text-[#E5C058]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed italic font-light">
              &ldquo;Compré el anillo solitario en plata y el brillo es simplemente espectacular. La presentación para regalo superó mis expectativas y llegó en menos de 24h a Quito.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#FFF5F7]">
              <p className="text-xs font-bold text-zinc-900">Camila M.</p>
              <span className="text-[10px] text-zinc-400">Quito, Ecuador</span>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-4 luxury-card-hover diamond-glow">
            <div className="flex text-[#E5C058]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed italic font-light">
              &ldquo;La pulsera tennis tiene un acabado finísimo y un peso perfecto. Me ayudaron con la medida por WhatsApp y la atención fue sumamente cálida y atenta.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#FFF5F7]">
              <p className="text-xs font-bold text-zinc-900">Valeria S.</p>
              <span className="text-[10px] text-zinc-400">Guayaquil, Ecuador</span>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-4 luxury-card-hover diamond-glow">
            <div className="flex text-[#E5C058]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed italic font-light">
              &ldquo;Los aretes huggies no me los quito para nada; son súper cómodos, no pesan y no pierden el brillo. 100% recomendados para cualquier ocasión.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#FFF5F7]">
              <p className="text-xs font-bold text-zinc-900">Sofía N.</p>
              <span className="text-[10px] text-zinc-400">Cuenca, Ecuador</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
