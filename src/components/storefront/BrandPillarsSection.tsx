import React from 'react';
import { Sparkles, Truck, Gift } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export default function BrandPillarsSection() {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Metales Nobles Certificados Plata 925 & Oro 18k',
    },
    {
      icon: Truck,
      title: 'Envíos Rápidos & Seguros a Todo el Ecuador',
    },
    {
      icon: Gift,
      title: 'Empaque de Lujo con Dedicatoria Personalizada',
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
              className="bg-gradient-to-br from-[#2A1442] via-[#3F235F] to-[#1D0F2E] p-5 sm:p-6 rounded-2xl border border-[#552E80]/80 hover:border-[#DFD0EC] shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-4 diamond-glow group select-none cursor-default"
            >
              <div className="p-3 bg-white/10 rounded-xl text-[#DFD0EC] border border-white/20 group-hover:scale-108 group-hover:bg-white/15 transition-all shrink-0">
                <Icon size={22} className="text-amber-200" />
              </div>
              <div className="flex-1">
                <h4 className="font-sans text-xs sm:text-sm font-extrabold text-white tracking-wide leading-snug">
                  {item.title}
                </h4>
              </div>
              <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                <RoisinDiamond size={13} color="#DFD0EC" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
