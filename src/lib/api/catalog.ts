export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: string;
  images: { url: string; altText: string; isPrimary: boolean }[];
  variants: { sku: string; price: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/catalog/categories`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  const url = new URL(`${API_URL}/catalog/products`);
  if (categorySlug) url.searchParams.append('category', categorySlug);
  
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/catalog/products/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}
