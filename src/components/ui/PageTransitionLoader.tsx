'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Navigation finished
    setProgress(100);
    const timeout = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 250);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        !target.target &&
        !target.download &&
        target.href.startsWith(window.location.origin) &&
        !target.href.includes('#')
      ) {
        const url = new URL(target.href);
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          setLoading(true);
          setProgress(30);
          const pTimer = setInterval(() => {
            setProgress((prev) => (prev < 85 ? prev + 15 : prev));
          }, 120);
          setTimeout(() => clearInterval(pTimer), 1000);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Top Loading Progress Bar */}
      <div className="fixed top-0 inset-x-0 h-1 bg-transparent z-[10000]">
        <div
          className="h-full bg-gradient-to-r from-[#9C77C2] via-[#7043A0] to-[#3F235F] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(112,67,160,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Elegant Purple Diamond Floating Loading Spinner overlay for active route transitions */}
      {loading && (
        <div className="fixed inset-0 bg-[#1A1124]/20 backdrop-blur-[2px] flex items-center justify-center animate-fade-in transition-opacity">
          <div className="bg-white/95 p-5 rounded-3xl border border-[#DFD0EC] shadow-2xl flex flex-col items-center gap-3 animate-scale-in">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-14 h-14 rounded-full bg-[#F0E9F5] animate-ping opacity-50" />
              <RoisinDiamond size={38} color="#3F235F" className="animate-pulse" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F]">
              Cargando Joya...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
