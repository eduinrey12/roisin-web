import Link from 'next/link';
import { STORE_CONFIG } from '@/lib/config/store';
import { ShieldCheck, Truck, Sparkles, MessageCircle } from 'lucide-react';

export default function Footer() {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${STORE_CONFIG.name}, deseo más información sobre sus joyas.`
  )}`;

  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-900 mt-20">
      {/* Value Propositions / Badges */}
      <div className="border-b border-zinc-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="p-3 bg-zinc-900 rounded-full text-zinc-300">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-white">
                  Plata 925 & Baño de Oro
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Metales finos certificados y durabilidad garantizada.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="p-3 bg-zinc-900 rounded-full text-zinc-300">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-white">
                  Envíos Nacionales
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Entregas seguras a nivel nacional en 24h a 48h.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="p-3 bg-zinc-900 rounded-full text-zinc-300">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-white">
                  Compra Protegida
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Asesoría y seguimiento directo vía WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <span className="font-serif text-2xl font-bold tracking-[0.25em] text-white">
              {STORE_CONFIG.name}
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {STORE_CONFIG.description}
            </p>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                <MessageCircle size={16} />
                Asesoría WhatsApp Directa
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-4">
              Colecciones
            </h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/productos?category=anillos" className="hover:text-white transition">
                  Anillos de Promesa & Solitarios
                </Link>
              </li>
              <li>
                <Link href="/productos?category=collares" className="hover:text-white transition">
                  Collares & Gargantillas
                </Link>
              </li>
              <li>
                <Link href="/productos?category=pulseras" className="hover:text-white transition">
                  Pulseras Tennis & Dijes
                </Link>
              </li>
              <li>
                <Link href="/productos?category=aretes" className="hover:text-white transition">
                  Aretes & Huggies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-4">
              Atención al Cliente
            </h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/cuenta" className="hover:text-white transition">
                  Mi Cuenta & Pedidos
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition">
                  Métodos de Pago & Envíos
                </Link>
              </li>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-white transition">
                  Guía de Tallas & Consultas
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-4">
              Pagos Aceptados
            </h5>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Transferencia bancaria directa (Banco Pichincha, Guayaquil, Pacífico) o Pago Contra Entrega en zonas seleccionadas.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] text-zinc-300 font-medium">
              <span className="bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">Transferencia</span>
              <span className="bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">Contra Entrega</span>
              <span className="bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">Depósito</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} {STORE_CONFIG.name}. Todos los derechos reservados.</p>
          <p className="text-zinc-500">Hecho con excelencia para Ecuador 🇪🇨</p>
        </div>
      </div>
    </footer>
  );
}
