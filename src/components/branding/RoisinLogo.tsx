import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RoisinLogoProps {
  className?: string;
  height?: number;
  width?: number;
  theme?: 'dark' | 'light' | 'rose';
  href?: string;
  showTagline?: boolean;
}

export default function RoisinLogo({
  className = '',
  height = 48,
  width = 175,
  theme = 'dark',
  href = '/',
}: RoisinLogoProps) {
  // Using the official vector SVG brand assets directly
  const logoSrc =
    theme === 'light'
      ? '/branding/diapo-1/logo-con-sombra.svg'
      : '/branding/diapo-1/logo-sin-sombra.svg';

  const content = (
    <div className={`inline-flex items-center select-none group transition-transform duration-300 group-hover:scale-102 ${className}`}>
      <div className="relative flex items-center justify-center">
        <Image
          src={logoSrc}
          alt="ROISIN Joyas & Accesorios"
          width={width}
          height={height}
          priority
          className="h-10 sm:h-12 w-auto object-contain drop-shadow-2xs transition-opacity duration-300"
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
