import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.warn('Database not reachable for getCategories, returning fallback:', error);
    return [];
  }
}

export async function getFeaturedProducts(limit = 8) {
  try {
    return await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          include: { inventory: true },
        },
        category: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.warn('Database not reachable for getFeaturedProducts, returning fallback:', error);
    return [];
  }
}

export async function getProducts(params?: {
  categorySlug?: string;
  query?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 24;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(params?.categorySlug && {
      category: { slug: params.categorySlug, isActive: true },
    }),
    ...(params?.query && {
      OR: [
        { title: { contains: params.query } },
        { description: { contains: params.query } },
      ],
    }),
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (params?.sort === 'price_asc') {
    orderBy = { basePrice: 'asc' };
  } else if (params?.sort === 'price_desc') {
    orderBy = { basePrice: 'desc' };
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: {
            where: { isActive: true },
            include: { inventory: true },
          },
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    };
  } catch (error) {
    console.warn('Database not reachable for getProducts, returning fallback:', error);
    return {
      products: [],
      total: 0,
      totalPages: 1,
      page: 1,
    };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          include: {
            inventory: true,
            attributes: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
        optionGroupLinks: {
          include: {
            group: {
              include: {
                options: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.warn('Database not reachable for getProductBySlug, returning null:', error);
    return null;
  }
}

// Admin Operations
export async function adminGetAllProducts() {
  try {
    return await prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          include: { inventory: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.warn('Database not reachable for adminGetAllProducts:', error);
    return [];
  }
}

export async function adminCreateProduct(data: {
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  isFeatured?: boolean;
  images: { url: string; altText?: string; isPrimary?: boolean }[];
  variants: { sku: string; price: number; compareAtPrice?: number; initialStock?: number }[];
}) {
  return prisma.product.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      basePrice: new Prisma.Decimal(data.basePrice),
      categoryId: data.categoryId,
      isFeatured: data.isFeatured ?? false,
      images: {
        create: data.images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || data.title,
          isPrimary: img.isPrimary ?? idx === 0,
          sortOrder: idx,
        })),
      },
      variants: {
        create: data.variants.map((v) => ({
          sku: v.sku,
          price: new Prisma.Decimal(v.price),
          compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : null,
          inventory: {
            create: {
              quantity: v.initialStock ?? 0,
            },
          },
        })),
      },
    },
  });
}

export async function adminUpdateProductStatus(id: string, isActive: boolean) {
  return prisma.product.update({
    where: { id },
    data: { isActive },
  });
}

export async function adminDeleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}
