import React from 'react';
import Link from 'next/link';
import RoisinDiamond from './RoisinDiamond';

interface RoisinLogoProps {
  className?: string;
  width?: number;
  height?: number;
  theme?: 'dark' | 'light' | 'rose';
  href?: string;
  showTagline?: boolean;
}

export default function RoisinLogo({
  className = '',
  theme = 'dark',
  href = '/',
  showTagline = true,
}: RoisinLogoProps) {
  const isLight = theme === 'light';
  const isRose = theme === 'rose';

  const diamondColor = isLight ? '#F08097' : '#E65573';
  const textColor = isLight ? 'text-white' : isRose ? 'text-[#D33658]' : 'text-zinc-900';
  const tagColor = isLight ? 'text-[#FAD1DC]' : 'text-[#D33658]';

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group transition-transform duration-300 group-hover:scale-102 ${className}`}>
      {/* Official Diamond Vector Symbol from diapo-2 */}
      <div className="relative flex items-center justify-center p-1 bg-[#FFF5F7] rounded-2xl border border-[#FAD1DC] shadow-xs group-hover:border-[#E65573] transition-colors">
        <RoisinDiamond
          size={32}
          color={diamondColor}
          className="transition-transform duration-300 group-hover:scale-108 drop-shadow-xs"
        />
      </div>

      {/* Brand Wordmark & Tagline */}
      <div className="flex flex-col text-left">
        <span
          className={`font-serif text-xl sm:text-2xl font-black tracking-[0.28em] uppercase leading-none transition-colors ${textColor}`}
          style={{ letterSpacing: '0.28em' }}
        >
          ROISIN
        </span>
        {showTagline && (
          <span
            className={`text-[8.5px] uppercase tracking-[0.38em] font-bold mt-1 leading-none ${tagColor}`}
            style={{ letterSpacing: '0.38em' }}
          >
            Joyas & Accesorios
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block" aria-label="ROISIN Joyas - Inicio">
        {content}
      </Link>
    );
  }

  return content;
}
