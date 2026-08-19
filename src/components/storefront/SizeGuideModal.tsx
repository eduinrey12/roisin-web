'use client';

import { useState } from 'react';
import { X, Ruler, MessageCircle } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { STORE_CONFIG } from '@/lib/config/store';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'anillos' | 'collares' | 'pulseras'>('anillos');

  if (!isOpen) return null;

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${STORE_CONFIG.name}, necesito ayuda personalizada para elegir mi talla de joya.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#DFD0EC] overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#DFD0EC] flex justify-between items-center bg-[#F8F5FA]">
          <div className="flex items-center gap-2.5">
            <RoisinDiamond size={22} color="#7043A0" />
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#3F235F] block py-0.5 leading-normal">
                Guía de Medidas Oficial
              </span>
              <h3 className="font-sans text-xl font-bold text-zinc-900 leading-normal">
                Encuentra tu Talla Perfecta
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-white transition cursor-pointer"
            aria-label="Cerrar guía de tallas"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#DFD0EC] bg-white px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('anillos')}
            className={`pb-3 px-4 text-xs uppercase font-bold tracking-wider transition relative cursor-pointer ${
              activeTab === 'anillos'
                ? 'text-[#3F235F] border-b-2 border-[#3F235F]'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Tallas de Anillos
          </button>
          <button
            onClick={() => setActiveTab('collares')}
            className={`pb-3 px-4 text-xs uppercase font-bold tracking-wider transition relative cursor-pointer ${
              activeTab === 'collares'
                ? 'text-[#3F235F] border-b-2 border-[#3F235F]'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Largo de Collares
          </button>
          <button
            onClick={() => setActiveTab('pulseras')}
            className={`pb-3 px-4 text-xs uppercase font-bold tracking-wider transition relative cursor-pointer ${
              activeTab === 'pulseras'
                ? 'text-[#3F235F] border-b-2 border-[#3F235F]'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Medida de Pulseras
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-zinc-700">
          {activeTab === 'anillos' && (
            <div className="space-y-6">
              <div className="bg-[#F8F5FA] p-4 rounded-2xl border border-[#DFD0EC] space-y-2">
                <h4 className="font-sans font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <Ruler size={16} className="text-[#7043A0]" /> ¿Cómo medir tu dedo en casa?
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-600 font-light leading-relaxed">
                  <li>Corta una tira de papel fino o un hilo y rodea la base del dedo que deseas medir.</li>
                  <li>Marca con un bolígrafo el punto exacto donde se cruza la tira.</li>
                  <li>Mide los milímetros con una regla y busca tu equivalencia en la siguiente tabla.</li>
                </ol>
              </div>

              {/* Ring Size Table */}
              <div className="border border-[#DFD0EC] rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F5FA] text-zinc-900 border-b border-[#DFD0EC] font-bold">
                    <tr>
                      <th className="p-3">Talla (US)</th>
                      <th className="p-3">Diámetro Interior</th>
                      <th className="p-3">Circunferencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFD0EC]/60 font-medium">
                    <tr className="hover:bg-[#F8F5FA]">
                      <td className="p-3 font-bold text-[#3F235F]">Talla 6</td>
                      <td className="p-3">16.5 mm</td>
                      <td className="p-3">51.8 mm</td>
                    </tr>
                    <tr className="hover:bg-[#F8F5FA] bg-[#F8F5FA]/50">
                      <td className="p-3 font-bold text-[#3F235F]">Talla 7 (Más común)</td>
                      <td className="p-3">17.3 mm</td>
                      <td className="p-3">54.4 mm</td>
                    </tr>
                    <tr className="hover:bg-[#F8F5FA]">
                      <td className="p-3 font-bold text-[#3F235F]">Talla 8</td>
                      <td className="p-3">18.1 mm</td>
                      <td className="p-3">56.9 mm</td>
                    </tr>
                    <tr className="hover:bg-[#F8F5FA] bg-[#F8F5FA]/50">
                      <td className="p-3 font-bold text-[#3F235F]">Talla 9</td>
                      <td className="p-3">18.9 mm</td>
                      <td className="p-3">59.5 mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'collares' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-1 text-center">
                  <span className="font-bold text-[#3F235F] text-sm block">40 cm</span>
                  <p className="font-semibold text-zinc-900">Gargantilla / Choker</p>
                  <p className="text-[11px] text-zinc-500 font-light">Queda ceñido a la base del cuello.</p>
                </div>
                <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-1 text-center">
                  <span className="font-bold text-[#3F235F] text-sm block">45 cm</span>
                  <p className="font-semibold text-zinc-900">Largo Princesa</p>
                  <p className="text-[11px] text-zinc-500 font-light">Cae sobre la clavícula. Talla estándar más versátil.</p>
                </div>
                <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-1 text-center">
                  <span className="font-bold text-[#3F235F] text-sm block">50 cm</span>
                  <p className="font-semibold text-zinc-900">Largo Matinée</p>
                  <p className="text-[11px] text-zinc-500 font-light">Cae justo por encima del escote.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pulseras' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-1">
                  <span className="font-bold text-[#3F235F] text-sm block">17 cm</span>
                  <p className="font-semibold text-zinc-900">Muñeca Delgada / Estándar Femenina</p>
                  <p className="text-[11px] text-zinc-500 font-light">Ajuste ideal para muñecas de 15 a 16.5 cm.</p>
                </div>
                <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-1">
                  <span className="font-bold text-[#3F235F] text-sm block">19 cm</span>
                  <p className="font-semibold text-zinc-900">Muñeca Holgada</p>
                  <p className="text-[11px] text-zinc-500 font-light">Caída relajada y elegante con movimiento.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Support */}
        <div className="p-5 border-t border-[#DFD0EC] bg-[#F8F5FA] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-zinc-600 font-medium">
            ¿Aún no estás segura? Te asesoramos en menos de 5 minutos:
          </span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xs transition cursor-pointer"
          >
            <MessageCircle size={15} /> Asesoría por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

