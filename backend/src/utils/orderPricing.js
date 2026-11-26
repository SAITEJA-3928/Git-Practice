const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_FEE = 40;

const VALID_TRANSITIONS = {
  PLACED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: []
};

/**
 * Compute Flipkart-style cart pricing totals.
 * @param {Array<{price: number, mrp?: number, quantity: number}>} items
 */
function calculateOrderTotals(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  let subtotal = 0;
  let mrpTotal = 0;

  for (const item of items) {
    const qty = Number(item.quantity);
    const price = Number(item.price);
    const mrp = Number(item.mrp ?? item.price);
    if (!Number.isInteger(qty) || qty < 1) {
      throw new Error('Item quantity must be a positive integer');
    }
    if (price < 0 || mrp < price) {
      throw new Error('Invalid product pricing');
    }
    subtotal += price * qty;
    mrpTotal += mrp * qty;
  }

  const savings = Math.max(0, mrpTotal - subtotal);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const totalAmount = subtotal + deliveryFee;

  return {
    subtotal,
    mrpTotal,
    savings,
    deliveryFee,
    totalAmount
  };
}

/**
 * Check whether transitioning an order from currentStatus to nextStatus is allowed.
 * @param {string} currentStatus
 * @param {string} nextStatus
 */
function canTransitionOrder(currentStatus, nextStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

/**
 * Generate a readable Flipkart-style order number like FK20261125-48219.
 */
function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `FK${datePart}-${randomPart}`;
}

module.exports = {
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
  VALID_TRANSITIONS,
  calculateOrderTotals,
  canTransitionOrder,
  generateOrderNumber
};
