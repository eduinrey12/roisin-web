'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  label,
  icon,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] rounded-2xl px-4 py-2.5 text-xs font-bold text-zinc-900 flex items-center justify-between gap-2.5 transition-all duration-200 shadow-2xs group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#7043A0] ${triggerClassName}`}
        >
          <div className="flex items-center gap-2 truncate">
            {icon !== undefined ? icon : <RoisinDiamond size={13} color="#7043A0" />}
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <ChevronDown
            size={15}
            className={`text-[#7043A0] shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && !disabled && (
          <div
            className={`absolute top-full left-0 mt-2 w-full min-w-[200px] max-h-64 overflow-y-auto no-scrollbar bg-white rounded-3xl p-2.5 shadow-2xl border border-[#DFD0EC] z-50 animate-fade-in space-y-1 ${dropdownClassName}`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl text-left text-xs font-bold flex items-center justify-between gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'btn-purple-diamond shadow-xs'
                      : 'hover:bg-[#F8F5FA] text-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F0E9F5] text-[#7043A0]'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
