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

// -----------------------------------------------------------------------------
// Product Option Groups & Presentation Packaging Operations
// -----------------------------------------------------------------------------

export async function getOrCreatePresentationOptionGroup() {
  let group = await prisma.productOptionGroup.findFirst({
    where: { name: { contains: 'Presentación' } },
    include: {
      options: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!group) {
    group = await prisma.productOptionGroup.create({
      data: {
        name: 'Presentación & Empaque',
        description: 'Elige cómo deseas recibir o enviar tu joya.',
        isMultiSelect: false,
        options: {
          create: [
            {
              name: 'Caja Joyera Roisin con Lazo Morado',
              description: 'Caja rígida protectora con lazo de raso morado y esponja interior aterciopelada.',
              priceModifier: new Prisma.Decimal(0.0),
              imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
              isDefault: true,
              sortOrder: 0,
            },
            {
              name: 'Empaque de Lujo Especial + Tarjeta Dedicatoria',
              description: 'Caja joyera de lujo, lazo amatista, bolsa de regalo y tarjeta impresa con dedicatoria.',
              priceModifier: new Prisma.Decimal(4.0),
              imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop',
              isDefault: false,
              sortOrder: 1,
            },
            {
              name: 'Funda de Terciopelo Púrpura Premium',
              description: 'Bolsita de terciopelo morado con grabado y cordón satinado, ideal para viaje.',
              priceModifier: new Prisma.Decimal(2.5),
              imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
              isDefault: false,
              sortOrder: 2,
            },
            {
              name: 'Cofre Joyero Aterciopelado con Espejo',
              description: 'Cofre rígido premium de doble compartimento con forro suave y espejo interior.',
              priceModifier: new Prisma.Decimal(6.0),
              imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
              isDefault: false,
              sortOrder: 3,
            },
          ],
        },
      },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  return group;
}

export async function adminGetAllPresentationOptions() {
  const group = await getOrCreatePresentationOptionGroup();
  return prisma.productOption.findMany({
    where: { groupId: group.id, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function adminCreatePresentationOption(data: {
  name: string;
  description?: string;
  priceModifier: number;
  imageUrl?: string;
  isDefault?: boolean;
  sortOrder?: number;
}) {
  const group = await getOrCreatePresentationOptionGroup();

  if (data.isDefault) {
    await prisma.productOption.updateMany({
      where: { groupId: group.id },
      data: { isDefault: false },
    });
  }

  return prisma.productOption.create({
    data: {
      groupId: group.id,
      name: data.name,
      description: data.description,
      priceModifier: new Prisma.Decimal(data.priceModifier || 0),
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      isDefault: data.isDefault || false,
      sortOrder: data.sortOrder || 0,
      isActive: true,
    },
  });
}

export async function adminUpdatePresentationOption(
  id: string,
  data: {
    name?: string;
    description?: string;
    priceModifier?: number;
    imageUrl?: string;
    isDefault?: boolean;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  const option = await prisma.productOption.findUnique({ where: { id } });
  if (data.isDefault && option) {
    await prisma.productOption.updateMany({
      where: { groupId: option.groupId },
      data: { isDefault: false },
    });
  }

  return prisma.productOption.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priceModifier !== undefined && { priceModifier: new Prisma.Decimal(data.priceModifier) }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function adminDeletePresentationOption(id: string) {
  return prisma.productOption.update({
    where: { id },
    data: { isActive: false },
  });
}


