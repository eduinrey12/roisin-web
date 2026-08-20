import Link from 'next/link';
import Image from 'next/image';
import {
  getCategories,
  getPromotions,
  getFeaturedProducts,
  getNewArrivals,
  getReviews,
  getFaqs,
} from '@/services/catalog.service';
import PromotionsCarousel from '@/components/storefront/PromotionsCarousel';
import BrandPillarsSection from '@/components/storefront/BrandPillarsSection';
import FeaturedDestacadosSection from '@/components/storefront/FeaturedDestacadosSection';
import ReviewsSection from '@/components/storefront/ReviewsSection';
import NewArrivalsSection from '@/components/storefront/NewArrivalsSection';
import FaqSection from '@/components/storefront/FaqSection';
import SocialFeedSection from '@/components/storefront/SocialFeedSection';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { Flame, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    categories,
    promotions,
    featuredProducts,
    newArrivals,
    reviews,
    faqs,
  ] = await Promise.all([
    getCategories(),
    getPromotions(),
    getFeaturedProducts(7),
    getNewArrivals(8),
    getReviews(6),
    getFaqs(),
  ]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 overflow-x-hidden">
      {/* 1. TOP CATEGORY BAR (Centered alignment on all viewports) */}
      <section className="border-b border-[#DFD0EC] bg-[#F8F5FA] py-2.5 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-0.5">
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
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#F0E9F5] border border-[#DFD0EC] text-zinc-800 hover:text-[#3F235F] hover:border-[#7043A0] text-xs uppercase font-bold tracking-wider transition shadow-2xs active:scale-95"
              >
                <span>{cat.name}</span>
              </Link>
            ))}

            {/* Ver Catálogo */}
            <Link
              href="/productos"
              className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white hover:bg-[#F0E9F5] border border-[#DFD0EC] text-zinc-600 hover:text-[#3F235F] text-xs uppercase font-bold tracking-wider transition shadow-2xs active:scale-95"
            >
              <span>Ver Todo</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC PROMOTIONAL BANNER CAROUSEL (No title, clean graphic banner, ver más hover, side arrows) */}
      {promotions.length > 0 && (
        <ScrollReveal direction="up">
          <PromotionsCarousel promotions={promotions} />
        </ScrollReveal>
      )}

      {/* 3. BRAND VALUE INFORMATION CARDS (Titles only, deep luxury purple diamond background) */}
      <ScrollReveal direction="up" delay={100}>
        <BrandPillarsSection />
      </ScrollReveal>

      {/* 4. EXPERIENCIA DIAMANTE MORADO (Product & gift dedication presentation) */}
      <ScrollReveal direction="up" delay={100}>
        <section className="bg-[#F8F5FA] py-16 sm:py-20 border-y border-[#DFD0EC] relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-[#DFD0EC] text-[10px] uppercase font-bold tracking-widest text-[#3F235F] shadow-xs">
                  <Sparkles size={13} className="text-[#7043A0]" />
                  <span>Experiencia Diamante Morado</span>
                </div>
                <h2 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
                  El detalle perfecto con dedicatoria personalizada.
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                  Cada joya de Roisin llega en un empaque cuidado hasta el último detalle: caja rígida grabada, lazo de seda y tarjeta para dedicatoria personalizada que puedes escribir directamente al agregar tu joya.
                </p>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                    <CheckCircle2 size={16} className="text-[#3F235F] shrink-0" />
                    <span>Garantía de autenticidad en plata 925 y baño de oro 18k</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                    <CheckCircle2 size={16} className="text-[#3F235F] shrink-0" />
                    <span>Dedicatoria personalizada incluida en cada orden de regalo</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                    <CheckCircle2 size={16} className="text-[#3F235F] shrink-0" />
                    <span>Asesoría directa y personalizada para elegir tu talla ideal</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/productos"
                    className="inline-flex items-center gap-2 btn-purple-diamond text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded-full transition shadow-md cursor-pointer"
                  >
                    <span>Elegir Joya para Regalo</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-[#DFD0EC]">
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
      </ScrollReveal>

      {/* 5. DESTACADOS (Bento grid: 1 large card of 2 rows + 6 compact items) */}
      <ScrollReveal direction="up" delay={100}>
        <FeaturedDestacadosSection products={featuredProducts} />
      </ScrollReveal>

      {/* 6. RESEÑAS (Customer reviews with photos and videos from Database) */}
      {reviews.length > 0 && (
        <ScrollReveal direction="up" delay={100}>
          <ReviewsSection reviews={reviews} />
        </ScrollReveal>
      )}

      {/* 7. NUEVOS PRODUCTOS (Latest arrivals grid) */}
      {newArrivals.length > 0 && (
        <ScrollReveal direction="up" delay={100}>
          <NewArrivalsSection products={newArrivals} />
        </ScrollReveal>
      )}

      {/* 8. PREGUNTAS FRECUENTES (Dynamic FAQ accordion from Database) */}
      {faqs.length > 0 && (
        <ScrollReveal direction="up" delay={100}>
          <FaqSection faqs={faqs} />
        </ScrollReveal>
      )}

      {/* 9. NOSOTROS EN REDES SOCIALES (Instagram & TikTok showcase) */}
      <ScrollReveal direction="up" delay={100}>
        <SocialFeedSection />
      </ScrollReveal>
    </div>
  );
}
