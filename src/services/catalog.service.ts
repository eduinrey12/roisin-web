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

export async function getFeaturedProducts(limit = 6) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          include: {
            inventory: true,
            orderItems: { select: { quantity: true } },
            cartItems: { select: { quantity: true } },
          },
        },
        category: true,
        collections: {
          include: { collection: true },
        },
      },
    });

    // Compute dynamic popularity ranking: Top Sales (weight 5x) + Cart Activity (weight 2x) + isFeatured flag (weight 3x)
    const scoredProducts = products.map((p) => {
      let salesCount = 0;
      let cartCount = 0;

      for (const variant of p.variants) {
        for (const oi of (variant as any).orderItems || []) {
          salesCount += oi.quantity || 1;
        }
        for (const ci of (variant as any).cartItems || []) {
          cartCount += ci.quantity || 1;
        }
      }

      const popularityScore = salesCount * 5 + cartCount * 2 + (p.isFeatured ? 3 : 0);

      return {
        product: p,
        popularityScore,
        salesCount,
      };
    });

    // Sort descending by popularity score, fallback to createdAt desc
    scoredProducts.sort((a, b) => {
      if (b.popularityScore !== a.popularityScore) {
        return b.popularityScore - a.popularityScore;
      }
      return new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime();
    });

    return scoredProducts.slice(0, limit).map((sp) => sp.product);
  } catch {
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

export async function getRelatedProducts(params: {
  currentProductId: string;
  categoryId?: string;
  categorySlug?: string;
  collectionIds?: string[];
  limit?: number;
}) {
  const limit = params.limit || 8;
  const currentId = params.currentProductId;

  const productInclude = {
    images: { orderBy: { sortOrder: 'asc' as const } },
    variants: {
      where: { isActive: true },
      include: { inventory: true },
    },
    category: true,
    collections: {
      include: { collection: true },
    },
  };

  try {
    const wherePrimary: Prisma.ProductWhereInput = {
      isActive: true,
      id: { not: currentId },
      OR: [
        ...(params.collectionIds && params.collectionIds.length > 0
          ? [
              {
                collections: {
                  some: {
                    collectionId: { in: params.collectionIds },
                    collection: { isActive: true },
                  },
                },
              },
            ]
          : []),
        ...(params.categoryId
          ? [{ categoryId: params.categoryId, category: { isActive: true } }]
          : params.categorySlug
          ? [{ category: { slug: params.categorySlug, isActive: true } }]
          : []),
      ],
    };

    let related = await prisma.product.findMany({
      where: wherePrimary,
      include: productInclude,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    if (related.length < limit) {
      const existingIds = [currentId, ...related.map((p) => p.id)];
      const fallbackProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          id: { notIn: existingIds },
        },
        include: productInclude,
        take: limit - related.length,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      });

      related = [...related, ...fallbackProducts];
    }

    return related;
  } catch (err) {
    console.error('Error in getRelatedProducts:', err);
    return prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: currentId },
      },
      include: productInclude,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
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

export interface AdminProductCreateInput {
  title: string;
  slug: string;
  tag?: string;
  shortDescription?: string;
  description: string;
  basePrice?: number;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  categoryId: string;
  collectionId?: string | null;
  collectionIds?: string[];
  isFeatured?: boolean;
  materials?: {
    materialName: string;
    basePrice: number;
    initialStock?: number;
    sizes?: {
      sizeName: string;
      price?: number | null;
      stock?: number;
    }[];
    colors?: {
      metalColor?: string;
      gemColor?: string;
      imageUrls?: string[];
    }[];
  }[];
  images: { url: string; altText?: string; label?: string; isPrimary?: boolean }[];
  variants?: { sku: string; price: number; compareAtPrice?: number | null; initialStock?: number }[];
}

export async function adminCreateProduct(data: AdminProductCreateInput) {
  // Ensure default attributes exist
  let attrMaterial = await prisma.productAttribute.findUnique({ where: { name: 'Material' } });
  if (!attrMaterial) {
    attrMaterial = await prisma.productAttribute.create({ data: { name: 'Material' } });
  }

  let attrSize = await prisma.productAttribute.findUnique({ where: { name: 'Talla' } });
  if (!attrSize) {
    attrSize = await prisma.productAttribute.create({ data: { name: 'Talla' } });
  }

  let attrColor = await prisma.productAttribute.findUnique({ where: { name: 'Color' } });
  if (!attrColor) {
    attrColor = await prisma.productAttribute.create({ data: { name: 'Color' } });
  }

  // Calculate base price
  let basePrice = data.basePrice || 0;
  if (data.materials && data.materials.length > 0) {
    const validPrices = data.materials.map((m) => Number(m.basePrice)).filter((p) => p > 0);
    if (validPrices.length > 0) {
      basePrice = Math.min(...validPrices);
    }
  }

  // Generate variants data
  const slugPrefix = data.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6) || 'ROI';
  const variantsToCreate: {
    sku: string;
    price: Prisma.Decimal;
    compareAtPrice: Prisma.Decimal | null;
    initialStock: number;
    attributeValueIds: string[];
  }[] = [];

  if (data.materials && data.materials.length > 0) {
    for (let mIdx = 0; mIdx < data.materials.length; mIdx++) {
      const mat = data.materials[mIdx];
      const matPrice = Number(mat.basePrice) || basePrice || 10;
      const matCode = mat.materialName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) || `M${mIdx + 1}`;

      // Get or create material attribute value
      let matVal = await prisma.productAttributeValue.findFirst({
        where: { attributeId: attrMaterial.id, value: mat.materialName },
      });
      if (!matVal) {
        matVal = await prisma.productAttributeValue.create({
          data: { attributeId: attrMaterial.id, value: mat.materialName },
        });
      }

      if (mat.sizes && mat.sizes.length > 0) {
        for (let sIdx = 0; sIdx < mat.sizes.length; sIdx++) {
          const sz = mat.sizes[sIdx];
          const szPrice =
            sz.price != null && Number(sz.price) > 0 ? Number(sz.price) : matPrice;
          const szStock = sz.stock != null ? Number(sz.stock) : (mat.initialStock ?? 10);
          const szCode = sz.sizeName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) || `T${sIdx + 1}`;
          const sku = `${slugPrefix}-${matCode}-${szCode}-${mIdx + 1}${sIdx + 1}`;

          // Get or create size attribute value
          let sizeVal = await prisma.productAttributeValue.findFirst({
            where: { attributeId: attrSize.id, value: sz.sizeName },
          });
          if (!sizeVal) {
            sizeVal = await prisma.productAttributeValue.create({
              data: { attributeId: attrSize.id, value: sz.sizeName },
            });
          }

          variantsToCreate.push({
            sku,
            price: new Prisma.Decimal(szPrice),
            compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
            initialStock: szStock,
            attributeValueIds: [matVal.id, sizeVal.id],
          });
        }
      } else {
        const sku = `${slugPrefix}-${matCode}-${mIdx + 1}`;
        variantsToCreate.push({
          sku,
          price: new Prisma.Decimal(matPrice),
          compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
          initialStock: mat.initialStock ?? 10,
          attributeValueIds: [matVal.id],
        });
      }
    }
  } else if (data.variants && data.variants.length > 0) {
    data.variants.forEach((v, idx) => {
      variantsToCreate.push({
        sku: v.sku || `${slugPrefix}-VAR-${idx + 1}`,
        price: new Prisma.Decimal(v.price || basePrice || 10),
        compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : null,
        initialStock: v.initialStock ?? 10,
        attributeValueIds: [],
      });
    });
  } else {
    // Default single variant
    variantsToCreate.push({
      sku: `${slugPrefix}-STD`,
      price: new Prisma.Decimal(basePrice || 10),
      compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
      initialStock: 10,
      attributeValueIds: [],
    });
  }

  // Combine collections
  const collectionIdsSet = new Set<string>();
  if (data.collectionId) collectionIdsSet.add(data.collectionId);
  if (data.collectionIds) data.collectionIds.forEach((id) => collectionIdsSet.add(id));
  const finalCollectionIds = Array.from(collectionIdsSet).filter(Boolean);

  // Create product
  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug: data.slug,
      tag: data.tag || null,
      shortDescription: data.shortDescription || null,
      description: data.description,
      basePrice: new Prisma.Decimal(basePrice),
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
        create: variantsToCreate.map((v) => ({
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          inventory: {
            create: {
              quantity: v.initialStock,
            },
          },
          attributes: {
            create: v.attributeValueIds.map((attrValId) => ({
              attributeValueId: attrValId,
            })),
          },
        })),
      },
      ...(finalCollectionIds.length > 0 && {
        collections: {
          create: finalCollectionIds.map((cid, idx) => ({
            collectionId: cid,
            sortOrder: idx,
          })),
        },
      }),
    },
  });

  // Automatically assign default packaging options group if exists
  try {
    const packagingGroup = await getOrCreatePresentationOptionGroup();
    if (packagingGroup) {
      await prisma.productOptionGroupAssignment.upsert({
        where: {
          productId_groupId: {
            productId: product.id,
            groupId: packagingGroup.id,
          },
        },
        create: {
          productId: product.id,
          groupId: packagingGroup.id,
        },
        update: {},
      });
    }
  } catch {}

  return product;
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

// -----------------------------------------------------------------------------
// Materials Admin Operations
// -----------------------------------------------------------------------------

export const DEFAULT_MATERIALS = [
  {
    id: 'mat-plata-925',
    name: 'Plata de Ley 925',
    description: 'Plata fina de ley 925 con recubrimiento de rodio hipoalergénico y acabado espejo brillante.',
    sortOrder: 0,
    isActive: true,
  },
  {
    id: 'mat-oro-18k',
    name: 'Baño de Oro 18k',
    description: 'Estructura de plata 925 con triple baño electrolítico de oro amarillo de 18 quilates.',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'mat-oro-rosa-18k',
    name: 'Oro Rosa 18k',
    description: 'Plata de ley 925 con baño de oro rosa de 18 quilates y brillo satinado elegante.',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'mat-acero-316l',
    name: 'Acero Quirúrgico 316L',
    description: 'Acero inoxidable hipoalergénico de alta durabilidad resistente al agua y uso diario.',
    sortOrder: 3,
    isActive: true,
  },
];

export async function getMaterials() {
  try {
    if (!prisma.material) return DEFAULT_MATERIALS;
    let materials = await prisma.material.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (!materials || materials.length === 0) {
      await prisma.material.createMany({
        data: DEFAULT_MATERIALS.map((m, idx) => ({
          name: m.name,
          description: m.description,
          sortOrder: idx,
          isActive: true,
        })),
        skipDuplicates: true,
      });
      materials = await prisma.material.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    }
    return materials;
  } catch {
    return DEFAULT_MATERIALS;
  }
}

export async function adminGetAllMaterials() {
  try {
    if (!prisma.material) return DEFAULT_MATERIALS;
    let materials = await prisma.material.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    if (!materials || materials.length === 0) {
      await prisma.material.createMany({
        data: DEFAULT_MATERIALS.map((m, idx) => ({
          name: m.name,
          description: m.description,
          sortOrder: idx,
          isActive: true,
        })),
        skipDuplicates: true,
      });
      materials = await prisma.material.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    }
    return materials;
  } catch {
    return DEFAULT_MATERIALS;
  }
}

export async function adminCreateMaterial(data: {
  name: string;
  description?: string;
  sortOrder?: number;
}) {
  return prisma.material.create({
    data: {
      name: data.name,
      description: data.description || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    },
  });
}

// -----------------------------------------------------------------------------
// Category Sizes Admin Operations
// -----------------------------------------------------------------------------

export async function getCategorySizes(categoryId?: string) {
  try {
    if (!prisma.categorySize) return [];

    let sizes = await prisma.categorySize.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Auto-seed category sizes if empty
    if (!sizes || sizes.length === 0) {
      const categories = await prisma.category.findMany();
      for (const cat of categories) {
        const catNameLower = cat.name.toLowerCase();
        let defaultSizesForCat: { name: string; isAdjustable: boolean; sortOrder: number }[] = [];

        if (catNameLower.includes('anillo')) {
          defaultSizesForCat = [
            { name: 'Talla 5', isAdjustable: false, sortOrder: 1 },
            { name: 'Talla 6', isAdjustable: false, sortOrder: 2 },
            { name: 'Talla 7', isAdjustable: false, sortOrder: 3 },
            { name: 'Talla 8', isAdjustable: false, sortOrder: 4 },
            { name: 'Talla 9', isAdjustable: false, sortOrder: 5 },
            { name: 'Talla 10', isAdjustable: false, sortOrder: 6 },
            { name: 'Talla Ajustable', isAdjustable: true, sortOrder: 7 },
          ];
        } else if (catNameLower.includes('collar') || catNameLower.includes('dije')) {
          defaultSizesForCat = [
            { name: '40 cm (Choker)', isAdjustable: false, sortOrder: 1 },
            { name: '45 cm (Princesa)', isAdjustable: false, sortOrder: 2 },
            { name: '50 cm (Matinee)', isAdjustable: false, sortOrder: 3 },
            { name: '55 cm', isAdjustable: false, sortOrder: 4 },
            { name: '60 cm (Ópera)', isAdjustable: false, sortOrder: 5 },
            { name: 'Ajustable 40-45 cm', isAdjustable: true, sortOrder: 6 },
          ];
        } else if (catNameLower.includes('pulsera') || catNameLower.includes('brazalete')) {
          defaultSizesForCat = [
            { name: '16 cm (Pequeña)', isAdjustable: false, sortOrder: 1 },
            { name: '17 cm (Estándar)', isAdjustable: false, sortOrder: 2 },
            { name: '18 cm (Mediana)', isAdjustable: false, sortOrder: 3 },
            { name: '19 cm (Grande)', isAdjustable: false, sortOrder: 4 },
            { name: 'Ajustable 16-19 cm', isAdjustable: true, sortOrder: 5 },
          ];
        } else {
          defaultSizesForCat = [
            { name: 'Talla Única / Estándar', isAdjustable: false, sortOrder: 1 },
          ];
        }

        await prisma.categorySize.createMany({
          data: defaultSizesForCat.map((s) => ({
            categoryId: cat.id,
            name: s.name,
            isAdjustable: s.isAdjustable,
            sortOrder: s.sortOrder,
            isActive: true,
          })),
        });
      }

      sizes = await prisma.categorySize.findMany({
        where: {
          isActive: true,
          ...(categoryId ? { categoryId } : {}),
        },
        orderBy: { sortOrder: 'asc' },
      });
    }

    return sizes;
  } catch {
    return [];
  }
}

export async function adminCreateCategorySize(data: {
  categoryId: string;
  name: string;
  isAdjustable?: boolean;
  sortOrder?: number;
}) {
  return prisma.categorySize.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      isAdjustable: data.isAdjustable ?? false,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    },
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

export async function getFaqs(options?: { onlyHome?: boolean }) {
  try {
    if (!prisma.faq) return [];
    return await prisma.faq.findMany({
      where: {
        isActive: true,
        ...(options?.onlyHome ? { showOnHome: true } : {}),
      },
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
  showOnHome?: boolean;
}) {
  try {
    return await prisma.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category || 'General',
        sortOrder: data.sortOrder ?? 0,
        showOnHome: data.showOnHome ?? true,
        isActive: true,
      },
    });
  } catch (err: any) {
    if (err?.message?.includes('showOnHome')) {
      const created = await prisma.faq.create({
        data: {
          question: data.question,
          answer: data.answer,
          category: data.category || 'General',
          sortOrder: data.sortOrder ?? 0,
          isActive: true,
        },
      });
      await prisma.$executeRaw`UPDATE Faq SET showOnHome = ${data.showOnHome ?? true} WHERE id = ${created.id}`;
      return { ...created, showOnHome: data.showOnHome ?? true };
    }
    throw err;
  }
}

export async function adminUpdateFaq(
  id: string,
  data: {
    question?: string;
    answer?: string;
    category?: string;
    sortOrder?: number;
    showOnHome?: boolean;
    isActive?: boolean;
  }
) {
  try {
    return await prisma.faq.update({
      where: { id },
      data,
    });
  } catch (err: any) {
    if (err?.message?.includes('showOnHome')) {
      const { showOnHome, ...rest } = data;
      const updated = await prisma.faq.update({
        where: { id },
        data: rest,
      });
      if (showOnHome !== undefined) {
        await prisma.$executeRaw`UPDATE Faq SET showOnHome = ${showOnHome} WHERE id = ${id}`;
      }
      return { ...updated, showOnHome: showOnHome ?? true };
    }
    throw err;
  }
}

export async function adminToggleFaqHomeStatus(id: string, showOnHome: boolean) {
  try {
    return await prisma.faq.update({
      where: { id },
      data: { showOnHome },
    });
  } catch (err: any) {
    // If dev server Prisma client instance in memory was loaded prior to schema push:
    await prisma.$executeRaw`UPDATE Faq SET showOnHome = ${showOnHome} WHERE id = ${id}`;
    const item = await prisma.faq.findUnique({ where: { id } });
    return item ? { ...item, showOnHome } : { id, showOnHome };
  }
}

export async function adminDeleteFaq(id: string) {
  return prisma.faq.update({
    where: { id },
    data: { isActive: false },
  });
}



// -----------------------------------------------------------------------------
// Home Sections Operations (Dynamic Ordering & Visibility)
// -----------------------------------------------------------------------------

export const DEFAULT_HOME_SECTIONS = [
  {
    id: 'sec-categories',
    key: 'CATEGORIES',
    title: 'Barra de Categorías & Descuentos',
    description: 'Barra superior con accesos directos a Ofertas y Categorías principales.',
    sortOrder: 0,
    isActive: true,
  },
  {
    id: 'sec-promotions',
    key: 'PROMOTIONS',
    title: 'Banners Promocionales (Carrusel)',
    description: 'Banners panorámicos de colecciones y promociones con botón interactivo.',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'sec-pillars',
    key: 'BRAND_PILLARS',
    title: 'Tarjetas de Información & Valores',
    description: 'Insignias de Plata 925, Envíos a todo el Ecuador y Empaque de Regalo.',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'sec-experience',
    key: 'EXPERIENCE',
    title: 'Experiencia Diamante Morado',
    description: 'Presentación de empaque de lujo, dedicatorias personalizadas y garantía.',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'sec-featured',
    key: 'FEATURED',
    title: 'Productos Destacados',
    description: 'Selección de 7 piezas icónicas en formato Bento Grid.',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'sec-reviews',
    key: 'REVIEWS',
    title: 'Reseñas & Testimonios',
    description: 'Fila horizontal de clientas reales con fotos, videos y calificaciones.',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'sec-arrivals',
    key: 'NEW_ARRIVALS',
    title: 'Nuevos Ingresos',
    description: 'Fila horizontal con las últimas 7 joyas añadidas y tarjeta "Ver Más".',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'sec-faqs',
    key: 'FAQS',
    title: 'Preguntas Frecuentes',
    description: 'Acordeón con dudas sobre garantía, envíos, tallas y métodos de pago.',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'sec-social',
    key: 'SOCIAL_FEED',
    title: 'Síguenos en Redes Sociales',
    description: 'Muro interactivo con videos y fotos de Instagram y TikTok.',
    sortOrder: 8,
    isActive: true,
  },
];

export async function getHomeSections() {
  try {
    if (!prisma.homeSection) return DEFAULT_HOME_SECTIONS;
    const sections = await prisma.homeSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (sections && sections.length > 0) {
      return sections;
    }
    return DEFAULT_HOME_SECTIONS;
  } catch {
    return DEFAULT_HOME_SECTIONS;
  }
}

export async function adminGetAllHomeSections() {
  try {
    if (!prisma.homeSection) return DEFAULT_HOME_SECTIONS;
    let sections = await prisma.homeSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    if (!sections || sections.length === 0) {
      // Auto-populate with defaults if table is empty
      await prisma.homeSection.createMany({
        data: DEFAULT_HOME_SECTIONS.map((s, idx) => ({
          key: s.key,
          title: s.title,
          description: s.description,
          sortOrder: idx,
          isActive: true,
        })),
      });
      sections = await prisma.homeSection.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    }

    return sections;
  } catch {
    return DEFAULT_HOME_SECTIONS;
  }
}

export async function adminUpdateHomeSectionOrder(sectionUpdates: { id: string; sortOrder: number }[]) {
  const updates = sectionUpdates.map(({ id, sortOrder }) =>
    prisma.homeSection.update({
      where: { id },
      data: { sortOrder },
    })
  );
  return prisma.$transaction(updates);
}

export async function adminToggleHomeSectionStatus(id: string, isActive: boolean) {
  return prisma.homeSection.update({
    where: { id },
    data: { isActive },
  });
}

export async function adminResetHomeSectionsOrder() {
  const currentSections = await prisma.homeSection.findMany();
  const defaultKeys = DEFAULT_HOME_SECTIONS.map((s) => s.key);

  const updates = currentSections.map((sec) => {
    const defaultIndex = defaultKeys.indexOf(sec.key);
    const sortOrder = defaultIndex !== -1 ? defaultIndex : 99;
    return prisma.homeSection.update({
      where: { id: sec.id },
      data: { sortOrder, isActive: true },
    });
  });

  return prisma.$transaction(updates);
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


