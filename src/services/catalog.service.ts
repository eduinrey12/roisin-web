import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: { where: { isActive: true } } },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCollections() {
  return prisma.collection.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getPromotions() {
  return prisma.promotion.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getMaxProductPrice() {
  const maxProduct = await prisma.product.findFirst({
    where: { isActive: true },
    orderBy: { basePrice: 'desc' },
    select: { basePrice: true },
  });
  return maxProduct ? Math.ceil(Number(maxProduct.basePrice)) : 100;
}

export async function getFeaturedProducts(limit = 12) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { isActive: true },
        include: { inventory: true },
      },
      category: true,
      collections: {
        include: { collection: true },
      },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProducts(params?: {
  categorySlug?: string;
  collectionSlug?: string;
  onlyDiscounts?: boolean;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
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
    ...(params?.collectionSlug && {
      collections: {
        some: {
          collection: { slug: params.collectionSlug, isActive: true },
        },
      },
    }),
    ...(params?.onlyDiscounts && {
      OR: [
        { discountPercent: { gt: 0 } },
        { compareAtPrice: { gt: 0 } },
      ],
    }),
    ...(params?.query && {
      OR: [
        { title: { contains: params.query } },
        { description: { contains: params.query } },
        { shortDescription: { contains: params.query } },
        { tag: { contains: params.query } },
      ],
    }),
    ...((params?.minPrice !== undefined || params?.maxPrice !== undefined) && {
      basePrice: {
        ...(params?.minPrice !== undefined && { gte: new Prisma.Decimal(params.minPrice) }),
        ...(params?.maxPrice !== undefined && { lte: new Prisma.Decimal(params.maxPrice) }),
      },
    }),
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (params?.sort === 'price_asc') {
    orderBy = { basePrice: 'asc' };
  } else if (params?.sort === 'price_desc') {
    orderBy = { basePrice: 'desc' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
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
        category: true,
        collections: {
          include: { collection: true },
        },
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
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      collections: {
        include: { collection: true },
      },
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
}

// -----------------------------------------------------------------------------
// Admin Catalog Operations (Products, Categories, Collections, Promotions)
// -----------------------------------------------------------------------------

export async function adminGetAllProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      collections: {
        include: { collection: true },
      },
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        include: { inventory: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function adminCreateProduct(data: {
  title: string;
  slug: string;
  tag?: string;
  shortDescription?: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  discountPercent?: number;
  categoryId: string;
  collectionIds?: string[];
  isFeatured?: boolean;
  images: { url: string; altText?: string; label?: string; isPrimary?: boolean }[];
  variants: { sku: string; price: number; compareAtPrice?: number; initialStock?: number }[];
}) {
  return prisma.product.create({
    data: {
      title: data.title,
      slug: data.slug,
      tag: data.tag || null,
      shortDescription: data.shortDescription || null,
      description: data.description,
      basePrice: new Prisma.Decimal(data.basePrice),
      compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
      discountPercent: data.discountPercent || null,
      categoryId: data.categoryId,
      isFeatured: data.isFeatured ?? false,
      images: {
        create: data.images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || data.title,
          label: img.label || null,
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
      ...(data.collectionIds && data.collectionIds.length > 0 && {
        collections: {
          create: data.collectionIds.map((cid, idx) => ({
            collectionId: cid,
            sortOrder: idx,
          })),
        },
      }),
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
  // Soft delete to preserve historical integrity
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}

// Categories Admin Operations
export async function adminGetAllCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function adminCreateCategory(data: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}) {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      isActive: true,
    },
  });
}

export async function adminUpdateCategory(
  id: string,
  data: { name?: string; slug?: string; description?: string; imageUrl?: string; isActive?: boolean }
) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function adminUpdateCategoryStatus(id: string, isActive: boolean) {
  return prisma.category.update({
    where: { id },
    data: { isActive },
  });
}

export async function adminDeleteCategory(id: string) {
  return prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
}

// Collections Admin Operations
export async function adminGetAllCollections() {
  return prisma.collection.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function adminCreateCollection(data: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
}) {
  return prisma.collection.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      bannerUrl: data.bannerUrl,
      isActive: true,
    },
  });
}

export async function adminUpdateCollection(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    bannerUrl?: string;
    isActive?: boolean;
  }
) {
  return prisma.collection.update({
    where: { id },
    data,
  });
}

export async function adminUpdateCollectionStatus(id: string, isActive: boolean) {
  return prisma.collection.update({
    where: { id },
    data: { isActive },
  });
}

export async function adminDeleteCollection(id: string) {
  return prisma.collection.update({
    where: { id },
    data: { isActive: false },
  });
}

// Promotions Admin Operations
export async function adminGetAllPromotions() {
  return prisma.promotion.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function adminCreatePromotion(data: {
  title: string;
  subtitle?: string;
  badge?: string;
  discountText?: string;
  imageUrl: string;
  targetUrl: string;
  sortOrder?: number;
}) {
  return prisma.promotion.create({
    data: {
      title: data.title,
      subtitle: data.subtitle,
      badge: data.badge,
      discountText: data.discountText,
      imageUrl: data.imageUrl,
      targetUrl: data.targetUrl,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    },
  });
}

export async function adminUpdatePromotion(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    badge?: string;
    discountText?: string;
    imageUrl?: string;
    targetUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  return prisma.promotion.update({
    where: { id },
    data,
  });
}

export async function adminUpdatePromotionStatus(id: string, isActive: boolean) {
  return prisma.promotion.update({
    where: { id },
    data: { isActive },
  });
}

export async function adminDeletePromotion(id: string) {
  return prisma.promotion.update({
    where: { id },
    data: { isActive: false },
  });
}

