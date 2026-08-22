import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  console.log('🧹 Eliminando todos los productos y datos relacionados...');

  // Eliminar en orden para respetar claves foráneas
  await prisma.cartItemOption.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.promotionProduct.deleteMany({});
  await prisma.collectionProduct.deleteMany({});
  await prisma.productOptionGroupAssignment.deleteMany({});
  await prisma.variantAttributeValue.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});

  console.log('✅ Todos los productos, variantes, fotos e inventario han sido eliminados con éxito.');
  console.log('✨ Las tablas de Categorías, Colecciones, Materiales, Tallas, Colores y Usuarios se conservan intactas.');
}

main()
  .catch((e) => {
    console.error('❌ Error al limpiar productos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
