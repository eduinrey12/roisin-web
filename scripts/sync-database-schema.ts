import 'dotenv/config';
import mariadb from 'mariadb';

async function syncSchema() {
  const dbUrl = process.env.DATABASE_URL || 'mysql://root:qwer@127.0.0.1:3306/roisin_db';
  const parsed = new URL(dbUrl);
  
  const pool = mariadb.createPool({
    host: parsed.hostname || '127.0.0.1',
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: decodeURIComponent(parsed.username || 'root'),
    password: decodeURIComponent(parsed.password || ''),
    database: parsed.pathname.replace(/^\//, '') || 'roisin_db',
    connectionLimit: 3,
    allowPublicKeyRetrieval: true,
  });

  const conn = await pool.getConnection();

  console.log('🚀 Sincronizando tablas y columnas en MySQL...');

  try {
    // 1. New Table: Collection
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`Collection\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`slug\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`description\` TEXT NULL,
        \`imageUrl\` VARCHAR(191) NULL,
        \`bannerUrl\` VARCHAR(191) NULL,
        \`isActive\` TINYINT(1) NOT NULL DEFAULT 1,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`Collection_slug_key\` (\`slug\`),
        INDEX \`Collection_isActive_idx\` (\`isActive\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. New Table: CollectionProduct
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`CollectionProduct\` (
        \`collectionId\` VARCHAR(191) NOT NULL,
        \`productId\` VARCHAR(191) NOT NULL,
        \`sortOrder\` INT NOT NULL DEFAULT 0,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`collectionId\`, \`productId\`),
        INDEX \`CollectionProduct_collectionId_idx\` (\`collectionId\`),
        INDEX \`CollectionProduct_productId_idx\` (\`productId\`),
        CONSTRAINT \`CollectionProduct_collectionId_fkey\` FOREIGN KEY (\`collectionId\`) REFERENCES \`Collection\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`CollectionProduct_productId_fkey\` FOREIGN KEY (\`productId\`) REFERENCES \`Product\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. New Table: Promotion
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`Promotion\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`title\` VARCHAR(191) NOT NULL,
        \`subtitle\` VARCHAR(191) NULL,
        \`badge\` VARCHAR(191) NULL,
        \`discountText\` VARCHAR(191) NULL,
        \`imageUrl\` VARCHAR(191) NOT NULL,
        \`targetUrl\` VARCHAR(191) NOT NULL,
        \`sortOrder\` INT NOT NULL DEFAULT 0,
        \`isActive\` TINYINT(1) NOT NULL DEFAULT 1,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`Promotion_isActive_idx\` (\`isActive\`),
        INDEX \`Promotion_sortOrder_idx\` (\`sortOrder\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Update Product columns
    const productCols: any[] = await conn.query('SHOW COLUMNS FROM `Product`');
    const colNames = productCols.map((c) => c.Field);

    if (!colNames.includes('tag')) {
      await conn.query('ALTER TABLE `Product` ADD COLUMN `tag` VARCHAR(191) NULL;');
      console.log('✅ Agregada columna Product.tag');
    }
    if (!colNames.includes('shortDescription')) {
      await conn.query('ALTER TABLE `Product` ADD COLUMN `shortDescription` TEXT NULL;');
      console.log('✅ Agregada columna Product.shortDescription');
    }
    if (!colNames.includes('discountPercent')) {
      await conn.query('ALTER TABLE `Product` ADD COLUMN `discountPercent` INT NULL;');
      console.log('✅ Agregada columna Product.discountPercent');
    }
    if (!colNames.includes('compareAtPrice')) {
      await conn.query('ALTER TABLE `Product` ADD COLUMN `compareAtPrice` DECIMAL(10, 2) NULL;');
      console.log('✅ Agregada columna Product.compareAtPrice');
    }

    // 5. Update ProductImage columns
    const imgCols: any[] = await conn.query('SHOW COLUMNS FROM `ProductImage`');
    const imgColNames = imgCols.map((c) => c.Field);
    if (!imgColNames.includes('label')) {
      await conn.query('ALTER TABLE `ProductImage` ADD COLUMN `label` VARCHAR(191) NULL;');
      console.log('✅ Agregada columna ProductImage.label');
    }

    // 6. Update Dedication columns
    const cartItemCols: any[] = await conn.query('SHOW COLUMNS FROM `CartItem`');
    if (!cartItemCols.map((c) => c.Field).includes('dedication')) {
      await conn.query('ALTER TABLE `CartItem` ADD COLUMN `dedication` TEXT NULL;');
      console.log('✅ Agregada columna CartItem.dedication');
    }

    const orderCols: any[] = await conn.query('SHOW COLUMNS FROM `Order`');
    if (!orderCols.map((c) => c.Field).includes('dedication')) {
      await conn.query('ALTER TABLE `Order` ADD COLUMN `dedication` TEXT NULL;');
      console.log('✅ Agregada columna Order.dedication');
    }

    const orderItemCols: any[] = await conn.query('SHOW COLUMNS FROM `OrderItem`');
    if (!orderItemCols.map((c) => c.Field).includes('dedication')) {
      await conn.query('ALTER TABLE `OrderItem` ADD COLUMN `dedication` TEXT NULL;');
      console.log('✅ Agregada columna OrderItem.dedication');
    }

    // 7. Update Payment columns
    const paymentCols: any[] = await conn.query('SHOW COLUMNS FROM `Payment`');
    const paymentColNames = paymentCols.map((c) => c.Field);
    if (!paymentColNames.includes('cardLastFour')) {
      await conn.query('ALTER TABLE `Payment` ADD COLUMN `cardLastFour` VARCHAR(191) NULL;');
      console.log('✅ Agregada columna Payment.cardLastFour');
    }
    if (!paymentColNames.includes('cardBrand')) {
      await conn.query('ALTER TABLE `Payment` ADD COLUMN `cardBrand` VARCHAR(191) NULL;');
      console.log('✅ Agregada columna Payment.cardBrand');
    }
    if (!paymentColNames.includes('installments')) {
      await conn.query('ALTER TABLE `Payment` ADD COLUMN `installments` INT NULL;');
      console.log('✅ Agregada columna Payment.installments');
    }

    // 8. Update Payment method enum to include BANK_DEPOSIT and CREDIT_CARD
    await conn.query(`
      ALTER TABLE \`Payment\` 
      MODIFY COLUMN \`method\` ENUM('BANK_TRANSFER', 'BANK_DEPOSIT', 'CREDIT_CARD', 'CASH_ON_DELIVERY') NOT NULL;
    `);

    // 9. ShippingRegion update and seed default shipping zones
    const shippingCols: any[] = await conn.query('SHOW COLUMNS FROM `ShippingRegion`');
    if (!shippingCols.map((c) => c.Field).includes('description')) {
      await conn.query('ALTER TABLE `ShippingRegion` ADD COLUMN `description` VARCHAR(191) NULL;');
    }

    // Ensure default shipping regions: Guayaquil: $3, Otros Destinos: $6, Galápagos: $12
    await conn.query(`
      INSERT INTO \`ShippingRegion\` (\`id\`, \`name\`, \`baseRate\`, \`description\`, \`isActive\`, \`createdAt\`, \`updatedAt\`)
      VALUES 
        (UUID(), 'Guayaquil', 3.00, 'Entrega express local en Guayaquil, Samborondón y Daule', 1, NOW(3), NOW(3)),
        (UUID(), 'Otros Destinos (Nacional)', 6.00, 'Envíos a todo el Ecuador continental vía Servientrega / Courier', 1, NOW(3), NOW(3)),
        (UUID(), 'Galápagos', 12.00, 'Envíos asegurados a la región insular de Galápagos', 1, NOW(3), NOW(3))
      ON DUPLICATE KEY UPDATE \`baseRate\` = VALUES(\`baseRate\`);
    `);

    // Clean up outdated shipping region names if needed
    await conn.query(`
      UPDATE \`ShippingRegion\` SET \`isActive\` = 0 WHERE \`name\` NOT IN ('Guayaquil', 'Otros Destinos (Nacional)', 'Galápagos');
    `);

    // 10. Seed Initial Promotions if empty
    const promoCount: any[] = await conn.query('SELECT COUNT(*) as cnt FROM `Promotion`');
    if (Number(promoCount[0].cnt) === 0) {
      await conn.query(`
        INSERT INTO \`Promotion\` (\`id\`, \`title\`,\`subtitle\`, \`badge\`, \`discountText\`, \`imageUrl\`, \`targetUrl\`, \`sortOrder\`, \`isActive\`, \`createdAt\`, \`updatedAt\`)
        VALUES 
          (UUID(), 'Anillos de Promesa', 'Plata de Ley 925 & Circonias Suizas', 'OFERTA ESPECIAL', '20% OFF', 'https://images.unsplash.com/photo-1605100804763-247f6612d4a5?q=80&w=800&auto=format&fit=crop', '/productos?category=anillos', 1, 1, NOW(3), NOW(3)),
          (UUID(), 'Pulseras Tennis Lujo', 'Brillo infinito y acabado en Oro 18k', 'MÁS VENDIDO', '15% OFF', 'https://images.unsplash.com/photo-1611591475152-47754b2a8d56?q=80&w=800&auto=format&fit=crop', '/productos?category=pulseras', 2, 1, NOW(3), NOW(3)),
          (UUID(), 'Collares con Dije Corazón', 'El regalo perfecto para esa persona especial', 'NUEVO LANZAMIENTO', 'ENVÍO GRATIS', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', '/productos?category=collares', 3, 1, NOW(3), NOW(3)),
          (UUID(), 'Aretes Huggies Diamante', 'Elegancia y comodidad para todos los días', 'TENDENCIA 2026', 'HASTA 25% OFF', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop', '/productos?category=aretes', 4, 1, NOW(3), NOW(3))
      `);
      console.log('✅ Promociones iniciales sembradas');
    }

    // 11. Seed Initial Collections if empty
    const collectionCount: any[] = await conn.query('SELECT COUNT(*) as cnt FROM `Collection`');
    if (Number(collectionCount[0].cnt) === 0) {
      await conn.query(`
        INSERT INTO \`Collection\` (\`id\`, \`slug\`, \`name\`, \`description\`, \`imageUrl\`, \`isActive\`, \`createdAt\`, \`updatedAt\`)
        VALUES 
          (UUID(), 'diamante-morado', 'Colección Diamante Morado 2026', 'Piezas insignia con la máxima pureza, elegancia y exclusividad ROISIN.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', 1, NOW(3), NOW(3)),
          (UUID(), 'promesa-eterna', 'Colección Promesa Eterna', 'Anillos solitarios y alianzas creadas para sellar momentos inolvidables.', 'https://images.unsplash.com/photo-1605100804763-247f6612d4a5?q=80&w=800&auto=format&fit=crop', 1, NOW(3), NOW(3)),
          (UUID(), 'san-valentin', 'Especial Regalos de Amor', 'La combinación perfecta de joyas con empaque de lujo para regalar.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', 1, NOW(3), NOW(3))
      `);
      console.log('✅ Colecciones iniciales sembradas');
    }

    console.log('🎉 Sincronización de base de datos finalizada con éxito!');
  } catch (err: any) {
    console.error('❌ Error durante la sincronización de base de datos:', err);
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

syncSchema();
