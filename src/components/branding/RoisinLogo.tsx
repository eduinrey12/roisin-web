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
  height = 56,
  theme = 'purple',
  href = '/',
}: RoisinLogoProps) {
  const isLight = theme === 'light';

  const content = (
    <div
      className={`inline-flex items-center justify-center select-none group transition-transform duration-300 group-hover:scale-103 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <Image
          src="/branding/diapo-1/logo-sin-sombra.svg"
          alt="ROISIN Joyas"
          width={width}
          height={height}
          priority
          className={`h-auto w-auto max-h-12 sm:max-h-14 object-contain transition-all duration-300 drop-shadow-xs ${
            isLight
              ? 'brightness-0 invert opacity-95 group-hover:opacity-100'
              : 'contrast-105 group-hover:brightness-105'
          }`}
          style={{ width: `${width}px`, height: 'auto' }}
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

