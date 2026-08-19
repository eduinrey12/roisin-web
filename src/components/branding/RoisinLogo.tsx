import React from 'react';
import Link from 'next/link';
import RoisinDiamond from './RoisinDiamond';

interface RoisinLogoProps {
  className?: string;
  width?: number;
  height?: number;
  theme?: 'dark' | 'light' | 'purple';
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
  const isPurple = theme === 'purple';

  const diamondColor = isLight ? '#DFD0EC' : '#3F235F';
  const textColor = isLight ? 'text-white' : isPurple ? 'text-[#3F235F]' : 'text-zinc-900';
  const tagColor = isLight ? 'text-[#DFD0EC]' : 'text-[#3F235F]';
  const containerBg = isLight
    ? 'bg-[#2A1442] border-[#4E2975] group-hover:border-[#DFD0EC]'
    : 'bg-[#F8F5FA] border-[#DFD0EC] group-hover:border-[#7043A0]';

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group transition-transform duration-300 group-hover:scale-102 ${className}`}>
      {/* Official Diamond Vector Symbol in Purple */}
      <div className={`relative flex items-center justify-center p-1 rounded-2xl border shadow-xs transition-colors ${containerBg}`}>
        <RoisinDiamond
          size={32}
          color={diamondColor}
          className="transition-transform duration-300 group-hover:scale-108 drop-shadow-xs"
        />
      </div>

      {/* Brand Wordmark & Tagline */}
      <div className="flex flex-col text-left">
        <span
          className={`font-roisin text-2xl sm:text-3xl tracking-[0.06em] leading-none transition-colors ${textColor}`}
          style={{ letterSpacing: '0.06em' }}
        >
          Roisin
        </span>
        {showTagline && (
          <span
            className={`text-[8.5px] uppercase tracking-[0.32em] font-bold mt-1 leading-none ${tagColor}`}
            style={{ letterSpacing: '0.32em' }}
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

