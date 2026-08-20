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
  sunflower: [
    { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', label: 'Frontal', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', label: 'Detalle Girasol', isPrimary: false },
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

  // Limpieza en orden estricto de relaciones foráneas
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
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
  await prisma.promotionProduct.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.storeSetting.deleteMany({});
  await prisma.shippingRegion.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Base de datos completamente limpia.');

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
          lastName: 'Roisin',
          phone: '0999999999',
        },
      },
    },
  });

  const customer = await prisma.user.create({
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

  // 2. Ajustes de la Tienda (Envío Gratis Dinámico)
  console.log('⚙️ Creando ajustes de tienda...');
  await prisma.storeSetting.create({
    data: {
      key: 'free_shipping_threshold',
      value: '50.00',
      type: 'number',
      label: 'Monto mínimo para Envío Gratis ($)',
    },
  });

  // 3. Tarifas de Envío por Región
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

  // 4. Categorías
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
      name: 'Collares & Dijes',
      slug: 'collares',
      description: 'Cadenas finas, gargantillas y dijes con gemas preciosas.',
      imageUrl: IMAGES.necklace1[0].url,
    },
  });

  const catPulseras = await prisma.category.create({
    data: {
      name: 'Pulseras & Brazaletes',
      slug: 'pulseras',
      description: 'Pulseras tennis, esclavas y brazaletes rígidos con incrustaciones.',
      imageUrl: IMAGES.bracelet1[0].url,
    },
  });

  const catAretes = await prisma.category.create({
    data: {
      name: 'Aretes & Candongas',
      slug: 'aretes',
      description: 'Topos brillantes, aros colgantes y huggies de alta joyería.',
      imageUrl: IMAGES.earrings1[0].url,
    },
  });

  // 5. Colecciones Exclusivas
  console.log('💎 Creando colecciones...');
  const colDiamanteMorado = await prisma.collection.create({
    data: {
      name: 'Colección Diamante Morado',
      slug: 'diamante-morado',
      description: 'El emblema y sello distintivo de ROISIN. Gemas amatistas suizas talladas en facetas de diamante.',
      imageUrl: IMAGES.ring1[0].url,
      isActive: true,
    },
  });

  const colPromesa = await prisma.collection.create({
    data: {
      name: 'Promesa de Amor Eterno',
      slug: 'promesa-de-amor',
      description: 'Joyas forjadas para inmortalizar compromisos, aniversarios y momentos inolvidables.',
      imageUrl: IMAGES.ring2[0].url,
      isActive: true,
    },
  });

  const colReal = await prisma.collection.create({
    data: {
      name: 'Colección Real Oro 18k',
      slug: 'coleccion-real',
      description: 'Lujosos acabados en triple baño de oro amarillo y oro rosa sobre plata esterlina 925.',
      imageUrl: IMAGES.necklace2[0].url,
      isActive: true,
    },
  });

  // 6. Promociones / Banners (Pure Artwork with Collection & Product Destinations)
  console.log('📢 Creando promociones...');
  await prisma.promotion.createMany({
    data: [
      {
        title: 'Colección Diamante Morado 2026',
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop',
        targetType: 'COLLECTION',
        collectionId: colDiamanteMorado.id,
        targetUrl: `/productos?collection=${colDiamanteMorado.slug}`,
        discountPercent: 20,
        isActive: true,
        sortOrder: 0,
      },
      {
        title: 'Alta Joyería en Baño de Oro 18k Real',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
        targetType: 'COLLECTION',
        collectionId: colReal.id,
        targetUrl: `/productos?collection=${colReal.slug}`,
        discountPercent: 15,
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Especial Anillos de Promesa & Compromiso',
        imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=1200&auto=format&fit=crop',
        targetType: 'COLLECTION',
        collectionId: colPromesa.id,
        targetUrl: `/productos?collection=${colPromesa.slug}`,
        discountPercent: 25,
        isActive: true,
        sortOrder: 2,
      },
      {
        title: 'Pulseras Tennis & Candongas de Lujo',
        imageUrl: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=1200&auto=format&fit=crop',
        targetType: 'COLLECTION',
        collectionId: colDiamanteMorado.id,
        targetUrl: `/productos?collection=${colDiamanteMorado.slug}`,
        discountPercent: 10,
        isActive: true,
        sortOrder: 3,
      },
    ],
  });

  // 7. Reseñas y Testimonios con Fotos y Videos
  console.log('⭐ Creando reseñas de clientas...');
  await prisma.review.createMany({
    data: [
      {
        authorName: 'Camila Mendoza',
        location: 'Guayaquil, Ecuador',
        rating: 5,
        comment: 'Compré el anillo solitario en plata 925 y el brillo es sencillamente espectacular. La presentación para regalo superó mis expectativas y llegó en 24 horas a Guayaquil.',
        mediaUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
        mediaType: 'IMAGE',
        productTitle: 'Anillo Solitario Diamante Morado',
        isVerified: true,
        sortOrder: 0,
        isActive: true,
      },
      {
        authorName: 'Valeria Santamaría',
        location: 'Quito, Ecuador',
        rating: 5,
        comment: 'La pulsera tennis tiene un acabado finísimo y un peso perfecto. Me ayudaron con la medida por WhatsApp y la atención fue sumamente cálida y atenta.',
        mediaUrl: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=800&auto=format&fit=crop',
        mediaType: 'IMAGE',
        productTitle: 'Pulsera Tennis Circonia Suiza',
        isVerified: true,
        sortOrder: 1,
        isActive: true,
      },
      {
        authorName: 'Sofía Noboa',
        location: 'Cuenca, Ecuador',
        rating: 5,
        comment: 'Los aretes huggies no me los quito para nada; son súper cómodos, no pesan y no pierden el brillo. 100% recomendados para cualquier ocasión.',
        mediaUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
        mediaType: 'IMAGE',
        productTitle: 'Aretes Candonga Huggies Oro 18k',
        isVerified: true,
        sortOrder: 2,
        isActive: true,
      },
      {
        authorName: 'Doménica Alarcón',
        location: 'Samborondón, Ecuador',
        rating: 5,
        comment: 'El empaque rígido con lazo morado y la tarjeta con el mensaje que escribí para mi novia quedó impecable. Un regalo 10/10.',
        mediaUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
        mediaType: 'IMAGE',
        productTitle: 'Gargantilla Diamante Morado',
        isVerified: true,
        sortOrder: 3,
        isActive: true,
      },
      {
        authorName: 'Andrea Carrera',
        location: 'Manta, Ecuador',
        rating: 5,
        comment: 'Pedí el collar girasol para el cumpleaños de mi mamá y le fascinó. La calidad de la plata y el certificado le dan mucha confianza a la compra.',
        mediaUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
        mediaType: 'IMAGE',
        productTitle: 'Collar Girasol Esmaltado',
        isVerified: true,
        sortOrder: 4,
        isActive: true,
      },
      {
        authorName: 'Paulina Velasteguí',
        location: 'Ambato, Ecuador',
        rating: 5,
        comment: 'Llegó rapidísimo por Servientrega y todo súper bien embalado. Las joyas en persona son aún más hermosas que en las fotos.',
        mediaUrl: 'https://images.unsplash.com/photo-1611591475152-4779a557b779?q=80&w=800&auto=format&fit=crop',
        mediaType: 'IMAGE',
        productTitle: 'Brazalete Infinito Plata 925',
        isVerified: true,
        sortOrder: 5,
        isActive: true,
      },
    ],
  });

  // 8. Preguntas Frecuentes (FAQ)
  console.log('❓ Creando preguntas frecuentes...');
  await prisma.faq.createMany({
    data: [
      {
        question: '¿Qué garantía y autenticidad tienen las joyas de ROISIN?',
        answer: 'Todas nuestras piezas están forjadas en auténtica Plata de Ley 925 contrastada y baños de Oro de 18 kilates hipoalergénicos (libres de níquel y plomo). Cada joya incluye sello de garantía y guía de cuidado para preservar su brillo de por vida.',
        category: 'Garantía & Materiales',
        sortOrder: 0,
        isActive: true,
      },
      {
        question: '¿Cómo funciona la dedicatoria y el empaque de regalo?',
        answer: 'Al seleccionar tu joya, puedes elegir la presentación de regalo y escribir una dedicatoria personalizada. Nosotros imprimimos tu mensaje en una tarjeta especial de alta calidad y la colocamos dentro de la caja rígida con lazo morado de seda, lista para entregar o enviar directamente a esa persona especial.',
        category: 'Empaques & Regalos',
        sortOrder: 1,
        isActive: true,
      },
      {
        question: '¿Cuáles son los tiempos y costos de envío en Ecuador?',
        answer: 'Realizamos entregas a todo el país: Guayaquil y Samborondón ($3, entrega el mismo día o 24h), Resto del País por Servientrega ($6, entrega en 24h a 48h) y Galápagos por carga aérea ($12, 3 a 5 días). En compras superiores a $70 el envío nacional es gratis.',
        category: 'Envíos & Tiempos',
        sortOrder: 2,
        isActive: true,
      },
      {
        question: '¿Cómo elijo mi talla correcta de anillo?',
        answer: 'En la página de cada anillo dispones de una guía interactiva de tallas con instrucciones paso a paso para medir el diámetro interior de un anillo actual o el contorno de tu dedo. Si tienes dudas, puedes escribirnos por WhatsApp y te asesoramos al instante.',
        category: 'Tallas & Medidas',
        sortOrder: 3,
        isActive: true,
      },
      {
        question: '¿Cuáles son las formas de pago disponibles?',
        answer: 'Aceptamos transferencias bancarias directas (Banco Pichincha, Banco Guayaquil, Produbanco), depósitos, tarjetas de crédito/débito y pagos contra entrega para la ciudad de Guayaquil.',
        category: 'Pagos & Seguridad',
        sortOrder: 4,
        isActive: true,
      },
    ],
  });

  // 7. Cupones de Descuento
  console.log('🎟️ Creando cupones...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'AMATISTA15',
        discountPercentage: 15,
        maxUses: 500,
        isActive: true,
      },
      {
        code: 'BIENVENIDA10',
        discountPercentage: 10,
        maxUses: 1000,
        isActive: true,
      },
      {
        code: 'ROISIN20',
        discountPercentage: 20,
        maxUses: 200,
        isActive: true,
      },
    ],
  });

  // 8. Grupo de Opciones de Presentación & Empaque (4 Opciones con Foto Real)
  console.log('🎁 Creando opciones de presentación...');
  const optGroupPresentation = await prisma.productOptionGroup.create({
    data: {
      id: 'opt-group-presentation',
      name: 'Presentación & Empaque',
      description: 'Elige cómo deseas recibir o enviar tu joya.',
      isMultiSelect: false,
      options: {
        create: [
          {
            name: 'Caja Joyera Roisin con Lazo Morado',
            description: 'Caja rígida protectora con lazo de raso morado y esponja interior aterciopelada.',
            priceModifier: 0.0,
            imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
            isDefault: true,
            sortOrder: 0,
            images: {
              create: [
                { url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', altText: 'Exterior con Lazo Morado', sortOrder: 0 },
                { url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=800&auto=format&fit=crop', altText: 'Interior Aterciopelado', sortOrder: 1 },
                { url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop', altText: 'Presentación Completa de Entrega', sortOrder: 2 },
              ],
            },
          },
          {
            name: 'Empaque de Lujo Especial + Tarjeta Dedicatoria',
            description: 'Caja joyera de lujo, lazo amatista, bolsa de regalo y tarjeta impresa con dedicatoria.',
            priceModifier: 4.0,
            imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop',
            isDefault: false,
            sortOrder: 1,
            images: {
              create: [
                { url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop', altText: 'Empaque de Lujo y Bolsa Roisin', sortOrder: 0 },
                { url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', altText: 'Tarjeta con Dedicatoria Impresa', sortOrder: 1 },
              ],
            },
          },
          {
            name: 'Funda de Terciopelo Púrpura Premium',
            description: 'Bolsita de terciopelo morado con grabado y cordón satinado, ideal para viaje.',
            priceModifier: 2.5,
            imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
            isDefault: false,
            sortOrder: 2,
            images: {
              create: [
                { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop', altText: 'Funda de Terciopelo Morado', sortOrder: 0 },
                { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', altText: 'Joya Protegida en Funda', sortOrder: 1 },
              ],
            },
          },
          {
            name: 'Cofre Joyero Aterciopelado con Espejo',
            description: 'Cofre rígido premium de doble compartimento con forro suave y espejo interior.',
            priceModifier: 6.0,
            imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
            isDefault: false,
            sortOrder: 3,
            images: {
              create: [
                { url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', altText: 'Cofre Joyero Cerrado', sortOrder: 0 },
                { url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', altText: 'Interior con Espejo y Compartimentos', sortOrder: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  // 9. Atributos de Variantes: Color/Material y Talla/Medida
  console.log('🎨 Creando atributos de variantes...');
  const attrColor = await prisma.productAttribute.create({
    data: {
      name: 'Color / Material',
      values: {
        create: [
          { value: 'Plata Rodio 925' },
          { value: 'Baño Oro 18k' },
          { value: 'Oro Rosa 18k' },
        ],
      },
    },
    include: { values: true },
  });

  const attrTalla = await prisma.productAttribute.create({
    data: {
      name: 'Talla',
      values: {
        create: [
          { value: 'Talla 6 (16.5 mm)' },
          { value: 'Talla 7 (17.3 mm)' },
          { value: 'Talla 8 (18.1 mm)' },
          { value: 'Talla 9 (18.9 mm)' },
          { value: 'Longitud 45 cm' },
          { value: 'Longitud 50 cm' },
          { value: 'Ajustable 16-19 cm' },
        ],
      },
    },
    include: { values: true },
  });

  const valPlata = attrColor.values.find((v) => v.value.includes('Plata'))!;
  const valOro = attrColor.values.find((v) => v.value.includes('Oro 18k'))!;
  const valOroRosa = attrColor.values.find((v) => v.value.includes('Oro Rosa'))!;

  const valTalla6 = attrTalla.values.find((v) => v.value.includes('Talla 6'))!;
  const valTalla7 = attrTalla.values.find((v) => v.value.includes('Talla 7'))!;
  const valTalla8 = attrTalla.values.find((v) => v.value.includes('Talla 8'))!;
  const valTalla9 = attrTalla.values.find((v) => v.value.includes('Talla 9'))!;
  const valLong45 = attrTalla.values.find((v) => v.value.includes('45 cm'))!;
  const valLong50 = attrTalla.values.find((v) => v.value.includes('50 cm'))!;
  const valAjustable = attrTalla.values.find((v) => v.value.includes('Ajustable'))!;

  // 10. CREACIÓN DE PRODUCTOS CON NOMBRES CORTOS, DESCRIPCIÓN CORTA Y LARGA
  console.log('💍 Creando catálogo de joyas con nombres concisos y variantes...');

  // 1. Collar de Girasol (Con Descuento - Multi Color y Longitud)
  const p1 = await prisma.product.create({
    data: {
      title: 'Collar de Girasol',
      slug: 'collar-de-girasol',
      tag: 'Más Deseado',
      shortDescription: 'Gargantilla de girasol radiante forjada en Plata 925 con Baño de Oro 18k y circonias suizas.',
      description: 'Inspirado en la luz eterna del sol y la devoción sincera. El dije de girasol presenta pétalos finamente esculpidos con engaste de circonias que reflejan destellos dorados con cada movimiento. Incluye cadena veneciana hipoalergénica.',
      basePrice: 38.00,
      compareAtPrice: 50.00,
      discountPercent: 24,
      isActive: true,
      isFeatured: true,
      categoryId: catCollares.id,
      collections: {
        create: [
          { collectionId: colPromesa.id, sortOrder: 0 },
          { collectionId: colReal.id, sortOrder: 1 },
        ],
      },
      images: {
        create: IMAGES.sunflower.map((img, idx) => ({
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
            sku: 'COL-GIR-ORO-45',
            price: 38.00,
            compareAtPrice: 50.00,
            inventory: { create: { quantity: 20 } },
            attributes: {
              create: [
                { attributeValueId: valOro.id },
                { attributeValueId: valLong45.id },
              ],
            },
          },
          {
            sku: 'COL-GIR-ORO-50',
            price: 40.00,
            compareAtPrice: 52.00,
            inventory: { create: { quantity: 15 } },
            attributes: {
              create: [
                { attributeValueId: valOro.id },
                { attributeValueId: valLong50.id },
              ],
            },
          },
          {
            sku: 'COL-GIR-PLT-45',
            price: 35.00,
            compareAtPrice: 48.00,
            inventory: { create: { quantity: 25 } },
            attributes: {
              create: [
                { attributeValueId: valPlata.id },
                { attributeValueId: valLong45.id },
              ],
            },
          },
        ],
      },
    },
  });

  // 2. Anillo Solitario Amatista (Pieza Insignia Diamante Morado - Multi Color y Tallas)
  const p2 = await prisma.product.create({
    data: {
      title: 'Anillo Solitario Amatista',
      slug: 'anillo-solitario-amatista',
      tag: 'Pieza Insignia',
      shortDescription: 'Plata de Ley 925 con gema central amatista suiza de corte esmeralda y circonias laterales.',
      description: 'Una joya emblemática de ROISIN inspirada en el brillo majestuoso del Diamante Morado. Forjado en Plata de Ley 925 con baño protector de rodio y engaste a cuatro uñas de una amatista suiza de máxima pureza.',
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
            sku: 'AN-AMA-PLT-T6',
            price: 42.00,
            compareAtPrice: 55.00,
            inventory: { create: { quantity: 15 } },
            attributes: {
              create: [
                { attributeValueId: valPlata.id },
                { attributeValueId: valTalla6.id },
              ],
            },
          },
          {
            sku: 'AN-AMA-PLT-T7',
            price: 42.00,
            compareAtPrice: 55.00,
            inventory: { create: { quantity: 20 } },
            attributes: {
              create: [
                { attributeValueId: valPlata.id },
                { attributeValueId: valTalla7.id },
              ],
            },
          },
          {
            sku: 'AN-AMA-PLT-T8',
            price: 42.00,
            compareAtPrice: 55.00,
            inventory: { create: { quantity: 12 } },
            attributes: {
              create: [
                { attributeValueId: valPlata.id },
                { attributeValueId: valTalla8.id },
              ],
            },
          },
          {
            sku: 'AN-AMA-ORO-T7',
            price: 46.00,
            compareAtPrice: 60.00,
            inventory: { create: { quantity: 10 } },
            attributes: {
              create: [
                { attributeValueId: valOro.id },
                { attributeValueId: valTalla7.id },
              ],
            },
          },
        ],
      },
    },
  });

  // 3. Pulsera Tennis Diamante (Con Descuento)
  const p3 = await prisma.product.create({
    data: {
      title: 'Pulsera Tennis Diamante',
      slug: 'pulsera-tennis-diamante',
      tag: 'Más Deseado',
      shortDescription: 'Circonias corte brillante engastadas en Plata 925 con cierre de seguridad doble broche.',
      description: 'El diseño clásico que nunca pasa de moda. Diseñada con circonias suizas de corte brillante seleccionadas individualmente para ofrecer un fulgor continuo y uniforme.',
      basePrice: 55.00,
      compareAtPrice: 70.00,
      discountPercent: 21,
      isActive: true,
      isFeatured: true,
      categoryId: catPulseras.id,
      collections: {
        create: [
          { collectionId: colDiamanteMorado.id, sortOrder: 0 },
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
      optionGroupLinks: {
        create: [{ groupId: optGroupPresentation.id }],
      },
      variants: {
        create: [
          {
            sku: 'PUL-TEN-PLT',
            price: 55.00,
            compareAtPrice: 70.00,
            inventory: { create: { quantity: 18 } },
            attributes: {
              create: [
                { attributeValueId: valPlata.id },
                { attributeValueId: valAjustable.id },
              ],
            },
          },
          {
            sku: 'PUL-TEN-ORO',
            price: 59.00,
            compareAtPrice: 75.00,
            inventory: { create: { quantity: 14 } },
            attributes: {
              create: [
                { attributeValueId: valOro.id },
                { attributeValueId: valAjustable.id },
              ],
            },
          },
        ],
      },
    },
  });

  // 4. Aretes Corazón Colgante (Con Descuento)
  const p4 = await prisma.product.create({
    data: {
      title: 'Aretes Corazón Colgante',
      slug: 'aretes-corazon-colgante',
      tag: 'Edición Romántica',
      shortDescription: 'Aretes en Plata 925 con pavé de circonias brillantes y movimiento delicado.',
      description: 'Silueta de corazón esculpida en plata esterlina con micro pavé de gemas que capturan la luz con sutileza. Cierre seguro a presión antialérgico.',
      basePrice: 28.00,
      compareAtPrice: 38.00,
      discountPercent: 26,
      isActive: true,
      isFeatured: true,
      categoryId: catAretes.id,
      collections: {
        create: [{ collectionId: colPromesa.id, sortOrder: 0 }],
      },
      images: {
        create: IMAGES.earrings1.map((img, idx) => ({
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
            sku: 'ARE-COR-PLT',
            price: 28.00,
            compareAtPrice: 38.00,
            inventory: { create: { quantity: 30 } },
            attributes: { create: [{ attributeValueId: valPlata.id }] },
          },
          {
            sku: 'ARE-COR-ORO',
            price: 32.00,
            compareAtPrice: 42.00,
            inventory: { create: { quantity: 22 } },
            attributes: { create: [{ attributeValueId: valOro.id }] },
          },
        ],
      },
    },
  });

  // 5. Anillo Corona de Amor (Con Descuento)
  const p5 = await prisma.product.create({
    data: {
      title: 'Anillo Corona de Amor',
      slug: 'anillo-corona-de-amor',
      tag: 'Promesa',
      shortDescription: 'Diseño tiara en Plata 925 con baño de oro rosa 18k y circonias en degradé.',
      description: 'Una corona para la reina de tu corazón. Detalles intrincados inspirados en la orfebrería de la realeza europea con acabado pulido espejo.',
      basePrice: 36.00,
      compareAtPrice: 48.00,
      discountPercent: 25,
      isActive: true,
      isFeatured: true,
      categoryId: catAnillos.id,
      collections: {
        create: [{ collectionId: colPromesa.id, sortOrder: 0 }],
      },
      images: {
        create: IMAGES.ring2.map((img, idx) => ({
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
            sku: 'AN-COR-T6',
            price: 36.00,
            compareAtPrice: 48.00,
            inventory: { create: { quantity: 15 } },
            attributes: {
              create: [
                { attributeValueId: valOroRosa.id },
                { attributeValueId: valTalla6.id },
              ],
            },
          },
          {
            sku: 'AN-COR-T7',
            price: 36.00,
            compareAtPrice: 48.00,
            inventory: { create: { quantity: 18 } },
            attributes: {
              create: [
                { attributeValueId: valOroRosa.id },
                { attributeValueId: valTalla7.id },
              ],
            },
          },
          {
            sku: 'AN-COR-T8',
            price: 36.00,
            compareAtPrice: 48.00,
            inventory: { create: { quantity: 10 } },
            attributes: {
              create: [
                { attributeValueId: valOroRosa.id },
                { attributeValueId: valTalla8.id },
              ],
            },
          },
        ],
      },
    },
  });

  // PRODUCTOS A PRECIO REGULAR (5)
  // 6. Collar Punto de Luz
  await prisma.product.create({
    data: {
      title: 'Collar Punto de Luz',
      slug: 'collar-punto-de-luz',
      shortDescription: 'Gargantilla solitaria con gema central de 6mm en Plata 925 y baño de rodio.',
      description: 'El toque de sofisticación perfecto para el día a día. Una circonia solitaria suspendida en una fina cadena veneciana que reposa con gracia en el escote.',
      basePrice: 29.00,
      isActive: true,
      isFeatured: false,
      categoryId: catCollares.id,
      images: {
        create: IMAGES.necklace2.map((img, idx) => ({
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
            sku: 'COL-PTL-PLT-45',
            price: 29.00,
            inventory: { create: { quantity: 35 } },
            attributes: {
              create: [
                { attributeValueId: valPlata.id },
                { attributeValueId: valLong45.id },
              ],
            },
          },
          {
            sku: 'COL-PTL-ORO-45',
            price: 33.00,
            inventory: { create: { quantity: 20 } },
            attributes: {
              create: [
                { attributeValueId: valOro.id },
                { attributeValueId: valLong45.id },
              ],
            },
          },
        ],
      },
    },
  });

  // 7. Pulsera Trébol de Amor
  await prisma.product.create({
    data: {
      title: 'Pulsera Trébol de Amor',
      slug: 'pulsera-trebol-de-amor',
      shortDescription: 'Eslabones con trébol de cuatro hojas en madreperla natural y baño de oro 18k.',
      description: 'Símbolo eterno de fortuna, esperanza y amor. Cada dije de trébol está tallado en nácar legítimo enmarcado con ribete perlado de oro.',
      basePrice: 45.00,
      isActive: true,
      isFeatured: false,
      categoryId: catPulseras.id,
      collections: {
        create: [{ collectionId: colReal.id, sortOrder: 0 }],
      },
      images: {
        create: IMAGES.bracelet2.map((img, idx) => ({
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
            sku: 'PUL-TRE-ORO',
            price: 45.00,
            inventory: { create: { quantity: 25 } },
            attributes: {
              create: [
                { attributeValueId: valOro.id },
                { attributeValueId: valAjustable.id },
              ],
            },
          },
        ],
      },
    },
  });

  // 8. Aretes Perla Suprema
  await prisma.product.create({
    data: {
      title: 'Aretes Perla Suprema',
      slug: 'aretes-perla-suprema',
      shortDescription: 'Perlas cultivadas de agua dulce con broche de plata 925 y circonia superior.',
      description: 'Pureza y elegancia atemporal. Perlas seleccionadas de lustre nacarado intenso con montura hipoalergénica de alta durabilidad.',
      basePrice: 32.00,
      isActive: true,
      isFeatured: false,
      categoryId: catAretes.id,
      images: {
        create: IMAGES.earrings2.map((img, idx) => ({
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
            sku: 'ARE-PER-PLT',
            price: 32.00,
            inventory: { create: { quantity: 28 } },
            attributes: { create: [{ attributeValueId: valPlata.id }] },
          },
        ],
      },
    },
  });

  // 9. Gargantilla Eslabón Real
  await prisma.product.create({
    data: {
      title: 'Gargantilla Eslabón Real',
      slug: 'gargantilla-eslabon-real',
      shortDescription: 'Cadena estilo eslabón cubano en Baño de Oro 18k de 45cm con broche marinero.',
      description: 'Una pieza de impacto audaz y lujoso. Eslabones pulidos a mano que brindan una caída perfecta sobre el cuello con brillo imponente.',
      basePrice: 52.00,
      isActive: true,
      isFeatured: false,
      categoryId: catCollares.id,
      collections: {
        create: [{ collectionId: colReal.id, sortOrder: 0 }],
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
            sku: 'GAR-ESL-ORO-45',
            price: 52.00,
            inventory: { create: { quantity: 16 } },
            attributes: {
              create: [
                { attributeValueId: valOro.id },
                { attributeValueId: valLong45.id },
              ],
            },
          },
        ],
      },
    },
  });

  // 10. Anillo Infinito Entrelazado
  await prisma.product.create({
    data: {
      title: 'Anillo Infinito Entrelazado',
      slug: 'anillo-infinito-entrelazado',
      shortDescription: 'Doble banda en Plata 925 entrelazada con hilera de circonias suizas micro engastadas.',
      description: 'Un recordatorio constante de que el amor no tiene principio ni fin. Dos aros independientes que se unen para formar un diseño orgánico sublime.',
      basePrice: 39.00,
      isActive: true,
      isFeatured: false,
      categoryId: catAnillos.id,
      collections: {
        create: [{ collectionId: colPromesa.id, sortOrder: 0 }],
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
            sku: 'AN-INF-T6',
            price: 39.00,
            inventory: { create: { quantity: 14 } },
            attributes: {
              create: [
                { attributeValueId: valPlata.id },
                { attributeValueId: valTalla6.id },
              ],
            },
          },
          {
            sku: 'AN-INF-T7',
            price: 39.00,
            inventory: { create: { quantity: 20 } },
            attributes: {
              create: [
                { attributeValueId: valPlata.id },
                { attributeValueId: valTalla7.id },
              ],
            },
          },
          {
            sku: 'AN-INF-T8',
            price: 39.00,
            inventory: { create: { quantity: 12 } },
            attributes: {
              create: [
                { attributeValueId: valPlata.id },
                { attributeValueId: valTalla8.id },
              ],
            },
          },
        ],
      },
    },
  });

  // 11. Crear un Pedido de Demostración
  console.log('📦 Creando pedido de demostración...');
  const v1 = await prisma.productVariant.findFirst({ where: { productId: p1.id } });
  const v2 = await prisma.productVariant.findFirst({ where: { productId: p2.id } });

  const orderExample = await prisma.order.create({
    data: {
      orderNumber: 'ROI-1001',
      userId: customer.id,
      customerEmail: 'cliente@roisinjoyas.com',
      customerName: 'Eduin Gómez',
      customerPhone: '0987654321',
      shippingAddress: 'Av. Samborondón Km 2.5, Edificio Platinum',
      city: 'Samborondón',
      province: 'Guayas',
      dedication: 'Para el amor de mi vida, con todo mi corazón.',
      subtotal: 80.00,
      shippingCost: 0.00,
      discount: 0.00,
      total: 80.00,
      status: 'PROCESSING',
      items: {
        create: [
          {
            variantId: v1!.id,
            quantity: 1,
            price: 38.00,
            dedication: 'Para el amor de mi vida, con todo mi corazón.',
          },
          {
            variantId: v2!.id,
            quantity: 1,
            price: 42.00,
            dedication: 'Para el amor de mi vida, con todo mi corazón.',
          },
        ],
      },
    },
  });

  // Crear Registro de Pago para el Pedido
  await prisma.payment.create({
    data: {
      orderId: orderExample.id,
      method: 'BANK_TRANSFER',
      status: 'COMPLETED',
      amount: 80.00,
      referenceNumber: 'TRA-2026-98124',
    },
  });

  console.log(`✅ Seed completado con éxito. Pedido #${orderExample.orderNumber} creado.`);
  console.log('💎 Catálogo 100% enriquecido con nombres concisos, descripciones, presentaciones y variantes multi-atributo.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
