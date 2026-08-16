import 'dotenv/config';
import { hashPassword, comparePassword, signToken, verifyToken } from '../src/lib/auth';
import { saveUploadedFile, readUploadedFile, getUploadsDirectory } from '../src/lib/storage';
import {
  loginSchema,
  registerSchema,
  checkoutSchema,
  productSchema,
  couponSchema,
} from '../src/lib/validations';
import { STORE_CONFIG } from '../src/lib/config/store';
import path from 'path';
import fs from 'fs';

async function runUnitAudit() {
  console.log('====================================================');
  console.log('  ROISIN FULL-STACK COMPREHENSIVE UNIT & LOGIC AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}${detail ? ` - ${detail}` : ''}`);
      throw new Error(`Audit failure: ${title}`);
    }
  }

  // --------------------------------------------------------------------------
  // 1. Password Hashing & Bcrypt Security
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Password Hashing & Bcrypt Security ---');
  const password = 'TestSecurePassword2026!';
  const hash = await hashPassword(password);
  assert(hash.startsWith('$2'), 'Bcrypt hash generated with standard $2 prefix');
  assert(await comparePassword(password, hash), 'Valid password verifies correctly');
  assert(!(await comparePassword('WrongPassword', hash)), 'Invalid password rejected');

  // --------------------------------------------------------------------------
  // 2. JWT Session Token Signing, Verification & Role Integrity
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing JWT Session Tokens & RBAC Roles ---');
  const adminPayload = { userId: 'admin-uuid-001', email: 'admin@roisinjoyas.com', role: 'ADMIN' as const };
  const token = signToken(adminPayload);
  const verified = verifyToken(token);
  assert(verified?.userId === adminPayload.userId, 'JWT token correctly decodes userId');
  assert(verified?.email === adminPayload.email, 'JWT token correctly decodes email');
  assert(verified?.role === 'ADMIN', 'JWT token strictly preserves ADMIN role');

  const customerPayload = { userId: 'cust-uuid-002', email: 'cliente@roisinjoyas.com', role: 'CUSTOMER' as const };
  const custToken = signToken(customerPayload);
  const custVerified = verifyToken(custToken);
  assert(custVerified?.role === 'CUSTOMER', 'Customer role verified');

  assert(verifyToken('tampered.jwt.signature') === null, 'Tampered token rejected with null');

  // --------------------------------------------------------------------------
  // 3. Zod Input Validations (Checkout, Auth, Product, Coupon)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Zod Validation Schemas ---');
  // Login schema
  const validLogin = loginSchema.safeParse({ email: 'usuario@correo.com', password: 'password123' });
  assert(validLogin.success, 'Valid login schema passes');
  const invalidLogin = loginSchema.safeParse({ email: 'not-an-email', password: '123' });
  assert(!invalidLogin.success, 'Invalid login schema fails as expected');

  // Register schema
  const validRegister = registerSchema.safeParse({
    firstName: 'Maria',
    lastName: 'Perez',
    email: 'maria@correo.com',
    password: 'password123',
    phone: '0991234567',
  });
  assert(validRegister.success, 'Valid register schema passes');

  // Checkout schema
  const validCheckout = checkoutSchema.safeParse({
    firstName: 'Sofia',
    lastName: 'Andrade',
    email: 'sofia@test.com',
    phone: '0991234567',
    address: 'Av. 6 de Diciembre y Eloy Alfaro',
    city: 'Quito',
    province: 'Pichincha',
    regionId: '123e4567-e89b-12d3-a456-426614174000',
    couponCode: 'BIENVENIDA10',
  });
  assert(validCheckout.success, 'Valid checkout schema passes');

  const invalidCheckout = checkoutSchema.safeParse({
    firstName: '',
    email: 'invalid-email',
    regionId: 'not-a-uuid',
  });
  assert(!invalidCheckout.success, 'Invalid checkout schema caught by Zod');

  // Product schema
  const validProduct = productSchema.safeParse({
    title: 'Anillo Solitario',
    slug: 'anillo-solitario-plata-925',
    description: 'Hermoso anillo en plata 925 con circonia suiza de corte brillante.',
    basePrice: 45.0,
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1' }],
    variants: [{ sku: 'AN-SOL-01', price: 45.0, initialStock: 10 }],
  });
  assert(validProduct.success, 'Valid product schema passes');

  // Coupon schema
  const validCoupon = couponSchema.safeParse({
    code: 'DESCUENTO15',
    discountPercentage: 15,
  });
  assert(validCoupon.success, 'Valid coupon schema passes');

  // --------------------------------------------------------------------------
  // 4. File Upload Security, Magic Bytes & Path Traversal Defense
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing File Upload Security & Magic Bytes ---');
  // Valid JPEG
  const jpegBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const validJpeg = new File([jpegBytes], 'voucher.jpg', { type: 'image/jpeg' });
  const savedJpeg = await saveUploadedFile(validJpeg);
  assert(savedJpeg.url.startsWith('/api/uploads/'), 'Uploaded JPEG receives /api/uploads/ URL');
  assert(savedJpeg.filename.endsWith('.jpg'), 'Safe extension enforced as .jpg');

  // Valid PNG
  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const validPng = new File([pngBytes], 'voucher.png', { type: 'image/png' });
  const savedPng = await saveUploadedFile(validPng);
  assert(savedPng.filename.endsWith('.png'), 'Safe extension enforced as .png');

  // Fake Image (Spoofed MIME type with PHP/executable content)
  const fakeBytes = Buffer.from('<?php echo "evil"; ?>');
  const fakeFile = new File([fakeBytes], 'exploit.php', { type: 'image/jpeg' });
  let spoofCaught = false;
  try {
    await saveUploadedFile(fakeFile);
  } catch {
    spoofCaught = true;
  }
  assert(spoofCaught, 'Spoofed file with invalid magic bytes rejected');

  // Path Traversal Attack Defense
  const traversalAttempt = await readUploadedFile('../../../windows/win.ini');
  assert(traversalAttempt === null, 'Path traversal attempt ../ blocked');

  // Read back valid file
  const readBack = await readUploadedFile(savedJpeg.filename);
  assert(readBack !== null && readBack.contentType === 'image/jpeg', 'Uploaded file read back safely');

  // --------------------------------------------------------------------------
  // 5. Store Configuration & Business Constants
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Store Configuration & Customizability ---');
  assert(typeof STORE_CONFIG.name === 'string' && STORE_CONFIG.name.length > 0, 'Store name is configured');
  assert(Array.isArray(STORE_CONFIG.bankAccounts) && STORE_CONFIG.bankAccounts.length >= 2, 'Bank accounts configured for Ecuador');
  assert(typeof STORE_CONFIG.whatsappNumber === 'string', 'WhatsApp number configured');

  // --------------------------------------------------------------------------
  // 6. Standalone Build & Static Assets Verification
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Standalone Build & Static Assets ---');
  const standalonePath = path.join(process.cwd(), '.next', 'standalone');
  assert(fs.existsSync(standalonePath), '.next/standalone exists from next build');
  assert(fs.existsSync(path.join(standalonePath, 'server.js')), 'server.js exists in standalone directory');
  assert(fs.existsSync(path.join(standalonePath, '.next', 'static')), '.next/static copied to standalone for Hostinger');

  console.log('\n====================================================');
  console.log(`  ALL AUDIT CHECKS PASSED: ${passed}/${total} (100% SUCCESS)`);
  console.log('====================================================\n');
}

runUnitAudit().catch((e) => {
  console.error(e);
  process.exit(1);
});
