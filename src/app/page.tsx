import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getCategories,
  getPromotions,
  getFeaturedProducts,
  getNewArrivals,
  getReviews,
  getFaqs,
  getHomeSections,
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

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    rawCategories,
    rawPromotions,
    rawFeaturedProducts,
    rawNewArrivals,
    rawReviews,
    rawFaqs,
    rawSections,
  ] = await Promise.all([
    getCategories(),
    getPromotions(),
    getFeaturedProducts(6),
    getNewArrivals(8),
    getReviews(6),
    getFaqs({ onlyHome: true }),
    getHomeSections(),
  ]);

  const categories = JSON.parse(JSON.stringify(rawCategories));
  const promotions = JSON.parse(JSON.stringify(rawPromotions));
  const featuredProducts = JSON.parse(JSON.stringify(rawFeaturedProducts));
  const newArrivals = JSON.parse(JSON.stringify(rawNewArrivals));
  const reviews = JSON.parse(JSON.stringify(rawReviews));
  const faqs = JSON.parse(JSON.stringify(rawFaqs));
  const sections = JSON.parse(JSON.stringify(rawSections));

  const renderSection = (key: string) => {
    switch (key) {
      case 'CATEGORIES':
        return (
          <section key="CATEGORIES" className="border-b border-[#DFD0EC] bg-[#F8F5FA] py-2.5 shadow-2xs">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
              <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-0.5">
                <Link
                  href="/productos?ofertas=true"
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#3F235F] to-[#7043A0] text-white text-xs uppercase font-extrabold tracking-wider shadow-xs hover:shadow-md transition active:scale-95"
                >
                  <Flame size={14} className="text-amber-300 fill-amber-300" />
                  <span>Descuentos</span>
                </Link>

                {categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/productos?category=${cat.slug}`}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#F0E9F5] border border-[#DFD0EC] text-zinc-800 hover:text-[#3F235F] hover:border-[#7043A0] text-xs uppercase font-bold tracking-wider transition shadow-2xs active:scale-95"
                  >
                    <span>{cat.name}</span>
                  </Link>
                ))}

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
        );

      case 'PROMOTIONS':
        if (!promotions || promotions.length === 0) return null;
        return (
          <div key="PROMOTIONS" className="-mt-4 sm:-mt-6">
            <ScrollReveal direction="up">
              <PromotionsCarousel promotions={promotions} />
            </ScrollReveal>
          </div>
        );

      case 'BRAND_PILLARS':
        return (
          <ScrollReveal key="BRAND_PILLARS" direction="up" delay={100}>
            <BrandPillarsSection />
          </ScrollReveal>
        );

      case 'EXPERIENCE':
        return (
          <ScrollReveal key="EXPERIENCE" direction="up" delay={100}>
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
        );

      case 'FEATURED':
        if (!featuredProducts || featuredProducts.length === 0) return null;
        return (
          <ScrollReveal key="FEATURED" direction="up" delay={100}>
            <FeaturedDestacadosSection products={featuredProducts} />
          </ScrollReveal>
        );

      case 'REVIEWS':
        if (!reviews || reviews.length === 0) return null;
        return (
          <ScrollReveal key="REVIEWS" direction="up" delay={100}>
            <ReviewsSection reviews={reviews} />
          </ScrollReveal>
        );

      case 'NEW_ARRIVALS':
        if (!newArrivals || newArrivals.length === 0) return null;
        return (
          <ScrollReveal key="NEW_ARRIVALS" direction="up" delay={100}>
            <NewArrivalsSection products={newArrivals} />
          </ScrollReveal>
        );

      case 'FAQS':
        if (!faqs || faqs.length === 0) return null;
        return (
          <ScrollReveal key="FAQS" direction="up" delay={100}>
            <FaqSection faqs={faqs} />
          </ScrollReveal>
        );

      case 'SOCIAL_FEED':
        return (
          <ScrollReveal key="SOCIAL_FEED" direction="up" delay={100}>
            <SocialFeedSection />
          </ScrollReveal>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-20 overflow-x-hidden">
      {sections.map((sec: any) => renderSection(sec.key))}
    </div>
  );
}
