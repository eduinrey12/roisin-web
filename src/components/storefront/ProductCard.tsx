import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    basePrice: any;
    category?: { name: string; slug: string };
    images: { url: string; altText?: string | null; isPrimary: boolean }[];
    variants?: { id: string; price: any; inventory?: { quantity: number } | null }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImg =
    product.images.find((i) => i.isPrimary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1605100804763-247f6612d4a5?q=80&w=800&auto=format&fit=crop';

  const secondaryImg = product.images[1]?.url || primaryImg;
  const price = Number(product.basePrice);

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-xl border border-gray-100/80 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      <Link href={`/productos/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={primaryImg}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full text-zinc-800 shadow-xs">
            {product.category.name}
          </span>
        )}
      </Link>

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <Link href={`/productos/${product.slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black transition line-clamp-1">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-50">
          <div>
            <span className="text-xs text-gray-400 block font-normal">Precio</span>
            <span className="text-base font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
          </div>

          <Link
            href={`/productos/${product.slug}`}
            className="text-xs uppercase tracking-wider font-semibold bg-zinc-900 text-white px-3.5 py-2 rounded-lg hover:bg-black transition active:scale-95"
          >
            Ver Joya
          </Link>
        </div>
      </div>
    </div>
  );
}
