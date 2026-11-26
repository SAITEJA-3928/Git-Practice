require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { seedDatabaseIfEmpty } = require('./seedData');

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/flipkart_dev';
  await connectDB(mongoUri);
  await seedDatabaseIfEmpty();
  await mongoose.disconnect();
  console.log('[Seed] Completed.');
}

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
