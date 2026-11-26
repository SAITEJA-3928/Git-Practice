const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Mobiles', 'Electronics', 'Fashion', 'Home', 'Appliances']
    },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 99 },
    rating: { type: Number, default: 4.2, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 10, min: 0 },
    imageUrl: { type: String, required: true },
    highlights: [{ type: String }],
    seller: { type: String, default: 'SuperComNet' }
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', brand: 'text', category: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
