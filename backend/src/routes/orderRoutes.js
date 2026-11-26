const express = require('express');
const Product = require('../models/Product');
const { Order, ORDER_STATUSES } = require('../models/Order');
const { protect } = require('../middleware/auth');
const {
  calculateOrderTotals,
  canTransitionOrder,
  generateOrderNumber
} = require('../utils/orderPricing');

const router = express.Router();

function isValidShippingAddress(addr) {
  return (
    addr &&
    addr.fullName &&
    addr.phone &&
    addr.pincode &&
    addr.street &&
    addr.city &&
    addr.state
  );
}

router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'UPI' } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    if (!isValidShippingAddress(shippingAddress)) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    const orderItems = [];
    for (const reqItem of items) {
      const quantity = Number(reqItem.quantity || 1);
      const product = await Product.findById(reqItem.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${reqItem.productId} not found` });
      }
      if (product.stock < quantity) {
        return res.status(409).json({
          message: `Insufficient stock for ${product.title} (${product.stock} left)`
        });
      }
      orderItems.push({
        product: product._id,
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        mrp: product.mrp,
        quantity
      });
    }

    // Decrement stock after verifying every item is available
    for (const item of orderItems) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
    }

    const totals = calculateOrderTotals(orderItems);
    const paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'PAID';

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      orderStatus: 'PLACED',
      statusHistory: [{ status: 'PLACED', note: 'Order confirmed by seller' }],
      ...totals
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

router.get('/my', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/cancel', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    if (!canTransitionOrder(order.orderStatus, 'CANCELLED')) {
      return res.status(400).json({
        message: `Order cannot be cancelled once it is ${order.orderStatus}`
      });
    }

    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    }

    order.orderStatus = 'CANCELLED';
    if (order.paymentStatus === 'PAID') {
      order.paymentStatus = 'REFUNDED';
    }
    order.statusHistory.push({
      status: 'CANCELLED',
      note: req.body.reason || 'Cancelled by customer'
    });
    await order.save();

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwnerInDev =
      process.env.NODE_ENV !== 'production' && String(order.user) === String(req.user._id);
    if (req.user.role !== 'admin' && !isOwnerInDev) {
      return res.status(403).json({ message: 'Admin access required to update order status' });
    }

    if (!canTransitionOrder(order.orderStatus, status)) {
      return res.status(400).json({
        message: `Cannot transition order from ${order.orderStatus} to ${status}`
      });
    }

    order.orderStatus = status;
    if (status === 'DELIVERED' && order.paymentStatus === 'PENDING') {
      order.paymentStatus = 'PAID';
    }
    order.statusHistory.push({
      status,
      note: note || `Order moved to ${status.replace(/_/g, ' ')}`
    });
    await order.save();

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
