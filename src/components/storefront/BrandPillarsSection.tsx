import React from 'react';
import { Sparkles, Truck, Gift, ShieldCheck } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export default function BrandPillarsSection() {
  const pillars = [
    {
      icon: Sparkles,
      text: 'Plata de Ley 925 & Baño de Oro 18k Certificados',
    },
    {
      icon: Truck,
      text: 'Envíos Rápidos & 100% Seguros a Todo el Ecuador',
    },
    {
      icon: Gift,
      text: 'Empaque de Lujo con Dedicatoria Personalizada',
    },
    {
      icon: ShieldCheck,
      text: 'Garantía de Autenticidad & Asesoría Directa WhatsApp',
    },
  ];

  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-r from-[#211033] via-[#3F235F] to-[#1E0E30] text-white py-5 sm:py-6 border-y border-[#552E80]/60 shadow-xl select-none">
      {/* Background Diamond Shimmer Accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#DFD0EC_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#DFD0EC]/40 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7043A0]/50 to-transparent" />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 items-center">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === pillars.length - 1;

            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 px-3 py-2 rounded-2xl group transition-all duration-300 hover:bg-white/5"
              >
                {/* Luminous Icon Badge */}
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#552E80] to-[#25123B] border border-[#7043A0]/60 flex items-center justify-center text-amber-300 shadow-md group-hover:scale-110 group-hover:border-amber-300/60 transition-all duration-300 shrink-0">
                  <Icon size={18} className="drop-shadow-2xs" />
                </div>

                {/* Single Clear, Concise Text */}
                <span className="font-sans text-xs sm:text-[12.5px] font-bold text-white/95 group-hover:text-amber-200 transition-colors leading-snug flex-1">
                  {item.text}
                </span>

                {/* Subtle Diamond Divider on Large Screens */}
                {!isLast && (
                  <div className="hidden lg:block opacity-30 group-hover:opacity-80 transition-opacity pl-2">
                    <RoisinDiamond size={8} color="#C2A3DF" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
