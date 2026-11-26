const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const SORT_MAP = {
  relevance: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { rating: -1, reviewCount: -1 }
};

router.get('/', async (req, res, next) => {
  try {
    const { q, category, sort = 'relevance', minPrice, maxPrice } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (q && String(q).trim()) {
      const regex = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ title: regex }, { brand: regex }, { description: regex }, { category: regex }];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
    }

    const sortSpec = SORT_MAP[sort] || SORT_MAP.relevance;
    const products = await Product.find(filter).sort(sortSpec).lean();

    res.json({ products, total: products.length });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { title, description, brand, category, price, mrp, stock, imageUrl, highlights, seller } = req.body;
    const discountPercent = mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0;

    const product = await Product.create({
      title,
      description,
      brand,
      category,
      price,
      mrp,
      discountPercent,
      stock,
      imageUrl,
      highlights: highlights || [],
      seller
    });

    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
