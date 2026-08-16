import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for ROISIN e-commerce...');

  // 1. Admin User
  const adminPassword = await bcrypt.hash('AdminRoisin2026!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@roisinjoyas.com' },
    update: {
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@roisinjoyas.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      customerProfile: {
        create: {
          firstName: 'Administrador',
          lastName: 'Roisin',
          phone: '0999999999',
        },
      },
    },
  });
  console.log('Admin user ready:', adminUser.email);

  // 2. Categories
  const catAnillos = await prisma.category.upsert({
    where: { slug: 'anillos' },
    update: {},
    create: {
      name: 'Anillos',
      slug: 'anillos',
      description: 'Anillos elegantes de plata 925 y oro para cada ocasión especial.',
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f6612d4a5?q=80&w=800&auto=format&fit=crop',
    },
  });

  const catCollares = await prisma.category.upsert({
    where: { slug: 'collares' },
    update: {},
    create: {
      name: 'Collares y Gargantillas',
      slug: 'collares',
      description: 'Collares sofisticados con dijes delicados y piedras naturales.',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    },
  });

  const catPulseras = await prisma.category.upsert({
    where: { slug: 'pulseras' },
    update: {},
    create: {
      name: 'Pulseras y Brazaletes',
      slug: 'pulseras',
      description: 'Brazaletes finos y pulseras combinables para un look deslumbrante.',
      imageUrl: 'https://images.unsplash.com/photo-1611591475837-7756f7ef07b8?q=80&w=800&auto=format&fit=crop',
    },
  });

  const catAretes = await prisma.category.upsert({
    where: { slug: 'aretes' },
    update: {},
    create: {
      name: 'Aretes y Candongas',
      slug: 'aretes',
      description: 'Aretes sutiles, modernos y brillantes que realzan tu rostro.',
      imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop',
    },
  });

  // 3. Presentation / Packaging Option Groups
  const optionGroup = await prisma.productOptionGroup.upsert({
    where: { id: 'opt-group-presentation' },
    update: {},
    create: {
      id: 'opt-group-presentation',
      name: 'Presentación y Empaque',
      description: 'Elige cómo deseas recibir tu joya.',
      isMultiSelect: false,
      options: {
        create: [
          { name: 'Empaque Estándar Roisin', priceModifier: 0.0, isDefault: true, sortOrder: 0 },
          { name: 'Caja de Regalo de Lujo + Cinta Satinada', priceModifier: 4.5, isDefault: false, sortOrder: 1 },
          { name: 'Bolsa de Terciopelo Rosa Roisin', priceModifier: 2.5, isDefault: false, sortOrder: 2 },
        ],
      },
    },
  });

  // 4. Products & Variants
  const p1 = await prisma.product.upsert({
    where: { slug: 'anillo-solitario-diamante-plata' },
    update: {},
    create: {
      title: 'Anillo Solitario Eterno en Plata 925',
      slug: 'anillo-solitario-diamante-plata',
      description:
        'Clásico anillo solitario fabricado con auténtica Plata de Ley 925 y circonia suiza de corte brillante. El símbolo perfecto para promesas, aniversarios y momentos inolvidables.',
      basePrice: 48.0,
      isFeatured: true,
      categoryId: catAnillos.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1605100804763-247f6612d4a5?q=80&w=800&auto=format&fit=crop',
            isPrimary: true,
            altText: 'Anillo Solitario Eterno en Plata',
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop',
            isPrimary: false,
            altText: 'Detalle de la circonia brillante',
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          { sku: 'AN-SOL-PL-T6', price: 48.0, inventory: { create: { quantity: 15 } } },
          { sku: 'AN-SOL-PL-T7', price: 48.0, inventory: { create: { quantity: 20 } } },
          { sku: 'AN-SOL-PL-T8', price: 48.0, inventory: { create: { quantity: 8 } } },
        ],
      },
    },
  });

  await prisma.productOptionGroupAssignment.upsert({
    where: { productId_groupId: { productId: p1.id, groupId: optionGroup.id } },
    update: {},
    create: {
      productId: p1.id,
      groupId: optionGroup.id,
    },
  });

  const p2 = await prisma.product.upsert({
    where: { slug: 'collar-gargantilla-corazon-perla' },
    update: {},
    create: {
      title: 'Collar Corazón Radiante con Baño de Oro',
      slug: 'collar-gargantilla-corazon-perla',
      description:
        'Cadena fina con dije de corazón pulido a mano y baño de oro de 18 quilates. Hipoalergénico, resistente al agua y con longitud ajustable.',
      basePrice: 38.0,
      isFeatured: true,
      categoryId: catCollares.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
            isPrimary: true,
            altText: 'Collar Corazón Radiante',
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          { sku: 'COL-COR-ORO-45CM', price: 38.0, inventory: { create: { quantity: 12 } } },
          { sku: 'COL-COR-ORO-50CM', price: 42.0, inventory: { create: { quantity: 6 } } },
        ],
      },
    },
  });

  await prisma.productOptionGroupAssignment.upsert({
    where: { productId_groupId: { productId: p2.id, groupId: optionGroup.id } },
    update: {},
    create: {
      productId: p2.id,
      groupId: optionGroup.id,
    },
  });

  const p3 = await prisma.product.upsert({
    where: { slug: 'pulsera-tenis-circonias-plata' },
    update: {},
    create: {
      title: 'Pulsera Tennis Zirconia Brillante',
      slug: 'pulsera-tenis-circonias-plata',
      description:
        'Elegancia atemporal con una hilera continua de circonias cúbicas premium montadas sobre engaste de cuatro puntas en plata 925.',
      basePrice: 55.0,
      isFeatured: true,
      categoryId: catPulseras.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1611591475837-7756f7ef07b8?q=80&w=800&auto=format&fit=crop',
            isPrimary: true,
            altText: 'Pulsera Tennis Zirconia',
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          { sku: 'PUL-TENIS-17CM', price: 55.0, inventory: { create: { quantity: 10 } } },
          { sku: 'PUL-TENIS-19CM', price: 58.0, inventory: { create: { quantity: 5 } } },
        ],
      },
    },
  });

  await prisma.productOptionGroupAssignment.upsert({
    where: { productId_groupId: { productId: p3.id, groupId: optionGroup.id } },
    update: {},
    create: {
      productId: p3.id,
      groupId: optionGroup.id,
    },
  });

  const p4 = await prisma.product.upsert({
    where: { slug: 'aretes-candongas-clasicas-oro' },
    update: {},
    create: {
      title: 'Aretes Candongas Huggies en Oro 18k',
      slug: 'aretes-candongas-clasicas-oro',
      description:
        'Aretes tipo huggie esenciales para el día a día. Cierre seguro a presión, ultra ligeros y con acabado de alto brillo.',
      basePrice: 32.0,
      isFeatured: true,
      categoryId: catAretes.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop',
            isPrimary: true,
            altText: 'Aretes Candongas Huggies',
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          { sku: 'ARE-HUG-ORO-10MM', price: 32.0, inventory: { create: { quantity: 25 } } },
          { sku: 'ARE-HUG-ORO-14MM', price: 36.0, inventory: { create: { quantity: 18 } } },
        ],
      },
    },
  });

  await prisma.productOptionGroupAssignment.upsert({
    where: { productId_groupId: { productId: p4.id, groupId: optionGroup.id } },
    update: {},
    create: {
      productId: p4.id,
      groupId: optionGroup.id,
    },
  });

  // 5. Shipping Regions in Ecuador
  const regions = [
    { name: 'Quito Urbano (Entrega Express 24h)', baseRate: 3.5 },
    { name: 'Valles de Quito (Cumbayá, Tumbaco, Los Chillos)', baseRate: 4.5 },
    { name: 'Guayaquil y Samborondón', baseRate: 5.5 },
    { name: 'Resto del País (Servientrega 48h)', baseRate: 6.5 },
  ];

  for (const r of regions) {
    await prisma.shippingRegion.upsert({
      where: { name: r.name },
      update: { baseRate: r.baseRate },
      create: {
        name: r.name,
        baseRate: r.baseRate,
        isActive: true,
      },
    });
  }

  // 6. Coupons
  await prisma.coupon.upsert({
    where: { code: 'BIENVENIDA10' },
    update: {},
    create: {
      code: 'BIENVENIDA10',
      discountPercentage: 10,
      maxUses: 500,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'ROISIN20' },
    update: {},
    create: {
      code: 'ROISIN20',
      discountPercentage: 20,
      maxUses: 100,
      isActive: true,
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
