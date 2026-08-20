import React from 'react';
import { Sparkles, Truck, Gift, ShieldCheck } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export default function BrandPillarsSection() {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Plata de Ley 925 & Oro 18k Certificado',
      badge: 'Garantía Auténtica',
    },
    {
      icon: Truck,
      title: 'Envíos Rápidos & Seguros a Todo el Ecuador',
      badge: 'Servientrega Express',
    },
    {
      icon: Gift,
      title: 'Empaque de Lujo con Dedicatoria Personalizada',
      badge: 'Detalle de Regalo',
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DFD0EC] hover:border-[#7043A0] shadow-xs hover:shadow-xl transition-all duration-300 flex items-center gap-4.5 group select-none cursor-default"
            >
              <div className="p-3.5 bg-gradient-to-br from-[#3F235F] to-[#7043A0] text-white rounded-2xl shadow-sm group-hover:scale-108 transition-all shrink-0">
                <Icon size={22} className="text-amber-200" />
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-[#7043A0] block">
                  {item.badge}
                </span>
                <h4 className="font-sans text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-[#3F235F] transition-colors leading-snug">
                  {item.title}
                </h4>
              </div>
              <div className="opacity-30 group-hover:opacity-100 transition-opacity">
                <RoisinDiamond size={13} color="#7043A0" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
