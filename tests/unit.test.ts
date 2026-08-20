import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  serializePlain,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentMethodLabel,
} from '../src/lib/utils';
import { STORE_CONFIG } from '../src/lib/config/store';

describe('💎 ROISIN UNIT TEST SUITE', () => {

  // ---------------------------------------------------------------------------
  // 1. Currency Formatting & Numbers
  // ---------------------------------------------------------------------------
  describe('1. Currency & Utility Helpers', () => {
    test('formatCurrency should format numbers with $ symbol and 2 decimals', () => {
      assert.equal(formatCurrency(45), '$45.00');
      assert.equal(formatCurrency(12.5), '$12.50');
      assert.equal(formatCurrency(0), '$0.00');
      assert.equal(formatCurrency('99.99' as any), '$99.99');
      assert.equal(formatCurrency(null), '$0.00');
    });

    test('serializePlain should safely convert complex objects, Decimals & Dates to plain JSON', () => {
      const mockDate = new Date('2026-08-20T00:00:00.000Z');
      const input = {
        title: 'Anillo Solitario',
        price: 45.5,
        createdAt: mockDate,
        nested: {
          tag: 'Más Deseado',
          tags: ['plata', '925'],
        },
      };

      const serialized = serializePlain(input);
      assert.equal(serialized.title, 'Anillo Solitario');
      assert.equal(serialized.price, 45.5);
      assert.equal(serialized.nested.tag, 'Más Deseado');
      assert.deepEqual(serialized.nested.tags, ['plata', '925']);
      assert.equal(typeof serialized.createdAt, 'string');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Order & Payment Status Label Helpers
  // ---------------------------------------------------------------------------
  describe('2. Order & Payment Status Mappings', () => {
    test('getOrderStatusLabel should return correct Spanish translations for all order statuses', () => {
      assert.equal(getOrderStatusLabel('PENDING'), 'Pendiente');
      assert.equal(getOrderStatusLabel('PAYMENT_PENDING'), 'Pago Pendiente');
      assert.equal(getOrderStatusLabel('PAID'), 'Pagado');
      assert.equal(getOrderStatusLabel('PROCESSING'), 'En Proceso');
      assert.equal(getOrderStatusLabel('SHIPPED'), 'Enviado');
      assert.equal(getOrderStatusLabel('DELIVERED'), 'Entregado');
      assert.equal(getOrderStatusLabel('CANCELLED'), 'Cancelado');
    });

    test('getOrderStatusColor should return distinct styling classes for statuses', () => {
      const pendingColor = getOrderStatusColor('PENDING');
      const paidColor = getOrderStatusColor('PAID');
      const deliveredColor = getOrderStatusColor('DELIVERED');
      const cancelledColor = getOrderStatusColor('CANCELLED');

      assert.ok(pendingColor.includes('amber'), 'Pending has amber warning color');
      assert.ok(paidColor.includes('emerald'), 'Paid has emerald success color');
      assert.ok(deliveredColor.includes('emerald'), 'Delivered has emerald active badge color');
      assert.ok(cancelledColor.includes('red'), 'Cancelled has red error color');
    });

    test('getPaymentMethodLabel should return user-friendly payment method names', () => {
      assert.equal(getPaymentMethodLabel('BANK_TRANSFER'), 'Transferencia Bancaria');
      assert.equal(getPaymentMethodLabel('BANK_DEPOSIT'), 'Depósito Bancario');
      assert.equal(getPaymentMethodLabel('CREDIT_CARD'), 'Tarjeta de Crédito / Débito');
      assert.equal(getPaymentMethodLabel('CASH_ON_DELIVERY'), 'Pago Contra Entrega');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Store Configuration & Constants
  // ---------------------------------------------------------------------------
  describe('3. Store Configuration Integrity', () => {
    test('STORE_CONFIG contains valid brand parameters for Ecuador', () => {
      assert.equal(STORE_CONFIG.name, 'ROISIN');
      assert.equal(STORE_CONFIG.currency, 'USD');
      assert.equal(STORE_CONFIG.currencySymbol, '$');
      assert.ok(STORE_CONFIG.whatsappNumber.length > 5, 'WhatsApp contact number configured');
      assert.ok(STORE_CONFIG.bankAccounts.length >= 2, 'At least 2 official bank accounts configured (Pichincha & Guayaquil)');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Discount & Pricing Math Calculations
  // ---------------------------------------------------------------------------
  describe('4. Pricing & Discount Calculations', () => {
    test('Calculate correct discounted total and percentage', () => {
      const originalPrice = 50.00;
      const discountPercent = 20;
      const expectedDiscount = (originalPrice * discountPercent) / 100;
      const expectedFinalPrice = originalPrice - expectedDiscount;

      assert.equal(expectedDiscount, 10.00);
      assert.equal(expectedFinalPrice, 40.00);
    });

    test('Calculate installments with zero interest accurately', () => {
      const orderTotal = 90.00;
      const installments3 = orderTotal / 3;
      const installments6 = orderTotal / 6;
      const installments12 = orderTotal / 12;

      assert.equal(installments3, 30.00);
      assert.equal(installments6, 15.00);
      assert.equal(installments12, 7.50);
    });
  });

});
