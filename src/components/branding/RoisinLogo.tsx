import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  width = 160,
  height = 54,
  theme = 'purple',
  href = '/',
}: RoisinLogoProps) {
  const isLight = theme === 'light';
  const logoSrc = isLight
    ? '/branding/diapo-1/logo-white.svg'
    : '/branding/diapo-1/logo-purple.svg';

  const content = (
    <div
      className={`inline-flex items-center justify-center select-none group transition-transform duration-300 group-hover:scale-103 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <Image
          src={logoSrc}
          alt="ROISIN Joyas"
          width={width}
          height={height}
          priority
          className="h-10 sm:h-12 w-auto object-contain transition-all duration-300 drop-shadow-xs"
        />
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
