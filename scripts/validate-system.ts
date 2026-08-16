import 'dotenv/config';
import prisma from '../src/lib/db';
import { hashPassword, comparePassword, signToken, verifyToken } from '../src/lib/auth';
import { saveUploadedFile, readUploadedFile } from '../src/lib/storage';
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
  getProductBySlug,
} from '../src/services/catalog.service';
import {
  getOrCreateCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  mergeCarts,
  getCart,
} from '../src/services/cart.service';
import {
  validateCoupon,
  adminCreateCoupon,
  adminToggleCoupon,
} from '../src/services/coupon.service';
import { getActiveShippingRegions } from '../src/services/shipping.service';
import {
  createOrderFromCart,
  getOrderById,
  adminUpdateOrderStatus,
} from '../src/services/order.service';
import {
  createOrUpdatePayment,
  submitPaymentEvidence,
  adminVerifyPayment,
} from '../src/services/payment.service';
import { adjustStock } from '../src/services/inventory.service';
import { v4 as uuidv4 } from 'uuid';

async function runTestSuite() {
  console.log('====================================================');
  console.log('  ROISIN FULL-STACK COMPREHENSIVE AUDIT & VALIDATION');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      throw new Error(`Validation failed at: ${testName}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Database Connection & Prisma MariaDb Pool Configuration
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Testing Database & MariaDb Connection Pool ---');
  try {
    const dbCheck = await prisma.$queryRaw`SELECT 1 as connected`;
    assert(Array.isArray(dbCheck) && dbCheck.length > 0, 'Database query execution via MariaDb adapter');
  } catch (err: any) {
    console.error('Database connection error:', err.message);
    throw err;
  }

  // --------------------------------------------------------------------------
  // TEST 2: Authentication, Bcrypt Hashing, JWT & Roles
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Authentication, Bcrypt & JWT Sessions ---');
  const testPassword = 'SecurePassword2026!#';
  const hashed = await hashPassword(testPassword);
  assert(await comparePassword(testPassword, hashed), 'Bcrypt password hashing and comparison');
  assert(!(await comparePassword('WrongPassword', hashed)), 'Bcrypt rejection of wrong password');

  const testPayload = { userId: 'user-test-123', email: 'test@roisinjoyas.com', role: 'ADMIN' as const };
  const token = signToken(testPayload);
  const decoded = verifyToken(token);
  assert(decoded?.userId === testPayload.userId, 'JWT token signing and decoding');
  assert(decoded?.role === 'ADMIN', 'JWT role preservation');

  const invalidDecoded = verifyToken('invalid.token.signature');
  assert(invalidDecoded === null, 'JWT rejection of tampered tokens');

  // --------------------------------------------------------------------------
  // TEST 3: Catalog, Categories, Products & Variants
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Catalog, Categories, Products & Variants ---');
  const categories = await getCategories();
  assert(categories.length > 0, 'Category retrieval', `Found ${categories.length} categories`);

  const { products, total } = await getProducts();
  assert(products.length > 0, 'Catalog product listing', `Found ${products.length} products (total: ${total})`);

  const firstProduct = products[0];
  const productDetail = await getProductBySlug(firstProduct.slug);
  assert(productDetail !== null, 'Product detail lookup by slug');
  assert(productDetail!.variants.length > 0, 'Product variants inclusion');

  // --------------------------------------------------------------------------
  // TEST 4: Guest Cart, Item Options & User Cart Merging
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Guest Cart, Packaging Options & Cart Merging ---');
  const guestToken = `test-guest-${uuidv4()}`;
  const testVariant = firstProduct.variants[0];

  // Get option id if available
  const optionId = productDetail?.optionGroupLinks?.[0]?.group.options[0]?.id;
  const optionIds = optionId ? [optionId] : [];

  const cartAfterAdd = await addItemToCart(guestToken, undefined, testVariant.id, 2, optionIds);
  assert(cartAfterAdd !== null, 'Guest cart creation and adding item');
  assert(cartAfterAdd!.items.length > 0, 'Cart items present');
  assert(cartAfterAdd!.items[0].quantity === 2, 'Cart item quantity is 2');

  const cartItemId = cartAfterAdd!.items[0].id;
  await updateItemQuantity(cartItemId, 3);
  const cartAfterUpdate = await getCart(guestToken);
  assert(cartAfterUpdate!.items[0].quantity === 3, 'Cart item quantity update to 3');

  // Test Cart Merge into Registered User
  const testUser = await prisma.user.create({
    data: {
      email: `test-buyer-${uuidv4()}@roisinjoyas.com`,
      passwordHash: await hashPassword('Test1234!'),
      role: 'CUSTOMER',
    },
  });
  const testUserId = testUser.id;
  const mergedCart = await mergeCarts(guestToken, testUserId);
  assert(mergedCart !== null, 'Cart merge into user account');
  assert(mergedCart!.items.some((i) => i.variantId === testVariant.id), 'Merged item in user cart');

  // --------------------------------------------------------------------------
  // TEST 5: Coupons & Shipping Regions Validation
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Coupons, Validation & Shipping Rates ---');
  const regions = await getActiveShippingRegions();
  assert(regions.length > 0, 'Active shipping regions retrieval in Ecuador');

  const validCoupon = await validateCoupon('BIENVENIDA10');
  assert(validCoupon.discountPercentage === 10, 'Coupon BIENVENIDA10 validation (10% discount)');

  let couponErrorThrown = false;
  try {
    await validateCoupon('INEXISTENTE999');
  } catch {
    couponErrorThrown = true;
  }
  assert(couponErrorThrown, 'Rejection of non-existent coupon');

  // --------------------------------------------------------------------------
  // TEST 6: Checkout, Order Creation, Stock Deductions & ACID Transactions
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Checkout, Atomic Inventory Deduction & Order Placement ---');
  // Get initial stock for variant
  const initialInv = await prisma.inventoryItem.findUnique({
    where: { variantId: testVariant.id },
  });
  const initialStock = initialInv?.quantity ?? 10;

  const checkoutResult = await createOrderFromCart(undefined, testUserId, {
    firstName: 'Test',
    lastName: 'Auditor',
    email: 'auditor@test.com',
    phone: '0991112233',
    address: 'Av. Amazonas y Naciones Unidas',
    city: 'Quito',
    province: 'Pichincha',
    regionId: regions[0].id,
    couponCode: 'BIENVENIDA10',
  });

  assert(checkoutResult.id !== undefined, 'Order placed successfully in database');
  assert(checkoutResult.orderNumber.startsWith('ROI-'), 'Order number format ROI-XXXXXX');
  assert(Number(checkoutResult.discount) > 0, 'Coupon discount applied accurately');

  // Check inventory deduction
  const afterOrderInv = await prisma.inventoryItem.findUnique({
    where: { variantId: testVariant.id },
  });
  assert(
    afterOrderInv!.quantity === initialStock - 3,
    'Atomic inventory deduction on order creation',
    `Expected ${initialStock - 3}, got ${afterOrderInv!.quantity}`
  );

  // Check cart clearance
  const userCartAfterCheckout = await getCart(undefined, testUserId);
  assert(
    !userCartAfterCheckout || userCartAfterCheckout.items.length === 0,
    'Cart emptied after successful checkout'
  );

  // --------------------------------------------------------------------------
  // TEST 7: Order Cancellation & Inventory Stock Reversal
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Stock Restoration on Order Cancellation ---');
  await adminUpdateOrderStatus(checkoutResult.id, 'CANCELLED');

  const restoredInv = await prisma.inventoryItem.findUnique({
    where: { variantId: testVariant.id },
  });
  assert(
    restoredInv!.quantity === initialStock,
    'Stock restored to original quantity upon order cancellation',
    `Expected ${initialStock}, got ${restoredInv!.quantity}`
  );

  // Re-activate order and check stock re-deduction
  await adminUpdateOrderStatus(checkoutResult.id, 'PROCESSING');
  const reDeductedInv = await prisma.inventoryItem.findUnique({
    where: { variantId: testVariant.id },
  });
  assert(
    reDeductedInv!.quantity === initialStock - 3,
    'Stock re-deducted when order is re-activated'
  );

  // --------------------------------------------------------------------------
  // TEST 8: Payments, Voucher Uploads & Magic Byte Validation
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Testing Payment Flow, File Uploads & Security ---');
  const payment = await createOrUpdatePayment(checkoutResult.id, 'BANK_TRANSFER');
  assert(payment.status === 'PENDING', 'Payment record created with status PENDING');

  // Test real file upload with valid JPEG magic bytes
  const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const mockFile = new File([validJpegBuffer], 'voucher.jpg', { type: 'image/jpeg' });

  const uploadResult = await saveUploadedFile(mockFile);
  assert(uploadResult.url.startsWith('/api/uploads/'), 'Uploaded file stored with public API URL');
  assert(uploadResult.filename.endsWith('.jpg'), 'Safe extension forced from MIME type');

  // Test reading uploaded file
  const readFileResult = await readUploadedFile(uploadResult.filename);
  assert(readFileResult !== null, 'Uploaded file readable from storage');
  assert(readFileResult!.contentType === 'image/jpeg', 'Correct Content-Type returned');

  // Test Path Traversal Protection
  const traversalResult = await readUploadedFile('../../etc/passwd');
  assert(traversalResult === null, 'Path traversal attempt blocked successfully');

  // Submit payment evidence
  const updatedPayment = await submitPaymentEvidence(
    checkoutResult.id,
    uploadResult.url,
    'REF-TEST-9988'
  );
  assert(updatedPayment.status === 'VERIFYING', 'Payment updated to VERIFYING status');

  // Admin verifies payment
  await adminVerifyPayment(updatedPayment.id, true);
  const finalOrder = await getOrderById(checkoutResult.id);
  assert(finalOrder?.payment?.status === 'COMPLETED', 'Payment verified and completed by admin');

  // --------------------------------------------------------------------------
  // Cleanup test order & artifacts
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Cleaning up test data ---');
  await prisma.orderItem.deleteMany({ where: { orderId: checkoutResult.id } });
  await prisma.payment.deleteMany({ where: { orderId: checkoutResult.id } });
  await prisma.order.delete({ where: { id: checkoutResult.id } });
  await prisma.inventoryMovement.deleteMany({ where: { referenceId: checkoutResult.id } });
  await prisma.cartItem.deleteMany({ where: { cart: { userId: testUserId } } });
  await prisma.cart.deleteMany({ where: { userId: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } });

  // Reset inventory back
  await adjustStock(testVariant.id, 3, 'MANUAL_ADJUSTMENT');
  console.log('  Cleaned test records.');

  console.log('\n====================================================');
  console.log(`  ALL AUDIT TESTS PASSED: ${passedTests}/${totalTests} (100% SUCCESS)`);
  console.log('====================================================\n');
}

runTestSuite()
  .catch((err) => {
    console.error('\n❌ AUDIT FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
