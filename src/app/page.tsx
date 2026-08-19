import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts, getCategories, getPromotions } from '@/services/catalog.service';
import ProductCard from '@/components/storefront/ProductCard';
import { ArrowRight, Sparkles, Truck, Gift, Star, Tag, CheckCircle2, Flame } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredProducts, categories, promotions] = await Promise.all([
    getFeaturedProducts(9),
    getCategories(),
    getPromotions(),
  ]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. TOP CATEGORY BAR (Starts with Descuentos, followed by all categories) */}
      <section className="border-b border-[#DFD0EC] bg-[#F8F5FA]/80 backdrop-blur-xs py-3 sticky top-[80px] z-30 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {/* 1st Item: Descuentos */}
            <Link
              href="/productos?ofertas=true"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#3F235F] to-[#7043A0] text-white text-xs uppercase font-extrabold tracking-wider shadow-xs hover:shadow-md transition active:scale-95"
            >
              <Flame size={14} className="text-amber-300 fill-amber-300" />
              <span>Descuentos</span>
            </Link>

            {/* Categories */}
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?category=${cat.slug}`}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#F0E9F5] border border-[#DFD0EC] text-zinc-800 hover:text-[#3F235F] hover:border-[#7043A0] text-xs uppercase font-bold tracking-wider transition shadow-2xs"
              >
                <span>{cat.name}</span>
              </Link>
            ))}

            {/* Ver Catálogo */}
            <Link
              href="/productos"
              className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white hover:bg-[#F0E9F5] border border-[#DFD0EC] text-zinc-600 hover:text-[#3F235F] text-xs uppercase font-bold tracking-wider transition shadow-2xs"
            >
              <span>Ver Todo</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC PROMOTIONAL BANNER (Horizontal/Square Promo Cards Grid from Promotion table) */}
      {promotions.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RoisinDiamond size={15} color="#7043A0" />
                <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-[#3F235F]">
                  Promociones & Destacados
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">Desliza para ver más</span>
            </div>

            {/* Horizontal Promo Cards Carousel / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {promotions.map((promo) => (
                <Link
                  key={promo.id}
                  href={promo.targetUrl}
                  className="group relative aspect-[4/3.2] sm:aspect-[4/3.5] rounded-3xl overflow-hidden border border-[#DFD0EC] shadow-sm hover:shadow-xl hover:border-[#7043A0] transition-all duration-300 flex flex-col justify-end p-5 bg-[#221235]"
                >
                  <Image
                    src={promo.imageUrl}
                    alt={promo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-106 transition-transform duration-700 opacity-80 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#221235]/95 via-[#221235]/40 to-transparent" />

                  {/* Promo Badges */}
                  <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      {promo.badge && (
                        <span className="bg-white/95 text-[#3F235F] text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-xs">
                          {promo.badge}
                        </span>
                      )}
                      {promo.discountText && (
                        <span className="bg-gradient-to-r from-[#7043A0] to-[#3F235F] text-white text-[9.5px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-sm">
                          {promo.discountText}
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans text-base sm:text-lg font-bold text-white leading-snug group-hover:text-[#DFD0EC] transition-colors">
                      {promo.title}
                    </h3>
                    {promo.subtitle && (
                      <p className="text-[11px] text-zinc-300 font-light line-clamp-1">
                        {promo.subtitle}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#DFD0EC] group-hover:text-white pt-1">
                      Aprovechar Promoción <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. BRAND VALUE PILLARS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-xs flex items-center gap-4 diamond-glow">
            <div className="p-3 bg-[#F8F5FA] rounded-2xl text-[#3F235F] border border-[#DFD0EC] shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-sans text-sm sm:text-base font-bold text-zinc-900">
                Metales Nobles Certificados
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5 font-light">
                Plata de Ley 925 auténtica & Baño de Oro 18k hipoalergénico.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-xs flex items-center gap-4 diamond-glow">
            <div className="p-3 bg-[#F8F5FA] rounded-2xl text-[#3F235F] border border-[#DFD0EC] shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-sans text-sm sm:text-base font-bold text-zinc-900">
                Envíos Rápidos en Ecuador
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5 font-light">
                Entregas seguras en Guayaquil ($3), Nacional ($6) y Galápagos ($12).
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-xs flex items-center gap-4 diamond-glow">
            <div className="p-3 bg-[#F8F5FA] rounded-2xl text-[#3F235F] border border-[#DFD0EC] shrink-0">
              <Gift size={24} />
            </div>
            <div>
              <h4 className="font-sans text-sm sm:text-base font-bold text-zinc-900">
                Presentación & Dedicatoria
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5 font-light">
                Caja de regalo de lujo y tarjeta con mensaje personalizado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED BEST-SELLERS (First product spans 2 vertical rows, remaining compact) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-[#DFD0EC] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-[0.3em] text-[#3F235F]">
              <RoisinDiamond size={13} color="#7043A0" /> Selección Especial
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mt-1">
              Piezas Más Deseadas
            </h2>
          </div>
          {/* Removed parenthesized count as requested in Requirement 6 */}
          <Link
            href="/productos"
            className="text-xs uppercase font-bold tracking-widest text-[#3F235F] hover:text-[#7043A0] transition-all flex items-center gap-2 group px-4 py-2.5 bg-[#F8F5FA] hover:bg-[#F0E9F5] rounded-full border border-[#DFD0EC] shadow-2xs"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Asymmetrical Grid: First product larger spanning 2 vertical rows on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 auto-rows-fr">
          {featuredProducts.map((p, index) => (
            <div
              key={p.id}
              className={
                index === 0
                  ? 'col-span-2 md:col-span-2 md:row-span-2 flex flex-col'
                  : 'flex flex-col'
              }
            >
              <ProductCard
                featuredLarge={index === 0}
                product={{
                  id: p.id,
                  title: p.title,
                  slug: p.slug,
                  tag: p.tag,
                  shortDescription: p.shortDescription,
                  basePrice: p.basePrice,
                  compareAtPrice: p.compareAtPrice,
                  discountPercent: p.discountPercent,
                  category: p.category,
                  images: p.images,
                  variants: p.variants,
                  description: p.description,
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. THE PERFECT GIFT / DEDICATION EXPERIENCE BANNER */}
      <section className="bg-[#F8F5FA] py-16 sm:py-20 border-y border-[#DFD0EC] relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-[#DFD0EC] text-[10px] uppercase font-bold tracking-widest text-[#3F235F] shadow-xs">
                <Sparkles size={13} className="text-[#7043A0]" /> Experiencia Diamante Morado
              </div>
              <h2 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
                El detalle perfecto con dedicatoria personalizada.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                Cada joya de Roisin llega en un empaque cuidado hasta el último detalle: caja rígida grabada, lazo de seda y tarjeta para dedicatoria personalizada que puedes escribir directamente al agregar tu joya.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                  <CheckCircle2 size={16} className="text-[#3F235F]" />
                  <span>Garantía de autenticidad en plata 925 y baño de oro 18k</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                  <CheckCircle2 size={16} className="text-[#3F235F]" />
                  <span>Dedicatoria personalizada incluida en la orden</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                  <CheckCircle2 size={16} className="text-[#3F235F]" />
                  <span>Asesoría directa para elegir la talla ideal</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 btn-purple-diamond text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded-full transition shadow-md cursor-pointer"
                >
                  Elegir Joya para Regalo <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-[#DFD0EC]">
              <Image
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop"
                alt="Empaque de Regalo Roisin Diamante Morado"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER EXPERIENCES / TESTIMONIALS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.3em] text-[#3F235F]">
            Experiencias Reales
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900">
            Clientas que brillan con ROISIN
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-3.5 luxury-card-hover diamond-glow">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed italic font-light">
              &ldquo;Compré el anillo solitario en plata y el brillo es simplemente espectacular. La presentación para regalo superó mis expectativas y llegó muy rápido a Guayaquil.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#F8F5FA]">
              <p className="text-xs font-bold text-zinc-900">Camila M.</p>
              <span className="text-[10px] text-zinc-400">Guayaquil, Ecuador</span>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-3.5 luxury-card-hover diamond-glow">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed italic font-light">
              &ldquo;La pulsera tennis tiene un acabado finísimo y un peso perfecto. Me ayudaron con la medida por WhatsApp y la atención fue sumamente cálida y atenta.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#F8F5FA]">
              <p className="text-xs font-bold text-zinc-900">Valeria S.</p>
              <span className="text-[10px] text-zinc-400">Quito, Ecuador</span>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-3.5 luxury-card-hover diamond-glow">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed italic font-light">
              &ldquo;Los aretes huggies no me los quito para nada; son súper cómodos, no pesan y no pierden el brillo. 100% recomendados para cualquier ocasión.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#F8F5FA]">
              <p className="text-xs font-bold text-zinc-900">Sofía N.</p>
              <span className="text-[10px] text-zinc-400">Cuenca, Ecuador</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

