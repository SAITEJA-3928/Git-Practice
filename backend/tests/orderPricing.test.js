const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateOrderTotals,
  canTransitionOrder,
  generateOrderNumber
} = require('../src/utils/orderPricing');

test('calculateOrderTotals applies delivery fee below 499 and free delivery at/above 499', () => {
  const lowOrder = calculateOrderTotals([{ price: 299, mrp: 499, quantity: 1 }]);
  assert.deepEqual(lowOrder, {
    subtotal: 299,
    mrpTotal: 499,
    savings: 200,
    deliveryFee: 40,
    totalAmount: 339
  });

  const freeOrder = calculateOrderTotals([
    { price: 250, mrp: 350, quantity: 2 }
  ]);
  assert.deepEqual(freeOrder, {
    subtotal: 500,
    mrpTotal: 700,
    savings: 200,
    deliveryFee: 0,
    totalAmount: 500
  });
});

test('calculateOrderTotals rejects empty or invalid items', () => {
  assert.throws(() => calculateOrderTotals([]), /at least one item/);
  assert.throws(() => calculateOrderTotals([{ price: 100, mrp: 100, quantity: 0 }]), /positive integer/);
});

test('canTransitionOrder enforces valid Flipkart order lifecycle transitions', () => {
  assert.equal(canTransitionOrder('PLACED', 'PACKED'), true);
  assert.equal(canTransitionOrder('PLACED', 'CANCELLED'), true);
  assert.equal(canTransitionOrder('SHIPPED', 'CANCELLED'), false);
  assert.equal(canTransitionOrder('DELIVERED', 'PACKED'), false);
});

test('generateOrderNumber returns FK-prefixed tracking number', () => {
  const num = generateOrderNumber();
  assert.match(num, /^FK\d{8}-\d{5}$/);
});
