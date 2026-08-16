import React from 'react';
import Link from 'next/link';
import RoisinDiamond from './RoisinDiamond';

interface RoisinLogoProps {
  className?: string;
  symbolSize?: number;
  showTagline?: boolean;
  theme?: 'dark' | 'light' | 'rose';
  href?: string;
}

export default function RoisinLogo({
  className = '',
  symbolSize = 28,
  showTagline = true,
  theme = 'dark',
  href = '/',
}: RoisinLogoProps) {
  const isLight = theme === 'light';
  const isRose = theme === 'rose';

  const diamondColor = isLight ? '#FFFFFF' : isRose ? '#E2A3B0' : '#E2A3B0';
  const textColor = isLight ? 'text-white' : isRose ? 'text-[#E2A3B0]' : 'text-zinc-900';
  const tagColor = isLight ? 'text-zinc-400' : 'text-zinc-500';

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Brand Diamond Emblem */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <RoisinDiamond
          size={symbolSize}
          color={diamondColor}
          className="drop-shadow-xs transition-colors duration-300"
        />
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col">
        <span
          className={`font-serif tracking-[0.28em] font-extrabold uppercase leading-none transition-colors duration-300 text-xl sm:text-2xl ${textColor}`}
          style={{ letterSpacing: '0.28em' }}
        >
          ROISIN
        </span>
        {showTagline && (
          <span
            className={`text-[9px] uppercase tracking-[0.38em] font-medium mt-1 leading-none ${tagColor}`}
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
