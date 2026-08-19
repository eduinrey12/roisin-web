import { getCategories, getCollections } from '@/services/catalog.service';
import ProductCreateForm from './ProductCreateForm';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export const dynamic = 'force-dynamic';

export default async function AdminNewProductPage() {
  const [categories, collections] = await Promise.all([
    getCategories(),
    getCollections(),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#DFD0EC] pb-6">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F] mb-1">
          <RoisinDiamond size={13} color="#7043A0" /> Catálogo & Creación
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
          Crear Nueva Joya
        </h1>
        <p className="text-xs text-zinc-500 font-light mt-0.5">
          Registra una pieza artesanal en el catálogo con sus fotografías, variantes de talla, colecciones exclusivas y precios.
        </p>
      </div>

      <ProductCreateForm categories={categories} collections={collections} />
    </div>
  );
}

