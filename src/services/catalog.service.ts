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
  try {
    return await prisma.promotion.findMany({
      where: { isActive: true },
      include: {
        collection: true,
        products: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { where: { isActive: true } },
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  } catch {
    try {
      return await prisma.promotion.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    } catch {
      return [];
    }
  }
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

export async function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
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
  promoId?: string;
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
    ...(params?.promoId && {
      promotionLinks: {
        some: {
          promotionId: params.promoId,
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

async function attachOptionImages(options: any[]) {
  if (!options || options.length === 0) return options;
  const optionIds = options.map((o) => o.id).filter(Boolean);
  if (optionIds.length === 0) return options;

  try {
    let images: any[] = [];
    if ((prisma as any).productOptionImage) {
      images = await (prisma as any).productOptionImage.findMany({
        where: { optionId: { in: optionIds } },
        orderBy: { sortOrder: 'asc' },
      });
    } else {
      const idsIn = optionIds.map((id) => `'${id}'`).join(',');
      images = await prisma.$queryRawUnsafe(
        `SELECT id, optionId, url, altText, sortOrder FROM ProductOptionImage WHERE optionId IN (${idsIn}) ORDER BY sortOrder ASC`
      );
    }

    options.forEach((opt) => {
      const optImgs = images.filter((img) => img.optionId === opt.id);
      opt.images =
        optImgs.length > 0
          ? optImgs
          : opt.imageUrl
          ? [{ url: opt.imageUrl, altText: opt.name }]
          : [];
    });
  } catch {
    options.forEach((opt) => {
      opt.images = opt.imageUrl ? [{ url: opt.imageUrl, altText: opt.name }] : [];
    });
  }

  return options;
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
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

  if (product?.optionGroupLinks) {
    for (const link of product.optionGroupLinks) {
      if (link.group?.options) {
        await attachOptionImages(link.group.options);
      }
    }
  }

  return product;
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
    include: {
      collection: true,
      products: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function adminCreatePromotion(data: {
  title: string;
  imageUrl: string;
  targetType?: 'COLLECTION' | 'PRODUCTS' | 'CUSTOM_URL';
  collectionId?: string | null;
  productIds?: string[];
  discountPercent?: number | null;
  targetUrl?: string;
  sortOrder?: number;
}) {
  const targetType = data.targetType || (data.productIds && data.productIds.length > 0 ? 'PRODUCTS' : 'COLLECTION');

  return prisma.promotion.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      targetType: targetType as any,
      collectionId: data.collectionId || null,
      discountPercent: data.discountPercent ?? null,
      targetUrl: data.targetUrl || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
      ...(data.productIds && data.productIds.length > 0 && {
        products: {
          create: data.productIds.map((productId, idx) => ({
            productId,
            sortOrder: idx,
          })),
        },
      }),
    },
    include: {
      collection: true,
      products: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function adminUpdatePromotion(
  id: string,
  data: {
    title?: string;
    imageUrl?: string;
    targetType?: 'COLLECTION' | 'PRODUCTS' | 'CUSTOM_URL';
    collectionId?: string | null;
    productIds?: string[];
    discountPercent?: number | null;
    targetUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  if (data.productIds !== undefined) {
    await prisma.promotionProduct.deleteMany({ where: { promotionId: id } });
    if (data.productIds.length > 0) {
      await prisma.promotionProduct.createMany({
        data: data.productIds.map((productId, idx) => ({
          promotionId: id,
          productId,
          sortOrder: idx,
        })),
      });
    }
  }

  return prisma.promotion.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
      ...(data.targetType && { targetType: data.targetType as any }),
      ...(data.collectionId !== undefined && { collectionId: data.collectionId }),
      ...(data.discountPercent !== undefined && { discountPercent: data.discountPercent }),
      ...(data.targetUrl !== undefined && { targetUrl: data.targetUrl }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: {
      collection: true,
      products: {
        include: {
          product: true,
        },
      },
    },
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
// Customer Reviews & Testimonials Operations
// -----------------------------------------------------------------------------

export async function getReviews(limit = 12) {
  try {
    if (!prisma.review) return [];
    return await prisma.review.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function adminGetAllReviews() {
  return prisma.review.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function adminCreateReview(data: {
  authorName: string;
  location?: string;
  rating?: number;
  comment: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'NONE';
  productTitle?: string;
  isVerified?: boolean;
  sortOrder?: number;
}) {
  return prisma.review.create({
    data: {
      authorName: data.authorName,
      location: data.location || null,
      rating: data.rating ?? 5,
      comment: data.comment,
      mediaUrl: data.mediaUrl || null,
      mediaType: (data.mediaType as any) || (data.mediaUrl ? 'IMAGE' : 'NONE'),
      productTitle: data.productTitle || null,
      isVerified: data.isVerified ?? true,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    },
  });
}

export async function adminUpdateReview(
  id: string,
  data: {
    authorName?: string;
    location?: string;
    rating?: number;
    comment?: string;
    mediaUrl?: string;
    mediaType?: 'IMAGE' | 'VIDEO' | 'NONE';
    productTitle?: string;
    isVerified?: boolean;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  return prisma.review.update({
    where: { id },
    data: {
      ...data,
      ...(data.mediaType && { mediaType: data.mediaType as any }),
    },
  });
}

export async function adminDeleteReview(id: string) {
  return prisma.review.update({
    where: { id },
    data: { isActive: false },
  });
}

// -----------------------------------------------------------------------------
// Frequently Asked Questions (FAQ) Operations
// -----------------------------------------------------------------------------

export async function getFaqs() {
  try {
    if (!prisma.faq) return [];
    return await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch {
    return [];
  }
}

export async function adminGetAllFaqs() {
  return prisma.faq.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function adminCreateFaq(data: {
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
}) {
  return prisma.faq.create({
    data: {
      question: data.question,
      answer: data.answer,
      category: data.category || 'General',
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    },
  });
}

export async function adminUpdateFaq(
  id: string,
  data: {
    question?: string;
    answer?: string;
    category?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  return prisma.faq.update({
    where: { id },
    data,
  });
}

export async function adminDeleteFaq(id: string) {
  return prisma.faq.update({
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

  if (group?.options) {
    await attachOptionImages(group.options);
  }

  return group;
}

export async function adminGetAllPresentationOptions() {
  const group = await getOrCreatePresentationOptionGroup();
  const options = await prisma.productOption.findMany({
    where: { groupId: group.id, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  return attachOptionImages(options);
}

export async function adminCreatePresentationOption(data: {
  name: string;
  description?: string;
  priceModifier: number;
  imageUrl?: string;
  images?: string[];
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

  const primaryImg = data.imageUrl || data.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop';
  const allImages = data.images && data.images.length > 0 ? data.images : [primaryImg];

  return prisma.productOption.create({
    data: {
      groupId: group.id,
      name: data.name,
      description: data.description,
      priceModifier: new Prisma.Decimal(data.priceModifier || 0),
      imageUrl: primaryImg,
      isDefault: data.isDefault || false,
      sortOrder: data.sortOrder || 0,
      isActive: true,
      images: {
        create: allImages.map((url, idx) => ({
          url,
          sortOrder: idx,
        })),
      },
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
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
    images?: string[];
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

  if (data.images && data.images.length > 0) {
    await prisma.productOptionImage.deleteMany({ where: { optionId: id } });
    await prisma.productOptionImage.createMany({
      data: data.images.map((url, idx) => ({
        optionId: id,
        url,
        sortOrder: idx,
      })),
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
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });
}

export async function adminDeletePresentationOption(id: string) {
  return prisma.productOption.update({
    where: { id },
    data: { isActive: false },
  });
}


