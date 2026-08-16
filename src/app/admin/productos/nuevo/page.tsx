import { getCategories } from '@/services/catalog.service';
import ProductCreateForm from './ProductCreateForm';

export default async function AdminNewProductPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900">Crear Nueva Joya</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Añade una pieza al catálogo con sus imágenes, variantes e inventario
        </p>
      </div>

      <ProductCreateForm categories={categories} />
    </div>
  );
}
