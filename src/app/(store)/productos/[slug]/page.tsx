import { getProductBySlug } from '@/lib/api/catalog';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images.find(i => i.isPrimary) || product.images[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/productos" className="hover:underline">Productos</Link> &gt; {product.title}
      </div>
      
      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            {primaryImage ? (
              <img src={primaryImage.url} alt={primaryImage.altText || product.title} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4 mt-4 overflow-x-auto">
              {product.images.map((img) => (
                <button key={img.url} className={`w-20 h-20 shrink-0 border-2 rounded ${img.url === primaryImage?.url ? 'border-blue-600' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="object-cover w-full h-full rounded" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
          <p className="text-2xl font-semibold mb-6">${product.basePrice}</p>
          
          <div className="prose mb-8">
            <p>{product.description}</p>
          </div>
          
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Variantes</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button key={variant.sku} className="border px-4 py-2 rounded hover:border-gray-800 transition">
                    {variant.sku} - ${variant.price}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition mt-auto w-full sm:w-auto">
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
