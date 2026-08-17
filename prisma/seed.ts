import 'dotenv/config';
import prisma from '../src/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const IMG_ANILLOS = 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop';
const IMG_COLLARES = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';
const IMG_PULSERAS = 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=800&auto=format&fit=crop';
const IMG_ARETES = 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop';

async function main() {
  console.log('--- ROISIN Database Seed with 19 Fine Jewelry Products ---');

  // 1. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@roisinjoyas.com';
  const initialPassword =
    process.env.ADMIN_INITIAL_PASSWORD || crypto.randomBytes(8).toString('hex') + '!A1';

  const adminPasswordHash = await bcrypt.hash(initialPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      customerProfile: {
        create: {
          firstName: 'Administrador',
          lastName: 'Roisin',
          phone: process.env.NEXT_PUBLIC_STORE_PHONE || '0999999999',
        },
      },
    },
  });

  // 2. Categories
  const catAnillos = await prisma.category.upsert({
    where: { slug: 'anillos' },
    update: { imageUrl: IMG_ANILLOS },
    create: {
      name: 'Anillos',
      slug: 'anillos',
      description: 'Anillos de promesa, solitarios eternos y alianzas en Plata 925 y Oro 18k.',
      imageUrl: IMG_ANILLOS,
    },
  });

  const catCollares = await prisma.category.upsert({
    where: { slug: 'collares' },
    update: { imageUrl: IMG_COLLARES },
    create: {
      name: 'Collares y Gargantillas',
      slug: 'collares',
      description: 'Collares sofisticados con dijes de corazón, punto de luz y perlas naturales.',
      imageUrl: IMG_COLLARES,
    },
  });

  const catPulseras = await prisma.category.upsert({
    where: { slug: 'pulseras' },
    update: { imageUrl: IMG_PULSERAS },
    create: {
      name: 'Pulseras y Brazaletes',
      slug: 'pulseras',
      description: 'Brazaletes finos y pulseras tennis con circonias suizas de corte brillante.',
      imageUrl: IMG_PULSERAS,
    },
  });

  const catAretes = await prisma.category.upsert({
    where: { slug: 'aretes' },
    update: { imageUrl: IMG_ARETES },
    create: {
      name: 'Aretes y Candongas',
      slug: 'aretes',
      description: 'Aretes tipo huggies y candongas de alto brillo en oro y plata.',
      imageUrl: IMG_ARETES,
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

  // Helper function to create/upsert product
  const createProduct = async (data: {
    title: string;
    slug: string;
    description: string;
    basePrice: number;
    categoryId: string;
    imageUrl: string;
    variants: { sku: string; price: number; quantity: number }[];
  }) => {
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        isFeatured: true,
      },
      create: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        isFeatured: true,
        images: {
          create: [{ url: data.imageUrl, isPrimary: true, altText: data.title, sortOrder: 0 }],
        },
      },
    });

    // Ensure images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: { productId: product.id, url: data.imageUrl, isPrimary: true, altText: data.title, sortOrder: 0 },
    });

    // Ensure variants
    for (const v of data.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { price: v.price },
        create: {
          productId: product.id,
          sku: v.sku,
          price: v.price,
          inventory: { create: { quantity: v.quantity } },
        },
      });
    }

    // Ensure option group link
    await prisma.productOptionGroupAssignment.upsert({
      where: { productId_groupId: { productId: product.id, groupId: optionGroup.id } },
      update: {},
      create: { productId: product.id, groupId: optionGroup.id },
    });

    return product;
  };

  // --- 19 PRODUCT DEFINITIONS ---
  const productsList = [
    // Anillos (5)
    {
      title: 'Anillo Solitario Eterno en Plata 925',
      slug: 'anillo-solitario-diamante-plata',
      description: 'Clásico anillo solitario fabricado con auténtica Plata de Ley 925 y circonia suiza de corte brillante. El símbolo perfecto para promesas y aniversarios.',
      basePrice: 48.0,
      categoryId: catAnillos.id,
      imageUrl: IMG_ANILLOS,
      variants: [
        { sku: 'AN-SOL-T6', price: 48.0, quantity: 15 },
        { sku: 'AN-SOL-T7', price: 48.0, quantity: 20 },
        { sku: 'AN-SOL-T8', price: 48.0, quantity: 10 },
      ],
    },
    {
      title: 'Anillo Promesa Infinito en Plata de Ley',
      slug: 'anillo-promesa-infinito-plata',
      description: 'Diseño delicado con el símbolo del infinito entrelazado con micro-circones. Representa un amor sin límites y momentos eternos.',
      basePrice: 42.0,
      categoryId: catAnillos.id,
      imageUrl: IMG_ANILLOS,
      variants: [
        { sku: 'AN-INF-T6', price: 42.0, quantity: 12 },
        { sku: 'AN-INF-T7', price: 42.0, quantity: 18 },
      ],
    },
    {
      title: 'Anillo Corona Royal con Baño de Oro 18k',
      slug: 'anillo-corona-royal-oro-18k',
      description: 'Majestuoso anillo estilo tiara con baño de oro amarillo de 18 quilates y piedras incrustadas a mano.',
      basePrice: 65.0,
      categoryId: catAnillos.id,
      imageUrl: IMG_ANILLOS,
      variants: [
        { sku: 'AN-COR-T7', price: 65.0, quantity: 14 },
        { sku: 'AN-COR-T8', price: 65.0, quantity: 8 },
      ],
    },
    {
      title: 'Anillo Churumbela Circonias en Hilera',
      slug: 'anillo-churumbela-circonias-plata',
      description: 'Anillo tipo banda completa con finas circonias engastadas en cuatro puntas. Ideal para combinar con solitarios.',
      basePrice: 36.0,
      categoryId: catAnillos.id,
      imageUrl: IMG_ANILLOS,
      variants: [
        { sku: 'AN-CHUR-T6', price: 36.0, quantity: 20 },
        { sku: 'AN-CHUR-T7', price: 36.0, quantity: 22 },
        { sku: 'AN-CHUR-T8', price: 36.0, quantity: 15 },
      ],
    },
    {
      title: 'Anillo Dúo Amor Eterno para Parejas',
      slug: 'anillo-duo-amor-eterno-parejas',
      description: 'Set de dos anillos ajustables en plata pura con grabado interior de promesa y acabado brillante.',
      basePrice: 58.0,
      categoryId: catAnillos.id,
      imageUrl: IMG_ANILLOS,
      variants: [
        { sku: 'AN-DUO-SET', price: 58.0, quantity: 16 },
      ],
    },

    // Collares (5)
    {
      title: 'Collar Corazón Radiante con Baño de Oro',
      slug: 'collar-gargantilla-corazon-perla',
      description: 'Cadena fina con dije de corazón pulido a mano y baño de oro de 18 quilates. Hipoalergénico y con longitud ajustable.',
      basePrice: 38.0,
      categoryId: catCollares.id,
      imageUrl: IMG_COLLARES,
      variants: [
        { sku: 'COL-COR-45CM', price: 38.0, quantity: 18 },
        { sku: 'COL-COR-50CM', price: 42.0, quantity: 12 },
      ],
    },
    {
      title: 'Collar Punto de Luz Diamante en Plata 925',
      slug: 'collar-punto-de-luz-diamante-plata',
      description: 'Elegancia minimalista con un circón suizo corte brillante suspendido sobre una cadena veneciana de plata.',
      basePrice: 32.0,
      categoryId: catCollares.id,
      imageUrl: IMG_COLLARES,
      variants: [
        { sku: 'COL-PTL-40CM', price: 32.0, quantity: 25 },
        { sku: 'COL-PTL-45CM', price: 35.0, quantity: 30 },
      ],
    },
    {
      title: 'Collar Árbol de la Vida en Oro 18k',
      slug: 'collar-arbol-de-la-vida-oro-18k',
      description: 'Símbolo de familia, crecimiento y bendición con delicado calado artesanal y baño de oro duradero.',
      basePrice: 49.0,
      categoryId: catCollares.id,
      imageUrl: IMG_COLLARES,
      variants: [
        { sku: 'COL-ARB-45CM', price: 49.0, quantity: 15 },
      ],
    },
    {
      title: 'Collar Gargantilla Mariposa Cristal Rosa',
      slug: 'collar-gargantilla-mariposa-cristal',
      description: 'Dije de mariposa facetada en cristal rosa pastel que refleja destellos de luz con cada movimiento.',
      basePrice: 44.0,
      categoryId: catCollares.id,
      imageUrl: IMG_COLLARES,
      variants: [
        { sku: 'COL-MAR-45CM', price: 44.0, quantity: 14 },
      ],
    },
    {
      title: 'Collar Medalla Milagrosa en Plata de Ley',
      slug: 'collar-medalla-milagrosa-plata-925',
      description: 'Medalla protectora con relieve tradicional de alta definición y cadena resistente en plata 925.',
      basePrice: 39.0,
      categoryId: catCollares.id,
      imageUrl: IMG_COLLARES,
      variants: [
        { sku: 'COL-MED-50CM', price: 39.0, quantity: 16 },
      ],
    },

    // Pulseras (5)
    {
      title: 'Pulsera Tennis Zirconia Brillante',
      slug: 'pulsera-tenis-circonias-plata',
      description: 'Elegancia atemporal con una hilera continua de circonias cúbicas montadas sobre engaste de cuatro puntas en plata.',
      basePrice: 55.0,
      categoryId: catPulseras.id,
      imageUrl: IMG_PULSERAS,
      variants: [
        { sku: 'PUL-TEN-17CM', price: 55.0, quantity: 15 },
        { sku: 'PUL-TEN-19CM', price: 58.0, quantity: 10 },
      ],
    },
    {
      title: 'Pulsera Hilo Rojo Protección con Ojo Turco en Oro',
      slug: 'pulsera-hilo-rojo-ojo-turco-oro',
      description: 'Amuleto de protección contra malas energías tejido a mano con dije en baño de oro de 18k.',
      basePrice: 28.0,
      categoryId: catPulseras.id,
      imageUrl: IMG_PULSERAS,
      variants: [
        { sku: 'PUL-OJO-AJUST', price: 28.0, quantity: 30 },
      ],
    },
    {
      title: 'Brazalete Rígido Bangles en Baño de Oro 18k',
      slug: 'brazalete-rigido-bangles-oro-18k',
      description: 'Brazalete de lujo con apertura lateral oculta, pulido espejo y grabado de alta joyería.',
      basePrice: 72.0,
      categoryId: catPulseras.id,
      imageUrl: IMG_PULSERAS,
      variants: [
        { sku: 'BRAZ-BAN-ORO', price: 72.0, quantity: 12 },
      ],
    },
    {
      title: 'Pulsera Trébol de Cuatro Hojas en Plata 925',
      slug: 'pulsera-trebol-cuatro-hojas-plata',
      description: 'Símbolo de buena fortuna con dijes de trébol en concha nácar y eslabones finos ajustables.',
      basePrice: 45.0,
      categoryId: catPulseras.id,
      imageUrl: IMG_PULSERAS,
      variants: [
        { sku: 'PUL-TREB-18CM', price: 45.0, quantity: 18 },
      ],
    },
    {
      title: 'Pulsera Perlas Cultivadas con Broche en Oro',
      slug: 'pulsera-perlas-cultivadas-broche-oro',
      description: 'Perlas naturales de agua dulce de brillo satinado y broche marinero bañado en oro de 18 quilates.',
      basePrice: 52.0,
      categoryId: catPulseras.id,
      imageUrl: IMG_PULSERAS,
      variants: [
        { sku: 'PUL-PERL-18CM', price: 52.0, quantity: 10 },
      ],
    },

    // Aretes (4)
    {
      title: 'Aretes Candongas Huggies en Oro 18k',
      slug: 'aretes-candongas-clasicas-oro',
      description: 'Aretes tipo huggie esenciales para el día a día. Cierre seguro a presión, ultra ligeros y con acabado de alto brillo.',
      basePrice: 32.0,
      categoryId: catAretes.id,
      imageUrl: IMG_ARETES,
      variants: [
        { sku: 'ARE-HUG-10MM', price: 32.0, quantity: 25 },
        { sku: 'ARE-HUG-14MM', price: 36.0, quantity: 20 },
      ],
    },
    {
      title: 'Aretes Solitarios Circonia Suiza en Plata 925',
      slug: 'aretes-solitarios-circonia-plata-925',
      description: 'Topos clásicos con circonias redondas de 6mm y tuerca mariposa de ajuste firme y seguro.',
      basePrice: 26.0,
      categoryId: catAretes.id,
      imageUrl: IMG_ARETES,
      variants: [
        { sku: 'ARE-SOL-6MM', price: 26.0, quantity: 35 },
      ],
    },
    {
      title: 'Aretes Colgantes Gota de Cristal en Oro 18k',
      slug: 'aretes-colgantes-gota-cristal-oro',
      description: 'Diseño refinado para eventos de gala con cristales facetados en forma de lágrima.',
      basePrice: 48.0,
      categoryId: catAretes.id,
      imageUrl: IMG_ARETES,
      variants: [
        { sku: 'ARE-GOT-ORO', price: 48.0, quantity: 15 },
      ],
    },
    {
      title: 'Aretes Trepadores Estrellas en Plata de Ley',
      slug: 'aretes-trepadores-estrellas-plata',
      description: 'Aretes modernos que ascienden por el lóbulo de la oreja con una constelación de estrellas brillantes.',
      basePrice: 34.0,
      categoryId: catAretes.id,
      imageUrl: IMG_ARETES,
      variants: [
        { sku: 'ARE-TREP-PL', price: 34.0, quantity: 22 },
      ],
    },
  ];

  for (const p of productsList) {
    await createProduct(p);
  }

  // 4. Shipping Regions in Ecuador
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
      create: { name: r.name, baseRate: r.baseRate, isActive: true },
    });
  }

  // 5. Coupons
  await prisma.coupon.upsert({
    where: { code: 'BIENVENIDA10' },
    update: {},
    create: { code: 'BIENVENIDA10', discountPercentage: 10, maxUses: 500, isActive: true },
  });

  await prisma.coupon.upsert({
    where: { code: 'ROISIN20' },
    update: {},
    create: { code: 'ROISIN20', discountPercentage: 20, maxUses: 100, isActive: true },
  });

  console.log(`✅ Seed finished! Total products in database: ${productsList.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
