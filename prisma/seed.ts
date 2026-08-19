import 'dotenv/config';
import prisma from '../src/lib/db';
import bcrypt from 'bcryptjs';

// High resolution curated jewelry photos
const IMAGES = {
  ring1: [
    { url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop', label: 'Frontal', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', label: 'Detalle de Gema', isPrimary: false },
    { url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=800&auto=format&fit=crop', label: 'Puesto en Mano', isPrimary: false },
  ],
  ring2: [
    { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', label: 'Frontal', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop', label: 'Ángulo Lateral', isPrimary: false },
  ],
  necklace1: [
    { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', label: 'Frontal', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', label: 'En Modelo', isPrimary: false },
  ],
  necklace2: [
    { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', label: 'Frontal', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', label: 'Detalle Cadena', isPrimary: false },
  ],
  bracelet1: [
    { url: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=800&auto=format&fit=crop', label: 'Frontal', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1611591475152-4779a557b779?q=80&w=800&auto=format&fit=crop', label: 'Detalle Circonias', isPrimary: false },
  ],
  bracelet2: [
    { url: 'https://images.unsplash.com/photo-1611591475152-4779a557b779?q=80&w=800&auto=format&fit=crop', label: 'Frontal', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=800&auto=format&fit=crop', label: 'Puesto en Muñeca', isPrimary: false },
  ],
  earrings1: [
    { url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop', label: 'Frontal', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', label: 'En Modelo', isPrimary: false },
  ],
  earrings2: [
    { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', label: 'Frontal', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop', label: 'Detalle Broche', isPrimary: false },
  ],
};

async function main() {
  console.log('🔄 Limpiando base de datos para inicialización limpia...');

  // Limpieza en orden de restricciones
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItemOption.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.collectionProduct.deleteMany({});
  await prisma.productOptionGroupAssignment.deleteMany({});
  await prisma.productOption.deleteMany({});
  await prisma.productOptionGroup.deleteMany({});
  await prisma.variantAttributeValue.deleteMany({});
  await prisma.productAttributeValue.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.shippingRegion.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Base de datos limpia.');

  // 1. Usuarios Oficiales
  console.log('👤 Creando usuarios...');
  const adminPasswordHash = await bcrypt.hash('Admin123*', 10);
  const clientPasswordHash = await bcrypt.hash('Cliente123*', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@roisinjoyas.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      customerProfile: {
        create: {
          firstName: 'Administrador',
          lastName: 'ROISIN',
          phone: '0999999999',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'cliente@roisinjoyas.com',
      passwordHash: clientPasswordHash,
      role: 'CUSTOMER',
      customerProfile: {
        create: {
          firstName: 'Eduin',
          lastName: 'Gómez',
          phone: '0987654321',
        },
      },
    },
  });

  // 2. Tarifas de Envío por Región
  console.log('🚚 Creando tarifas de envío...');
  const regGye = await prisma.shippingRegion.create({
    data: {
      name: 'Guayaquil, Samborondón & Durán',
      baseRate: 3.00,
      description: 'Entrega rápida en 24 horas laborables',
      isActive: true,
    },
  });

  const regNac = await prisma.shippingRegion.create({
    data: {
      name: 'Otros Destinos - Nacional (Quito, Cuenca, etc.)',
      baseRate: 6.00,
      description: 'Entrega segura en 24 a 48 horas con Servientrega',
      isActive: true,
    },
  });

  const regGps = await prisma.shippingRegion.create({
    data: {
      name: 'Galápagos (San Cristóbal, Santa Cruz)',
      baseRate: 12.00,
      description: 'Envío aéreo prioritario en 3 a 5 días laborables',
      isActive: true,
    },
  });

  // 3. Categorías Oficiales
  console.log('🏷️ Creando categorías...');
  const catAnillos = await prisma.category.create({
    data: {
      name: 'Anillos',
      slug: 'anillos',
      description: 'Anillos de promesa, solitarios eternos y alianzas en Plata 925 y Oro 18k.',
      imageUrl: IMAGES.ring1[0].url,
    },
  });

  const catCollares = await prisma.category.create({
    data: {
      name: 'Collares & Gargantillas',
      slug: 'collares',
      description: 'Cadenas delicadas, puntos de luz y dijes con amatistas suizas.',
      imageUrl: IMAGES.necklace1[0].url,
    },
  });

  const catPulseras = await prisma.category.create({
    data: {
      name: 'Pulseras & Brazaletes',
      slug: 'pulseras',
      description: 'Pulseras tennis con circonias de corte brillante y brazaletes rígidos.',
      imageUrl: IMAGES.bracelet1[0].url,
    },
  });

  const catAretes = await prisma.category.create({
    data: {
      name: 'Aretes & Candongas',
      slug: 'aretes',
      description: 'Huggies y aretes de lujo que iluminan cada mirada.',
      imageUrl: IMAGES.earrings1[0].url,
    },
  });

  // 4. Colecciones Exclusivas
  console.log('💎 Creando colecciones...');
  const colDiamanteMorado = await prisma.collection.create({
    data: {
      name: 'Colección Diamante Morado 2026',
      slug: 'diamante-morado-2026',
      description: 'Nuestra más alta expresión de elegancia y distinción en tono amatista.',
      imageUrl: IMAGES.ring1[0].url,
      bannerUrl: IMAGES.ring1[1].url,
    },
  });

  const colPromesa = await prisma.collection.create({
    data: {
      name: 'Colección Promesa Eterna',
      slug: 'promesa-eterna',
      description: 'Anillos y duetos para sellar momentos inolvidables de amor.',
      imageUrl: IMAGES.ring2[0].url,
    },
  });

  const colSanValentin = await prisma.collection.create({
    data: {
      name: 'Colección San Valentín & Amor',
      slug: 'san-valentin',
      description: 'Sets románticos y dijes de corazón con empaque especial.',
      imageUrl: IMAGES.necklace1[0].url,
    },
  });

  const colPlata = await prisma.collection.create({
    data: {
      name: 'Joyas en Plata Ley 925',
      slug: 'plata-925',
      description: 'Pureza certificada y acabado de rodio para un brillo eterno.',
      imageUrl: IMAGES.bracelet1[0].url,
    },
  });

  const colOro = await prisma.collection.create({
    data: {
      name: 'Alta Gama Baño de Oro 18k',
      slug: 'oro-18k',
      description: 'Piezas con triple baño de oro amarillo de 18 quilates.',
      imageUrl: IMAGES.necklace2[0].url,
    },
  });

  // 5. Banners & Promociones
  console.log('📢 Creando promociones...');
  await prisma.promotion.createMany({
    data: [
      {
        title: 'Anillos de Promesa Morado Amatista',
        subtitle: 'El símbolo eterno del amor en Plata Fina 925',
        badge: 'NUEVA COLECCIÓN',
        discountText: 'HASTA 25% OFF',
        imageUrl: IMAGES.ring1[0].url,
        targetUrl: '/productos?category=anillos',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'Collares con Baño de Oro 18k',
        subtitle: 'Diseños que realzan tu belleza natural todos los días',
        badge: 'MÁS DESEADOS',
        discountText: 'ENVÍO GRATIS',
        imageUrl: IMAGES.necklace1[0].url,
        targetUrl: '/productos?category=collares',
        sortOrder: 2,
        isActive: true,
      },
      {
        title: 'Sets Especiales de Amor & Regalo',
        subtitle: 'Empaque de lujo y tarjeta con dedicatoria personalizada',
        badge: 'REGALO PERFECTO',
        discountText: '20% OFF',
        imageUrl: IMAGES.necklace2[0].url,
        targetUrl: '/productos?ofertas=true',
        sortOrder: 3,
        isActive: true,
      },
      {
        title: 'Pulseras Tennis Diamante Morado',
        subtitle: 'Circonias suizas de corte brillante en engaste artesanal',
        badge: 'EDICIÓN LIMITADA',
        discountText: '15% OFF',
        imageUrl: IMAGES.bracelet1[0].url,
        targetUrl: '/productos?category=pulseras',
        sortOrder: 4,
        isActive: true,
      },
    ],
  });

  // 6. Cupones de Descuento
  console.log('🎟️ Creando cupones...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'AMATISTA15',
        discountPercentage: 15,
        maxUses: 100,
        currentUses: 0,
        isActive: true,
        validUntil: new Date('2027-12-31'),
      },
      {
        code: 'AMOR2026',
        discountPercentage: 20,
        maxUses: 50,
        currentUses: 0,
        isActive: true,
        validUntil: new Date('2027-12-31'),
      },
      {
        code: 'BIENVENIDA10',
        discountPercentage: 10,
        maxUses: 200,
        currentUses: 0,
        isActive: true,
        validUntil: new Date('2027-12-31'),
      },
    ],
  });

  // 7. Grupo de Opciones de Presentación
  console.log('🎁 Creando opciones de presentación...');
  const optGroupPresentation = await prisma.productOptionGroup.create({
    data: {
      id: 'opt-group-presentation',
      name: 'Presentación & Empaque',
      description: 'Elige cómo deseas recibir o enviar tu joya.',
      isMultiSelect: false,
      options: {
        create: [
          { name: 'Caja Joyera Roisin con Lazo Morado', priceModifier: 0.0, isDefault: true, sortOrder: 0 },
          { name: 'Empaque de Lujo Especial + Tarjeta Dedicatoria', priceModifier: 4.0, isDefault: false, sortOrder: 1 },
          { name: 'Funda de Terciopelo Púrpura Premium', priceModifier: 2.5, isDefault: false, sortOrder: 2 },
        ],
      },
    },
  });

  // Atributos de Tallas
  const attrTalla = await prisma.productAttribute.create({
    data: {
      name: 'Talla',
      values: {
        create: [
          { value: 'Talla 6 (16.5 mm)' },
          { value: 'Talla 7 (17.3 mm)' },
          { value: 'Talla 8 (18.1 mm)' },
          { value: 'Talla 9 (18.9 mm)' },
        ],
      },
    },
    include: { values: true },
  });

  const valTalla6 = attrTalla.values.find((v) => v.value.includes('Talla 6'))!;
  const valTalla7 = attrTalla.values.find((v) => v.value.includes('Talla 7'))!;
  const valTalla8 = attrTalla.values.find((v) => v.value.includes('Talla 8'))!;
  const valTalla9 = attrTalla.values.find((v) => v.value.includes('Talla 9'))!;

  // 8. CREACIÓN DE PRODUCTOS
  console.log('💍 Creando catálogo de joyas (Con descuento, sin descuento, variantes y únicas)...');

  // PRODUCTOS CON DESCUENTO (5)
  // 1. Anillo Insignia Diamante Morado (Pieza Más Deseada #1 - Multi-variante con tallas)
  const p1 = await prisma.product.create({
    data: {
      title: 'Anillo Solitario Diamante Morado Amatista',
      slug: 'anillo-solitario-diamante-morado',
      tag: 'Más Deseado',
      shortDescription: 'Plata de Ley 925 con gema central amatista de corte esmeralda y circonias laterales.',
      description: 'Una pieza insignia de ROISIN inspirada en el brillo majestuoso del Diamante Morado. Forjado en Plata de Ley 925 con baño protector de rodio y engaste a 4 uñas de una amatista suiza de máxima pureza.',
      basePrice: 42.00,
      compareAtPrice: 55.00,
      discountPercent: 24,
      isActive: true,
      isFeatured: true,
      categoryId: catAnillos.id,
      collections: {
        create: [
          { collectionId: colDiamanteMorado.id, sortOrder: 0 },
          { collectionId: colPromesa.id, sortOrder: 1 },
        ],
      },
      images: {
        create: IMAGES.ring1.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      optionGroupLinks: {
        create: [{ groupId: optGroupPresentation.id }],
      },
      variants: {
        create: [
          {
            sku: 'AN-MOR-T6',
            price: 42.00,
            compareAtPrice: 55.00,
            inventory: { create: { quantity: 15 } },
            attributes: { create: [{ attributeValueId: valTalla6.id }] },
          },
          {
            sku: 'AN-MOR-T7',
            price: 42.00,
            compareAtPrice: 55.00,
            inventory: { create: { quantity: 20 } },
            attributes: { create: [{ attributeValueId: valTalla7.id }] },
          },
          {
            sku: 'AN-MOR-T8',
            price: 42.00,
            compareAtPrice: 55.00,
            inventory: { create: { quantity: 12 } },
            attributes: { create: [{ attributeValueId: valTalla8.id }] },
          },
          {
            sku: 'AN-MOR-T9',
            price: 42.00,
            compareAtPrice: 55.00,
            inventory: { create: { quantity: 8 } },
            attributes: { create: [{ attributeValueId: valTalla9.id }] },
          },
        ],
      },
    },
  });

  // 2. Collar Corazón de Amor Infinito (Con descuento - Único)
  await prisma.product.create({
    data: {
      title: 'Collar Corazón de Amor Infinito en Plata 925',
      slug: 'collar-corazon-amor-infinito',
      tag: 'Oferta Especial',
      shortDescription: 'Cadena veneciana de 45cm con dije de corazón entrelazado y circonia suiza.',
      description: 'El regalo definitivo para expresar amor sincero. Dije tallado en plata fina 925 con destellos brillantes y cadena resistente hipoalergénica.',
      basePrice: 32.00,
      compareAtPrice: 40.00,
      discountPercent: 20,
      isActive: true,
      isFeatured: true,
      categoryId: catCollares.id,
      collections: {
        create: [
          { collectionId: colSanValentin.id, sortOrder: 0 },
          { collectionId: colPlata.id, sortOrder: 1 },
        ],
      },
      images: {
        create: IMAGES.necklace1.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      optionGroupLinks: {
        create: [{ groupId: optGroupPresentation.id }],
      },
      variants: {
        create: [
          {
            sku: 'COL-CORAZON-STD',
            price: 32.00,
            compareAtPrice: 40.00,
            inventory: { create: { quantity: 25 } },
          },
        ],
      },
    },
  });

  // 3. Pulsera Tennis Clásica Amatista (Con descuento - Única)
  await prisma.product.create({
    data: {
      title: 'Pulsera Tennis Royale Amatista',
      slug: 'pulsera-tennis-royale-amatista',
      tag: 'Más Vendido',
      shortDescription: 'Circonias amatista continuas en engaste francés con cierre de seguridad doble.',
      description: 'Elegancia atemporal que envuelve la muñeca con un resplandor púrpura hipnotizante. Ajuste perfecto de 18cm extensible a 20cm.',
      basePrice: 48.00,
      compareAtPrice: 60.00,
      discountPercent: 20,
      isActive: true,
      isFeatured: true,
      categoryId: catPulseras.id,
      collections: {
        create: [
          { collectionId: colDiamanteMorado.id, sortOrder: 0 },
          { collectionId: colPlata.id, sortOrder: 1 },
        ],
      },
      images: {
        create: IMAGES.bracelet1.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      variants: {
        create: [
          {
            sku: 'PUL-TENNIS-MOR',
            price: 48.00,
            compareAtPrice: 60.00,
            inventory: { create: { quantity: 18 } },
          },
        ],
      },
    },
  });

  // 4. Aretes Huggies Pavé Púrpura (Con descuento - Único)
  await prisma.product.create({
    data: {
      title: 'Aretes Huggies Pavé Diamante Morado',
      slug: 'aretes-huggies-pave-diamante-morado',
      tag: 'Oferta',
      shortDescription: 'Candongas pequeñas de ajuste click en Plata 925 con pavé frontal de circonias amatista.',
      description: 'Comodidad total para el uso diario sin renunciar al brillo y sofisticación. Hipoalergénicos y seguros.',
      basePrice: 24.00,
      compareAtPrice: 32.00,
      discountPercent: 25,
      isActive: true,
      isFeatured: true,
      categoryId: catAretes.id,
      collections: {
        create: [
          { collectionId: colDiamanteMorado.id, sortOrder: 0 },
          { collectionId: colPlata.id, sortOrder: 1 },
        ],
      },
      images: {
        create: IMAGES.earrings1.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      variants: {
        create: [
          {
            sku: 'ARE-HUG-PAVE',
            price: 24.00,
            compareAtPrice: 32.00,
            inventory: { create: { quantity: 30 } },
          },
        ],
      },
    },
  });

  // 5. Anillo Dueto Promesa Eterna (Con descuento - Multi-variante)
  await prisma.product.create({
    data: {
      title: 'Anillo Dueto de Promesa & Alianza',
      slug: 'anillo-dueto-promesa-alianza',
      tag: 'San Valentín',
      shortDescription: 'Set de dos anillos acoplables en Plata 925 con baño de rodio blanco.',
      description: 'La alianza y el solitario se unen en perfecta armonía. Diseñado para sellar compromisos inolvidables.',
      basePrice: 52.00,
      compareAtPrice: 65.00,
      discountPercent: 20,
      isActive: true,
      isFeatured: true,
      categoryId: catAnillos.id,
      collections: {
        create: [
          { collectionId: colPromesa.id, sortOrder: 0 },
          { collectionId: colSanValentin.id, sortOrder: 1 },
        ],
      },
      images: {
        create: IMAGES.ring2.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      variants: {
        create: [
          {
            sku: 'AN-DUETO-T6',
            price: 52.00,
            compareAtPrice: 65.00,
            inventory: { create: { quantity: 10 } },
            attributes: { create: [{ attributeValueId: valTalla6.id }] },
          },
          {
            sku: 'AN-DUETO-T7',
            price: 52.00,
            compareAtPrice: 65.00,
            inventory: { create: { quantity: 14 } },
            attributes: { create: [{ attributeValueId: valTalla7.id }] },
          },
          {
            sku: 'AN-DUETO-T8',
            price: 52.00,
            compareAtPrice: 65.00,
            inventory: { create: { quantity: 12 } },
            attributes: { create: [{ attributeValueId: valTalla8.id }] },
          },
        ],
      },
    },
  });

  // PRODUCTOS SIN DESCUENTO (5)
  // 6. Gargantilla Solitaria Oro 18k (Sin descuento - Único)
  await prisma.product.create({
    data: {
      title: 'Gargantilla Solitaria Punto de Luz Oro 18k',
      slug: 'gargantilla-solitaria-oro-18k',
      tag: 'Nuevo',
      shortDescription: 'Cadena fina con triple baño de oro 18k y circonia solitario de 6mm.',
      description: 'Una joya minimalista que aporta una calidez y elegancia incomparable a cualquier escote.',
      basePrice: 38.00,
      isActive: true,
      isFeatured: true,
      categoryId: catCollares.id,
      collections: {
        create: [
          { collectionId: colOro.id, sortOrder: 0 },
        ],
      },
      images: {
        create: IMAGES.necklace2.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      variants: {
        create: [
          {
            sku: 'COL-ORO-PUNTO',
            price: 38.00,
            inventory: { create: { quantity: 20 } },
          },
        ],
      },
    },
  });

  // 7. Anillo Corona de Princesa Plata 925 (Sin descuento - Multi-variante)
  await prisma.product.create({
    data: {
      title: 'Anillo Corona Real de Princesa',
      slug: 'anillo-corona-real-princesa',
      tag: 'Edición Especial',
      shortDescription: 'Diseño en forma de tiara imperial con circonias suizas de corte brillante.',
      description: 'Para la reina de tu vida. Hecho a mano en Plata Esterlina 925 con meticulosos detalles de orfebrería.',
      basePrice: 45.00,
      isActive: true,
      isFeatured: true,
      categoryId: catAnillos.id,
      collections: {
        create: [
          { collectionId: colPlata.id, sortOrder: 0 },
          { collectionId: colPromesa.id, sortOrder: 1 },
        ],
      },
      images: {
        create: IMAGES.ring1.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      variants: {
        create: [
          {
            sku: 'AN-CORONA-T6',
            price: 45.00,
            inventory: { create: { quantity: 10 } },
            attributes: { create: [{ attributeValueId: valTalla6.id }] },
          },
          {
            sku: 'AN-CORONA-T7',
            price: 45.00,
            inventory: { create: { quantity: 15 } },
            attributes: { create: [{ attributeValueId: valTalla7.id }] },
          },
          {
            sku: 'AN-CORONA-T8',
            price: 45.00,
            inventory: { create: { quantity: 10 } },
            attributes: { create: [{ attributeValueId: valTalla8.id }] },
          },
        ],
      },
    },
  });

  // 8. Brazalete Rígido Infinity Oro 18k (Sin descuento - Único)
  await prisma.product.create({
    data: {
      title: 'Brazalete Rígido Infinity en Baño de Oro 18k',
      slug: 'brazalete-rigido-infinity-oro-18k',
      tag: 'Exclusivo',
      shortDescription: 'Brazalete ovalado con símbolo de infinito y apertura lateral invisible.',
      description: 'Lujo sutil y presencia imponente. Acabado espejo pulido de alta resistencia.',
      basePrice: 55.00,
      isActive: true,
      isFeatured: true,
      categoryId: catPulseras.id,
      collections: {
        create: [
          { collectionId: colOro.id, sortOrder: 0 },
        ],
      },
      images: {
        create: IMAGES.bracelet2.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      variants: {
        create: [
          {
            sku: 'BRA-INF-ORO',
            price: 55.00,
            inventory: { create: { quantity: 12 } },
          },
        ],
      },
    },
  });

  // 9. Aretes Colgantes Lágrima Amatista (Sin descuento - Único)
  await prisma.product.create({
    data: {
      title: 'Aretes Colgantes Lágrima Diamante Morado',
      slug: 'aretes-colgantes-lagrima-diamante-morado',
      tag: 'Alta Joyería',
      shortDescription: 'Aretes de fiesta con gota facetada amatista y marco de microcirconias.',
      description: 'Ideales para eventos de gala y ocasiones memorables. Movimiento fluido y destello espectacular.',
      basePrice: 36.00,
      isActive: true,
      isFeatured: false,
      categoryId: catAretes.id,
      collections: {
        create: [
          { collectionId: colDiamanteMorado.id, sortOrder: 0 },
          { collectionId: colPlata.id, sortOrder: 1 },
        ],
      },
      images: {
        create: IMAGES.earrings2.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      variants: {
        create: [
          {
            sku: 'ARE-LAG-MOR',
            price: 36.00,
            inventory: { create: { quantity: 16 } },
          },
        ],
      },
    },
  });

  // 10. Collar Árbol de la Vida en Plata 925 (Sin descuento - Único)
  await prisma.product.create({
    data: {
      title: 'Collar Árbol de la Vida y Raíces de Amor',
      slug: 'collar-arbol-de-la-vida-plata-925',
      tag: 'Significado',
      shortDescription: 'Medalla calada en Plata 925 con ramas entrelazadas y microcirconias.',
      description: 'Símbolo de crecimiento, fuerza y familia. Un amuleto protector cargado de buenas energías.',
      basePrice: 34.00,
      isActive: true,
      isFeatured: false,
      categoryId: catCollares.id,
      collections: {
        create: [
          { collectionId: colPlata.id, sortOrder: 0 },
        ],
      },
      images: {
        create: IMAGES.necklace1.map((img, idx) => ({
          url: img.url,
          label: img.label,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        })),
      },
      variants: {
        create: [
          {
            sku: 'COL-ARBOL-STD',
            price: 34.00,
            inventory: { create: { quantity: 22 } },
          },
        ],
      },
    },
  });

  console.log('✅ Seed completado con éxito con 10 joyas insignia, colecciones, cupones, promociones y tarifas de envío.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
