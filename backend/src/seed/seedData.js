const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

const SAMPLE_PRODUCTS = [
  {
    title: 'Pixel 9 Pro 5G (Obsidian, 256 GB)',
    description: 'Flagship smartphone with Tensor G4 processor, triple pro camera system, and 120Hz Super Actua display.',
    brand: 'Google',
    category: 'Mobiles',
    price: 79999,
    mrp: 99999,
    discountPercent: 20,
    rating: 4.7,
    reviewCount: 3420,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    highlights: ['16 GB RAM | 256 GB ROM', '6.3 inch LTPO OLED Display', '50MP + 48MP + 48MP Rear Camera', '4700 mAh Battery'],
    seller: 'SuperComNet'
  },
  {
    title: 'Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)',
    description: 'Built with Titanium frame, embedded S Pen, 200MP quad telephoto camera and Galaxy AI tools.',
    brand: 'Samsung',
    category: 'Mobiles',
    price: 109999,
    mrp: 134999,
    discountPercent: 19,
    rating: 4.8,
    reviewCount: 5190,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
    highlights: ['12 GB RAM | 256 GB ROM', '6.8 inch QHD+ AMOLED 120Hz', 'Snapdragon 8 Gen 3', '200MP Main Camera'],
    seller: 'VisionStar'
  },
  {
    title: 'MacBook Air M3 (13.6 inch, 16 GB, 512 GB SSD)',
    description: 'Ultra-thin aluminum laptop powered by Apple M3 chip with up to 18 hours battery life.',
    brand: 'Apple',
    category: 'Electronics',
    price: 114900,
    mrp: 134900,
    discountPercent: 15,
    rating: 4.9,
    reviewCount: 2180,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    highlights: ['16 GB Unified Memory', '512 GB NVMe SSD', 'Liquid Retina Display', 'MagSafe 3 Charging'],
    seller: 'TreasureHaul'
  },
  {
    title: 'WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry-leading active noise cancellation with 8 microphones, multipoint Bluetooth, and 30-hour battery.',
    brand: 'Sony',
    category: 'Electronics',
    price: 24990,
    mrp: 34990,
    discountPercent: 29,
    rating: 4.6,
    reviewCount: 4870,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    highlights: ['30 Hours Playback', 'Quick Charge 3 min = 3 hrs', 'Crystal Clear Hands-Free Calling', 'USB-C Charging'],
    seller: 'RetailNet'
  },
  {
    title: 'AirMax Pulse Running Shoes (Midnight Navy)',
    description: 'Breathable engineered mesh upper with responsive foam cushioning built for daily road runs.',
    brand: 'Nike',
    category: 'Fashion',
    price: 4495,
    mrp: 7995,
    discountPercent: 44,
    rating: 4.4,
    reviewCount: 1890,
    stock: 55,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    highlights: ['Lightweight Mesh Upper', 'High-Traction Rubber Sole', 'Cushioned Heel Collar'],
    seller: 'SportsHub'
  },
  {
    title: 'Classic Denim Trucker Jacket (Indigo Wash)',
    description: 'Regular fit 100% cotton stretch denim jacket suitable for everyday casual layering.',
    brand: 'Levis',
    category: 'Fashion',
    price: 2399,
    mrp: 4599,
    discountPercent: 48,
    rating: 4.3,
    reviewCount: 940,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=600&q=80',
    highlights: ['100% Cotton Denim', 'Button Flap Chest Pockets', 'Machine Washable'],
    seller: 'OmniTechRetail'
  },
  {
    title: 'Barista Pro Espresso & Cappuccino Maker (15 Bar)',
    description: 'Stainless steel home espresso machine with rapid thermoblock heating and milk frother wand.',
    brand: 'Philips',
    category: 'Appliances',
    price: 12999,
    mrp: 18995,
    discountPercent: 32,
    rating: 4.5,
    reviewCount: 780,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
    highlights: ['15 Bar Italian Pump', '1.5L Detachable Water Tank', '2 Years Brand Warranty'],
    seller: 'HomeLiving'
  },
  {
    title: 'Nordic Minimalist LED Desk Lamp with Wireless Charger',
    description: 'Touch-dimmable eye-care desk lamp with 3 color modes and integrated 15W Qi phone charger.',
    brand: 'Wipro',
    category: 'Home',
    price: 1899,
    mrp: 3499,
    discountPercent: 46,
    rating: 4.4,
    reviewCount: 1510,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    highlights: ['3 Color Temperatures', '15W Qi Wireless Pad', 'Foldable Aluminum Arm'],
    seller: 'BrightWorks'
  },
  {
    title: 'Smartwatch Series 9 GPS 45mm (Aluminum)',
    description: 'Always-on Retina display, heart rate & SpO2 tracking, crash detection and water resistance up to 50m.',
    brand: 'Apple',
    category: 'Electronics',
    price: 38900,
    mrp: 44900,
    discountPercent: 13,
    rating: 4.8,
    reviewCount: 2740,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    highlights: ['S9 SiP Dual-Core', '50m Water Resistant', 'Fast Charging USB-C'],
    seller: 'SuperComNet'
  },
  {
    title: '4K Ultra HD Smart Google TV (55 inch)',
    description: 'Bezel-less 4K HDR10+ display with Dolby Atmos 30W speakers and built-in Chromecast.',
    brand: 'Sony',
    category: 'Appliances',
    price: 49999,
    mrp: 74900,
    discountPercent: 33,
    rating: 4.6,
    reviewCount: 3115,
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
    highlights: ['3840 x 2160 4K UHD', 'Google TV OS', '3 HDMI | 2 USB Ports'],
    seller: 'VisionStar'
  }
];

/**
 * Seed initial users and catalog products if collections are empty.
 */
async function seedDatabaseIfEmpty() {
  const existingUsers = await User.countDocuments();
  if (existingUsers === 0) {
    const customerHash = await bcrypt.hash('demo1234', 10);
    const adminHash = await bcrypt.hash('admin1234', 10);

    await User.insertMany([
      {
        name: 'Aarav Sharma',
        email: 'customer@flipkart.dev',
        passwordHash: customerHash,
        role: 'customer',
        addresses: [
          {
            fullName: 'Aarav Sharma',
            phone: '9876543210',
            pincode: '560103',
            street: '42 Outer Ring Road, Bellandur',
            city: 'Bengaluru',
            state: 'Karnataka',
            label: 'Home'
          }
        ]
      },
      {
        name: 'Store Admin',
        email: 'admin@flipkart.dev',
        passwordHash: adminHash,
        role: 'admin',
        addresses: []
      }
    ]);
    console.log('[Seed] Created demo customer (customer@flipkart.dev / demo1234) and admin (admin@flipkart.dev / admin1234)');
  }

  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    await Product.insertMany(SAMPLE_PRODUCTS);
    console.log(`[Seed] Inserted ${SAMPLE_PRODUCTS.length} Flipkart catalog products`);
  }
}

module.exports = { seedDatabaseIfEmpty, SAMPLE_PRODUCTS };
