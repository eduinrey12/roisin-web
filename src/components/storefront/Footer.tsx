import Link from 'next/link';
import { STORE_CONFIG } from '@/lib/config/store';
import { ShieldCheck, Truck, Sparkles, MessageCircle, Heart } from 'lucide-react';
import RoisinLogo from '@/components/branding/RoisinLogo';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export default function Footer() {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${STORE_CONFIG.name}, deseo más información sobre sus joyas.`
  )}`;

  return (
    <footer className="bg-[#1B1124] text-white border-t border-[#3F235F] mt-20">
      {/* 1. Compact Value Pillars */}
      <div className="border-b border-[#2D193E] py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3.5 justify-center sm:justify-start">
              <div className="p-3 bg-[#2A1442] rounded-2xl text-[#DFD0EC] border border-[#4E2975] shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-white">
                  Plata 925 & Oro 18k
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-light">
                  Metales nobles certificados y duraderos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 justify-center sm:justify-start">
              <div className="p-3 bg-[#2A1442] rounded-2xl text-[#DFD0EC] border border-[#4E2975] shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-white">
                  Envíos a Todo Ecuador
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-light">
                  Entregas seguras en 24h a 48h con Servientrega.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 justify-center sm:justify-start">
              <div className="p-3 bg-[#2A1442] rounded-2xl text-[#DFD0EC] border border-[#4E2975] shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-white">
                  Garantía & Asesoría
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-light">
                  Atención directa y cercana por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Branding */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <RoisinLogo theme="light" width={180} height={50} />
            <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
              Joyería fina en Plata de Ley 925 y Baño de Oro 18k. Diseños creados para celebrar tus momentos más inolvidables.
            </p>
            <div className="pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#DFD0EC] hover:text-white transition"
              >
                <MessageCircle size={15} /> Asesoría por WhatsApp
              </a>
            </div>
          </div>

          {/* Colecciones */}
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#DFD0EC] mb-3.5">
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

          {/* Información */}
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#DFD0EC] mb-3.5">
              Atención al Cliente
            </h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/nosotros" className="hover:text-white transition">
                  Sobre ROISIN & Compromiso
                </Link>
              </li>
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
                  Guía de Tallas Personalizada
                </a>
              </li>
            </ul>
          </div>

          {/* Métodos de Pago */}
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#DFD0EC] mb-3.5">
              Pagos en Ecuador
            </h5>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3 font-light">
              Pagos 100% seguros mediante Transferencia, Depósito Bancario o Tarjeta de Crédito / Débito.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] text-zinc-300 font-medium">
              <span className="bg-[#2A1442] px-3 py-1 rounded-lg border border-[#4E2975]">Transferencia</span>
              <span className="bg-[#2A1442] px-3 py-1 rounded-lg border border-[#4E2975]">Depósito Bancario</span>
              <span className="bg-[#2A1442] px-3 py-1 rounded-lg border border-[#4E2975]">Tarjeta Crédito / Débito</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-[#2D193E] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} {STORE_CONFIG.name}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1 text-zinc-400 font-light">
            Hecho con <Heart size={12} className="fill-[#7043A0] text-[#7043A0]" /> para Ecuador 🇪🇨
          </p>
        </div>
      </div>
    </footer>
  );
}
